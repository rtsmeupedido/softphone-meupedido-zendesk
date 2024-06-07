import { useEffect, useState } from "react";
import axios from "axios";
import { Flex, Icon, Modal, Progress } from "rtk-ux";
import { Menu } from "antd";
import { useAppSelector } from "../../../store/hooks";

import {
  create,
  getPbxSettings,
  getUserStatus,
  list,
  update,
} from "../../../api";

export default function AgentInfo() {
  const pbxServer = useAppSelector((state) => state.session.data);
  const pbxExtension = useAppSelector((state) => state.phone.pbxExtension);
  const user = useAppSelector((state) => state.user.data);

  return (
    <div>
      <Flex direction="column" className="gap-2 text-sm">
        <Flex justify="space-between">
          Agente:
          <div className="flex items-center flex-1 justify-end gap-1.5">
            <Icon
              width={10}
              icon={["fas", "circle"]}
              className={
                pbxServer?.status === 1 ? "text-green-600" : "text-red-500"
              }
            />
            <div>
              {pbxExtension?.number} - {user?.name}
            </div>
          </div>
        </Flex>
        <Flex justify="space-between">
          E-mail:<div>{user?.Email}</div>
        </Flex>
        <Flex align="center" justify="space-between">
          Status:
          <AgentStatus />
        </Flex>
      </Flex>
    </div>
  );
}

const AgentStatus = () => {
  const user = useAppSelector((state) => state.user.data);
  const pbxExtension = useAppSelector((state) => state.phone.pbxExtension);
  const [updateQueueStatus, setUpdateQueueStatus] = useState<boolean>();
  const [queues, setQueues] = useState<any>();

  //---INIT---
  const init = async () => {
    if (!user._id) return;
    await list(
      "user_queues_softphone",
      {
        before_filter: { _id: user._id },
        custom_filter: [{ $match: { "teams.participants.users": user._id } }],
      },
      {},
      "query"
    )
      .then(async ({ data }) => {
        setQueues(data);
      })
      .catch(() => {
        return;
      });
  };

  useEffect(() => {
    async function fetchGetPbxSettings(organizationsid: string) {
      const fecth = await getPbxSettings(organizationsid);
      setUpdateQueueStatus(fecth?.enable_status_agent_update_queue);
    }
    fetchGetPbxSettings(user?.organizations_id);
  }, [user.organizations_id]);

  useEffect(() => {
    async function fetchGetUserStatus() {
      const response = await getUserStatus();

      setStatuses(response);
      const currentStatus = response.find(
        (status: any) => status._id === user.user_personal_status_id
      );
      if (currentStatus) {
        setSelectedStatus(currentStatus);
      }
    }
    fetchGetUserStatus();
  }, [user.user_personal_status_id]);

  useEffect(() => {
    if (user._id) {
      init();
    }
  }, [user._id]);

  const tenantSettings = useAppSelector((state) => state.phone.tenantSettings);
  const [statuses, setStatuses] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [info, setInfo] = useState<any>("");
  const [progress, setProgress] = useState<any>(0);

  async function sendAsterisk(json: any): Promise<boolean> {
    const config = {
      method: "post",
      url: `https://${tenantSettings.asterisk_host}:8080/action`,
      headers: {
        Authorization: `Bearer ${tenantSettings.asterisk_token}`,
        "Content-Type": "application/json",
      },
      data: json,
    };

    try {
      const res = await axios(config);
      if (res?.data?.return?.response === "Error") {
        await create("tenant_events", {
          type: "error",
          error: res?.data?.return,
        });
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  const handleChange = async (item: any) => {
    const uniqueOrgs = new Set(
      queues.map((item: any) => item?.organizations_id)
    );

    const typeEvent =
      user.status === "offline" && item.keyname === "available"
        ? "login"
        : item.keyname === "offline"
        ? "logoff"
        : item.keyname === "available"
        ? "unpause"
        : "pause";

    if (updateQueueStatus) {
      switch (typeEvent) {
        case "login":
          for (const q of uniqueOrgs) {
            sendAsterisk({
              action: "queuelog",
              data: {
                Queue: q,
                Event: "AGENTLOGINALL",
                Interface: user._id,
                Message: user.name,
              },
            });
          }
          for (const i in queues) {
            if (Object.hasOwnProperty.call(queues, i)) {
              const idx = parseInt(i);
              const el = queues[i];
              setInfo(`Logando filas (${idx + 1}/${queues.length})`);
              setProgress(((idx + 1) / queues.length) * 100);
              const res = await handleUserQueue(true, el);
              await sendAsterisk({
                action: "queuelog",
                data: {
                  Queue: `queue_${el._id}_${el.organizations_id}`,
                  Event: "AGENTLOGIN",
                  Uniqueid: "LOGIN",
                  Interface: user._id,
                  Message: user.name,
                },
              });
              if (!res) {
                return;
              } else {
                setInfo("");
                if (progress === 100) {
                  setModalVisible(false);
                }
                setProgress(0);
              }
            }
          }
          break;
        case "pause": {
          for (const q of uniqueOrgs) {
            sendAsterisk({
              action: "queuelog",
              data: {
                Queue: q,
                Event: "AGENTPAUSEALL",
                Interface: user._id,
                Message: item._id,
              },
            });
          }
          const res = await sendAsterisk({
            action: "QueuePause",
            data: {
              interface: `PJSIP/${pbxExtension.sip_user}`,
              paused: 1,
              reason: item._id,
            },
          });
          if (!res) {
            return;
          }
          break;
        }
        case "unpause": {
          for (const q of uniqueOrgs) {
            sendAsterisk({
              action: "queuelog",
              data: {
                Queue: q,
                Event: "AGENTUNPAUSEALL",
                Interface: user._id,
                Message: user?.name,
              },
            });
          }
          const res = await sendAsterisk({
            action: "QueuePause",
            data: {
              interface: `PJSIP/${pbxExtension.sip_user}`,
              paused: 0,
            },
          });
          if (!res) {
            return;
          }
          break;
        }
        case "logoff":
          for (const q of uniqueOrgs) {
            sendAsterisk({
              action: "queuelog",
              data: {
                Queue: q,
                Event: "AGENTLOGOFFALL",
                Interface: user._id,
                Message: user.name,
              },
            });
          }
          for (const i in queues) {
            if (Object.hasOwnProperty.call(queues, i)) {
              const el = queues[i];
              const idx = parseInt(i);
              setInfo(`Deslogando filas (${idx + 1}/${queues.length})`);
              setProgress(((idx + 1) / queues.length) * 100);

              const res = await handleUserQueue(false, el);
              await sendAsterisk({
                action: "queuelog",
                data: {
                  Queue: `queue_${el._id}_${el.organizations_id}`,
                  Event: "AGENTLOGOFF",
                  Uniqueid: "LOGOFF",
                  Interface: user._id,
                  Message: user.name,
                },
              });
              if (!res) {
                return;
              } else {
                if (progress === 100) {
                  setModalVisible(false);
                }
                setProgress(0);
                setInfo("");
              }
            }
          }
          break;
        default:
          break;
      }
    }
    try {
      const upUser = {
        _id: user._id,
        user_personal_status_id: item._id,
        status: item.keyname || undefined,
        status_email: item.keyname,
        status_voice: item.keyname,
        status_chat: item.keyname,
      };

      await update("local_users", upUser);
    } catch (error) {
      console.error(error);
    }
    setModalVisible(false);
    setSelectedStatus(item);
  };
  const handleUserQueue = async (value: any, queue: any) => {
    let json = {};
    let sendJson = {};
    switch (value) {
      case true:
        json = {
          action: "QueueAdd",
          data: {
            queue: `queue_${queue._id}_${queue.organizations_id}`,
            interface: `PJSIP/${pbxExtension.sip_user}`,
            penalty: queue.priority,
            paused: 0,
            MemberName: user._id,
          },
        };
        sendJson = {
          action: "queuelog",
          data: {
            Queue: `queue_${queue._id}_${queue.organizations_id}`,
            Event: "AGENTLOGIN",
            Uniqueid: "LOGIN",
            Interface: user._id,
            Message: user?.name,
          },
        };
        break;
      case false:
        json = {
          action: "QueueRemove",
          data: {
            queue: `queue_${queue._id}_${queue.organizations_id}`,
            interface: `PJSIP/${pbxExtension.sip_user}`,
          },
        };
        sendJson = {
          action: "queuelog",
          data: {
            Queue: `queue_${queue._id}_${queue.organizations_id}`,
            Event: "AGENTLOGOFF",
            Uniqueid: "LOGOFF",
            Interface: user._id,
            Message: user?.name,
          },
        };
        break;
      default:
        break;
    }
    await sendAsterisk(sendJson);
    const result = await sendAsterisk(json);
    return result;
  };
  const menu = (
    <Menu className="w-60 text-sm border-none">
      {["Disponível", "Ocupado", "Offline"].map((group) => (
        <Menu.ItemGroup
          key={group}
          title={<div className="text-slate-800 -ml-3">{group}</div>}
        >
          {statuses
            .filter((status: any) => status.group === group)
            .map((status: any, indx: any) => (
              <Menu.Item
                key={status._id || indx}
                className={`flex items-center justify-center p-2 m-1 rounded-md font-medium transition-opacity ${
                  status.color === "#FFFFFF" ? "bg-gray-200 text-gray-800" : ""
                } ${
                  selectedStatus && selectedStatus.name === "Indisponível"
                    ? status.name === "Disponível"
                      ? "cursor-pointer hover:opacity-75"
                      : "cursor-not-allowed bg-opacity-90"
                    : "cursor-pointer hover:opacity-75"
                } ${
                  selectedStatus &&
                  selectedStatus.group === "Offline" &&
                  group === "Ocupado"
                    ? "bg-red-300 cursor-not-allowed"
                    : ""
                }`}
                style={{
                  backgroundColor: status.color,
                  color:
                    selectedStatus && selectedStatus.name === "Indisponível"
                      ? status.name === "Disponível"
                        ? "white"
                        : "white"
                      : "white",
                }}
                data-keyname={status._id}
                onClick={() =>
                  selectedStatus && selectedStatus.name === "Indisponível"
                    ? status.name === "Disponível"
                      ? handleChange(status)
                      : null
                    : handleChange(status)
                }
              >
                {status.name}
              </Menu.Item>
            ))}
        </Menu.ItemGroup>
      ))}
    </Menu>
  );
  const getButtonBgClass = (status: any) => {
    if (!status) return "bg-gray-100";
    switch (status.group) {
      case "Disponível":
        return "bg-green-500";
      case "Ocupado":
        return "bg-red-500";
      case "Offline":
        return "bg-gray-200";
      default:
        return "bg-gray-100";
    }
  };
  const getIconColorClass = (status: any) => {
    if (!status) return "#DCDCDC";
    switch (status.group) {
      case "Disponível":
        return "#ffffff";
      case "Ocupado":
        return "#ffffff";
      case "Offline":
        return "#000000";
      default:
        return "#DCDCDC";
    }
  };
  const buttonBgClass = getButtonBgClass(selectedStatus);
  const iconColorClass = getIconColorClass(selectedStatus);

  return (
    <div className="w-full">
      <button
        onClick={() => setModalVisible(true)}
        className={`px-2 hover:brightness-95 py-1 flex items-center ml-auto justify-center rounded-md text-sm whitespace-nowrap cursor-pointer ${buttonBgClass}`}
      >
        <Icon
          icon={["far", "user-headset"]}
          className="mr-2"
          color={iconColorClass}
        />
        <span style={{ color: iconColorClass }}>
          {selectedStatus?.name || "Selecione o Status"}
        </span>
        <Icon
          icon={["fas", "caret-down"]}
          className="ml-2"
          color={iconColorClass}
        />
      </button>
      <Modal
        title={!info && "Selecione o Status"}
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered={true}
      >
        {info && (
          <div className="h-[500px] w-full left-0 p-2 bg-white rounded flex items-center flex-col justify-center gap-2">
            <span>{info}</span>
            <Progress type="circle" percent={progress} />
          </div>
        )}
        {!info && menu}
      </Modal>
    </div>
  );
};
