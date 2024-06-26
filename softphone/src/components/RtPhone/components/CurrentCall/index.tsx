import { Button, Col, Divider, Input, Row } from "rtk-ux";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ChangeEvent, useState } from "react";
import { useZaf } from "../../hooks/useZaf";
import CartListTicket from "./components/CartListTicket";
import CallCard from "./components/CallCard";
import { appendUser } from "../../features/zendesk";

interface NewContact {
  name: string;
  email: string;
  phone: string | number;
}

export default function CurrentCall({
  currentCalls,
  isPaused,
  isMuted,
  startCall,
  tenantSettingsOrganizationsId,
}: any) {
  const { zafClient }: any = useZaf();
  const dispatch = useAppDispatch();

  const ticket = useAppSelector((state) => state.zendesk.ticket);

  const [showNewUser, setShowNewUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newContactInfo, setNewContactInfo] = useState<any>({
    name: "",
    email: "",
  });

  //@ts-ignore
  const addUsersZendesk = (data: NewContact) => {
    return async (dispatch: any) => {
      try {
        const response = await zafClient?.request({
          url: `/api/v2/users`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            user: { ...data, role: "end-user" },
          }),
          httpCompleteResponse: true,
        });

        const responseJSON = response?.responseJSON;

        if (responseJSON && responseJSON.user) {
          dispatch(appendUser(responseJSON.user));
        }
      } catch (error: any) {
        throw new Error(error);
      }
    };
  };

  function onAddContact(currentCall: any) {
    if (currentCall?.remote_identity.uri.user) {
      dispatch(
        addUsersZendesk({
          ...newContactInfo,
          phone: currentCall?.remote_identity.uri.user,
        })
      );
      setShowNewUser(false);
    }
  }

  const handleOnUserClick = (userId: string) => {
    setSelectedUserId(userId);
    zafClient?.invoke("routeTo", "user", userId);
  };

  const handleBackClick = () => {
    setSelectedUserId(null);
  };

  return (
    <div className="flex flex-col gap-2 mt-2 pb-8">
      {currentCalls
        .filter((call: any) => call.isEstablished())
        .map((currentCall: any, index: any) => {
          return (
            <div className="" key={currentCall?.id || index}>
              <Row
                key={currentCall?.id || index}
                gutter={[8, 8]}
                justify={"center"}
                className="relative -mx-3"
              >
                {index > 0 && <Divider className="my-1" />}
                <CallCard
                  currentCall={currentCall}
                  key={currentCall.id}
                  isPaused={isPaused}
                  isMuted={isMuted}
                  startCall={startCall}
                  index={index}
                  tenantSettingsOrganizationsId={tenantSettingsOrganizationsId}
                />
                <Divider className="my-1" />
                {showNewUser ? (
                  <>
                    <Col span={24} className="font-semibold">
                      Novo contato:
                    </Col>
                    <Col span={24}>
                      <Input
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setNewContactInfo((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Nome"
                      />
                    </Col>
                    <Col span={24}>
                      <Input
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setNewContactInfo((prev: any) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="E-mail"
                      />
                    </Col>
                    <Col span={24}>
                      <Input
                        value={currentCall?.remote_identity.uri.user}
                        disabled
                        placeholder="Telefone"
                      />
                    </Col>
                    <Col span={12}>
                      <Button block onClick={() => setShowNewUser(false)}>
                        cancelar
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        block
                        type="primary"
                        onClick={() => onAddContact(currentCall)}
                      >
                        Adicionar contato
                      </Button>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col span={24}>
                      {selectedUserId ? (
                        <div className="user-detail">
                          {ticket?.users?.length &&
                            ticket?.users?.length > 0 &&
                            ticket.users.find(
                              (user) => user.id === selectedUserId
                            ) &&
                            ticket.users
                              .filter((user) => user.id === selectedUserId)
                              .map((user) => (
                                <CartListTicket
                                  key={user.id}
                                  handleBackClick={handleBackClick}
                                  userId={user.id}
                                />
                              ))}
                        </div>
                      ) : (
                        <>
                          {ticket?.users?.length &&
                          ticket?.users?.length > 0 &&
                          ticket?.users?.length > 0 ? (
                            <>
                              <Col span={24} className="mt-3">
                                <div className="mb-2">
                                  Foram encontrados estes contatos:
                                </div>
                                {ticket.users.map((user) => (
                                  <div
                                    key={user.id}
                                    className="bg-zinc-100 border border-zinc-100 p-2 px-3 rounded flex flex-col cursor-pointer hover:border-blue-600 transition-all mb-2"
                                    onClick={() => handleOnUserClick(user.id)}
                                  >
                                    <span>
                                      Nome: <strong>{user.name}</strong>
                                    </span>
                                    <span>
                                      Email: <strong>{user.email}</strong>
                                    </span>
                                    <span>
                                      Telefone: <strong>{user.phone}</strong>
                                    </span>
                                  </div>
                                ))}
                              </Col>
                            </>
                          ) : (
                            <Col
                              span={24}
                              className="text-center text-gray-500 text-xs"
                            >
                              Nenhum contato encontrado.
                            </Col>
                          )}

                          <Col span={24}>
                            <Button
                              className="mt-1 mb-2 w-full"
                              type="dashed"
                              onClick={() => setShowNewUser(true)}
                            >
                              Novo contato
                            </Button>
                          </Col>
                        </>
                      )}
                    </Col>
                  </>
                )}
              </Row>
            </div>
          );
        })}
    </div>
  );
}
