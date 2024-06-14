import { useCallback, useState } from "react";
// @ts-ignore
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

      if (currentCall) {
        if (currentCall.holded) {
          currentCall.unhold();
          dispatch(setCallHolded({ id: id, holded: false }));
          dispatch(setActiveCall(id));
          setIsCallPaused(false);
        } else {
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
