import { MuiIcon as Icon } from "rtk-ux";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { ButtonStyleAccept, ButtonStyleDecline } from "./styles";
import { removeCall } from "../../features/softphone/Call";

export default function Calling() {
    const dispatch = useAppDispatch();
    const currentCalls: any = useAppSelector((state) => state.softphone.data);
    const currentCall = currentCalls[currentCalls.length - 1];

    const callerIdentity = currentCall.remote_identity.display_name || currentCall.remote_identity.uri.user || "Desconhecido";
    const queue = currentCall?._request?.headers?.["X-Queue"]?.[0]?.raw;

    const handleCallAction = (action: () => void, errorMessage: string) => {
        try {
            action();
        } catch (error) {
            console.error(errorMessage, error);
        }
    };

    const handleHangupClick = () => {
        handleCallAction(() => {
            currentCall.terminate();
            dispatch(removeCall(currentCall.id));
        }, "Erro ao tentar terminar a chamada:");
    };

    const handleAnswerClick = () => {
        handleCallAction(() => {
            currentCall.answer();
        }, "Erro ao tentar atender a chamada:");
    };

    if (!currentCall) return <div>Nenhuma chamada ativa.</div>;
    console.log(currentCall);
    return (
        <div className="flex flex-col overflow-hidden bg-[#F4F4F5] rounded-md w-full">
            <div className="p-4 gap-3 w-full flex flex-col">
                <span className="flex justify-center text-black text-xs font-light">Chamada entrante</span>
                <div className="flex justify-center text-black">{callerIdentity}</div>
                {queue && <div className="flex justify-center text-xs -mt-2">Fila: {queue}</div>}
            </div>
            <div className="flex items-center mt-3">
                <ButtonStyleDecline block size="large" onClick={handleHangupClick}>
                    <Icon icon={["mui", "phone_disabled"]} />
                </ButtonStyleDecline>
                <ButtonStyleAccept block size="large" onClick={handleAnswerClick}>
                    <Icon icon={["mui", "phone"]} />
                </ButtonStyleAccept>
            </div>
        </div>
    );
}
