import { useEffect, useState } from "react";
import RtPhone from "./components/RtPhone";
import { ZafProvider } from "./components/RtPhone/hooks/useZaf";
type ZafWindowClient = typeof window.ZAFClient;
type ZafClient = ReturnType<ZafWindowClient["init"]>;

function App() {
  const [zafClient, setZafClient] = useState<ZafClient | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
