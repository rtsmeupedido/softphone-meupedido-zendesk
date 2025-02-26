/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Col, Button, MuiIcon as Icon, Tag, Modal, Input, Progress, Tooltip, notification } from "rtk-ux";
import StopWatch from "./StopWatch";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { PhoneComp } from "../../../pages/Home/components/PhonComp";
import { PhonCompDTMF } from "./PhonCompDTMF";

interface CallCardProps {
    currentCall: any;
    isPaused?: any;
    isMuted?: any;
    startCall: any;
    index?: number;
    tenantSettingsOrganizationsId: any;
}

const CallCard = ({ currentCall, startCall, tenantSettingsOrganizationsId }: CallCardProps) => {
    const currentCalls = useAppSelector((state) => state.softphone.data);
    const onHoldStatus = currentCall.isOnHold();
    const paused = onHoldStatus.local || onHoldStatus.remote;

    const isMuted = useAppSelector((state) => {
        const call = state.softphone.data.find((call) => call.id === currentCall.id);

        return call ? call.muted || false : false;
    });

    const isHolded = useAppSelector((state) => {
        const call = state.softphone.data.find((call) => call.id === currentCall.id);
        return call ? call.holded || false : false;
    });

    const [isPhone, setIsPhone] = useState(false);
    const [isPhoneDTMF, setIsPhoneDTMF] = useState(false);
    const [isTransfeCal, setIsTranfeCall] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [transferStatus, setTransferStatus] = useState("");
    // @ts-ignore
    const [transferError, setTransferError] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isTooltipVisible, setIsTooltipVisible] = useState(true);
    const [progress, setProgress] = useState(0);
    // @ts-ignore
    const [holdedCallId, setHoldedCallId] = useState<string | null>(null);

    const toggleMute = (currentCall: any) => {
        if (currentCall?.muted) {
            currentCall.unmute();
        } else {
            currentCall.mute();
        }
    };

    const toggleBreak = (currentCall: any) => {
        const id = currentCall?.id;

        for (const call of currentCalls) {
            if (id === call?.id) {
                if (call?.holded) {
                    call.unhold();
                    setHoldedCallId(call.id);
                } else {
                    call.hold();
                    setHoldedCallId(call.id);
                }
            } else {
                call.hold();
                setHoldedCallId(call.id);
            }
        }
    };

    const onChangToSwitchOff = (currentCall: any) => {
        if (!currentCall) return;
        currentCall?.terminate();
    };

    const handleIsphone = () => {
        setIsPhone(!isPhone);
    };

    const handleIsphoneDTMF = () => {
        setIsPhoneDTMF(!isPhoneDTMF);
    };

    function onChangeNewCall() {
        setIsPhone(!isPhone);
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        if (/^\d*$/.test(value)) {
            setInputValue(value);
        }
    };

    const handleTransferConsult = (numberRamal: any, idCallActive: any) => {
        const callActive = currentCalls.find((call) => call.id === idCallActive);

        if (!callActive || !callActive.isEstablished()) {
            notification.error({
                message: "Erro na Transferência",
                description: "Nenhuma chamada ativa ou chamada não estabelecida.",
            });
            setProgress(0);
            setTransferStatus("");
            return;
        }

        const referSubscriber: any = callActive.refer(numberRamal);

        referSubscriber.on("requestSucceeded", () => {
            setTransferStatus("Transferência Aceita");
            setProgress(10);
        });

        referSubscriber.on("requestFailed", () => {
            notification.error({
                message: "Erro na Transferência",
                description: "Falha ao tentar realizar a transferência.",
                duration: 2,
            });
            setProgress(0);
            setTransferStatus("");
            setTransferError("Falha ao realizar a transferência");
        });

        referSubscriber.on("accepted", () => {
            setProgress(100);
            setTimeout(() => {
                notification.success({
                    message: "Transferência Realizada",
                    description: "Transferência realizada com sucesso.",
                    duration: 2,
                });
                setProgress(0);
                setTransferStatus("");
                callActive.terminate();
            }, 500);
        });

        referSubscriber.on("failed", (e: any) => {
            if (e.status_line?.status_code === 503 && e.status_line?.reason_phrase === "Service Unavailable") {
                notification.error({
                    message: "Ramal indisponível",
                    description: "Transferência não completada.",
                    duration: 2,
                });
            } else {
                notification.error({
                    message: "Erro na Transferência",
                    description: "Transferência não completada.",
                    duration: 2,
                });
            }
            setProgress(0);
            setTransferStatus("");
        });

        referSubscriber.on("progress", () => {
            setTransferStatus("Transferência em progresso...");
            setProgress((prevProgress) => (prevProgress + 10 <= 90 ? prevProgress + 10 : 90));
        });
    };

    const handleAssistedTransfer = (numberRamal: any) => {
        currentCall.sendDTMF("#", {
            transportType: "RFC2833",
        });
        setTimeout(() => {
            currentCall.sendDTMF(numberRamal, {
                transportType: "RFC2833",
            });
        }, 1000);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsButtonDisabled(false);
        }, 5000);

        const tooltipTimer = setTimeout(() => {
            setIsTooltipVisible(false);
        }, 10000);

        return () => {
            clearTimeout(timer);
            clearTimeout(tooltipTimer);
        };
    }, []);

    return (
        <>
            {transferStatus ? (
                <div>
                    <Progress type="circle" percent={progress} status="active" format={() => `${progress}%`} />
                </div>
            ) : (
                <>
                    <Col span={24}>
                        <div className="flex flex-col items-center gap-2">
                            {paused ? <div className="text-yellow-600">Ligação pausada</div> : "Ligação em andamento:"}
                            <span className="text-lg font-semibold">{currentCall?.remote_identity.display_name || currentCall?.remote_identity.uri.user || "User not found"}</span>
                            <Tag color={paused ? "gold" : "blue"}>{currentCall?.start_time ? <StopWatch isPaused={paused} datetime={currentCall?.start_time} /> : "00:00"}</Tag>
                        </div>
                    </Col>
                    <div className="flex gap-2 my-4">
                        {tenantSettingsOrganizationsId?.enable_mute_button && (
                            <Col>
                                <Tooltip title={isTooltipVisible ? "Ativo somente após 10 segundos" : `${isMuted ? "Ativar" : "Desativar"} microfone`}>
                                    <Button block type={currentCall?.muted ? "dashed" : "default"} onClick={() => toggleMute(currentCall)} disabled={isButtonDisabled} className={isButtonDisabled ? "cursor-not-allowed" : "pointer"}>
                                        <Icon icon={["mui", currentCall?.muted ? "mic" : "mic_off"]} color="brack" />
                                    </Button>
                                </Tooltip>
                            </Col>
                        )}
                        {tenantSettingsOrganizationsId?.enable_transfer_button && (
                            <Col>
                                <Tooltip title={"Transferir chamada"}>
                                    <Button block onClick={() => setIsTranfeCall(!isTransfeCal)}>
                                        <Icon icon={["mui", "phone_forwarded"]} color="brack" />
                                    </Button>
                                </Tooltip>
                            </Col>
                        )}
                        {tenantSettingsOrganizationsId?.enable_waitcall_button && (
                            <Col>
                                <Tooltip title={`${isHolded ? "Retomar" : "Pausar"} chamada`}>
                                    <Button block type={isHolded ? "dashed" : "default"} onClick={() => toggleBreak(currentCall)}>
                                        <Icon icon={["mui", isHolded ? "play_arrow" : "pause"]} color="brack" />
                                    </Button>
                                </Tooltip>
                            </Col>
                        )}
                        <Col>
                            <Tooltip title={"Teclado"}>
                                <Button block type={"default"} onClick={handleIsphoneDTMF}>
                                    <Icon icon={["mui", "keyboard"]} color="brack" />
                                </Button>
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title={"Nova chamada"}>
                                <Button block type={"default"} onClick={handleIsphone}>
                                    <Icon icon={["mui", "group_add"]} color="brack" />
                                </Button>
                            </Tooltip>
                        </Col>
                    </div>
                    <Col span={24} className="mb-2">
                        <Button block danger onClick={() => onChangToSwitchOff(currentCall)}>
                            Desligar
                        </Button>
                    </Col>
                    {isTransfeCal && (
                        <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full">
                            <Input placeholder="Digite o número" className="rounded-lg" value={inputValue} onChange={handleInputChange} />
                            <div className="flex justify-between">
                                <Button disabled={inputValue.length < 3} type="primary" className="flex-1 text-sm rounded-lg mr-2" onClick={() => handleTransferConsult(inputValue, currentCall.id)}>
                                    Direta
                                </Button>
                                <Button disabled={inputValue.length < 3} type="primary" className="flex-1 text-sm rounded-lg" onClick={() => handleAssistedTransfer(inputValue)}>
                                    Com consulta
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Modal centered={true} open={isPhone} onCancel={handleIsphone} footer={null} className="mt-20">
                <div className="mt-7">
                    <PhoneComp sendCall={startCall} onChangeNewCall={onChangeNewCall} />
                </div>
            </Modal>

            <Modal centered={true} open={isPhoneDTMF} onCancel={handleIsphoneDTMF} footer={null} className="mt-20">
                <div className="mt-7">
                    <PhonCompDTMF session={currentCall} />
                </div>
            </Modal>
        </>
    );
};

export default CallCard;
