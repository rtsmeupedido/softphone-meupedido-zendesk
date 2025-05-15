/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import RtPhone from "./components/RtPhone";
import { ZafProvider } from "./components/RtPhone/hooks/useZaf";
// @ts-ignore
type ZafWindowClient = typeof window.ZAFClient;
type ZafClient = ReturnType<ZafWindowClient["init"]>;

function App() {
    const [zafClient, setZafClient] = useState<ZafClient | null>(null);
    //
    useEffect(() => {
        const init = async () => {
            if (typeof window !== "undefined") {
                // @ts-ignore
                const zaf = window.ZAFClient.init();
                setZafClient(zaf);
                //@ts-ignore
                const t: any = await zaf?.get("viewport.size");
                if (t?.["viewport.size"].height <= 780) {
                    zaf?.invoke("resize", { height: (t?.["viewport.size"].height || 780) - 150 });
                }
            }
        };
        init();
        return () => {};
    }, []);

    return (
        <ZafProvider zafClient={zafClient}>
            <RtPhone />
        </ZafProvider>
    );
}

export default App;
