import { Divider } from "rtk-ux";

import AgentInfo from "./components/AgentInfo";
import { PhoneComp } from "./components/PhonComp";
import { useZaf } from "../../hooks/useZaf";
import { useEffect, useState } from "react";

type Props = {
    sendCall: (n: string) => void;
};

const Home = ({ sendCall }: Props) => {
    const { zafClient } = useZaf();
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        const getScreen = async () => {
            const t: any = await zafClient?.get("viewport.size");
            if (t?.["viewport.size"].height <= 780) {
                setMinimized(true);
            } else {
                setMinimized(false);
            }
        };
        getScreen();
        return () => {};
    }, []);
    return (
        <div className="flex flex-col gap-4 h-full">
            <AgentInfo minimized={minimized} />
            <Divider className="my-0" />
            <PhoneComp sendCall={sendCall} minimized={minimized} />
        </div>
    );
};

export default Home;
