/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import RtPhone from "./components/RtPhone";
import { ZafProvider } from "./components/RtPhone/hooks/useZaf";
// @ts-ignore
type ZafWindowClient = typeof window.ZAFClient;
type ZafClient = ReturnType<ZafWindowClient["init"]>;

function App() {
    const [zafClient, setZafClient] = useState<ZafClient | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            const zaf = window.ZAFClient.init();
            setZafClient(zaf);
        }

        return () => {};
    }, []);

    return (
        <ZafProvider zafClient={zafClient}>
            <RtPhone />
        </ZafProvider>
    );
}

export default App;
