import { Divider } from "rtk-ux";

import AgentInfo from "./components/AgentInfo";
import { PhoneComp } from "./components/PhonComp";

type Props = {
    sendCall: (n: string) => void;
};

const Home = ({ sendCall }: Props) => {
    return (
        <div className="flex flex-col gap-4 overflow-hidden">
            <div style={{ height: "calc(100% - 50px)" }} className="overflow-auto flex flex-col gap-4">
                <AgentInfo />
                <Divider className="my-1" />
                <PhoneComp sendCall={sendCall} />
            </div>
        </div>
    );
};

export default Home;
