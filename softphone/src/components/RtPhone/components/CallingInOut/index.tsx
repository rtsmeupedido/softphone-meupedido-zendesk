import { MuiIcon as Icon } from "rtk-ux";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import RoundedButton from "../RoundedButton";
import { removeCall } from "../../features/softphone/Call";

export default function CallingOut() {
  const dispatch = useAppDispatch();
  const currentCalls: any = useAppSelector((state) => state.softphone.data);
  const currentCall: any = currentCalls[currentCalls.length - 1];

  function handleEndeCall() {
    dispatch(removeCall(currentCall.id));
    currentCall?.terminate();
  }

  const isMt = currentCalls.length > 0;
  const isMarginTop = currentCalls.length === 0;
  return (
    <div
      className={`flex ${
        isMarginTop ? "mt-44" : "mt-0"
      } h-full flex-col items-center justify-center gap-4 ${
        isMt ? "mt-4" : "mt-0"
      } ${isMt ? "mb-4" : "mb-0"}`}
    >
      Chamando:{" "}
      {currentCall?.remote_identity.display_name ||
        currentCall?.remote_identity.uri.user ||
        "Deconhecido"}
      <RoundedButton theme="danger" onClick={handleEndeCall}>
        <Icon icon={["mui", "phone_enabled"]} />
      </RoundedButton>
    </div>
  );
}
