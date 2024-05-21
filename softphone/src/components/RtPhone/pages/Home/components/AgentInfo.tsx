import { Flex, Tag } from "rtk-ux";
import { useAppSelector } from "../../../store/hooks";

export default function AgentInfo() {
  const pbxServer = useAppSelector((state) => state.session.data);
  const pbxExtension = useAppSelector((state) => state.phone.pbxExtension);
  const user = useAppSelector((state) => state.user.data);

  return (
    <Flex direction="column" className="gap-2 text-sm">
      <Flex justify="space-between">
        Agente:
        <div>
          {pbxExtension?.number} - {user?.name}
        </div>
      </Flex>
      <Flex justify="space-between">
        E-mail:<div>{user?.Email}</div>
      </Flex>
      <Flex justify="space-between">
        Status:
        <Tag
          style={{ margin: 0 }}
          color={pbxServer?.status === 1 ? "success" : "error"}
        >
          {pbxServer?.status === 1 ? "Online" : "Offline"}
        </Tag>
      </Flex>
    </Flex>
  );
}
