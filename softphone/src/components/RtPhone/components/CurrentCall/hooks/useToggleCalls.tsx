import { useCallback, useState } from "react";
import { setActiveCall, setCallHolded } from "../../../features/softphone/Call";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

const useToggleCalls = () => {
  const dispatch = useAppDispatch();
  const currentCalls = useAppSelector((state) => state.softphone.data);

  const [isCallPaused, setIsCallPaused] = useState(false);

  const toggleBreak = useCallback(
    (call: any) => {
      const id = call?.id;
      const currentCall = currentCalls.find((call) => call.id === id);
      console.log("🚀 ~ useToggleCalls ~ currentCall:", currentCall);

      if (currentCall) {
        if (currentCall.holded) {
          console.log("Despausando a chamada:", currentCall);
          currentCall.unhold();
          dispatch(setCallHolded({ id: id, holded: false }));
          dispatch(setActiveCall(id));
          setIsCallPaused(false);
        } else {
          console.log("Pausando a chamada:", currentCall);
          currentCall.hold();
          dispatch(setCallHolded({ id: id, holded: true }));
          setIsCallPaused(true);
        }
      }
    },
    [dispatch, currentCalls]
  );

  return { toggleBreak, isCallPaused };
};

export default useToggleCalls;
