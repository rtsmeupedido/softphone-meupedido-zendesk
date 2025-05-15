import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PhoneOutlined, StopOutlined } from "@ant-design/icons";
import { removeConferenceCall } from "../../features/softphone/Call";
import useConference from "../../components/Dialler/hook/useConference";
import { mixAudioStreams } from "./functions/mixAudioStreams";
import { Tag, Button } from "rtk-ux";
import StopWatch from "../../components/CurrentCall/components/StopWatch";
import { useEffect, useState } from "react";
import { Loading } from "../../components/CustomSpinner/CustomSpinner";

const Conference = () => {
    const dispatch = useAppDispatch();
    const { setIsConferenceActive } = useConference();
    const conference = useAppSelector((state) => state.softphone.conferenceData);

    const [isMixing, setIsMixing] = useState(false);

    useEffect(() => {
        const mixAudio = async () => {
            if (conference.length > 1) {
                setIsMixing(true);
                try {
                    await mixAudioStreams(conference);
                } catch (error) {
                    console.error(" Erro ao mixar audios:", error);
                } finally {
                    setIsMixing(false);
                }
            }
        };

        mixAudio();
    }, [conference]);

    const handleHangUp = (conferenceCall: any) => {
        const id = conferenceCall.id;
        conferenceCall.terminate();
        dispatch(removeConferenceCall(id));
        setIsConferenceActive(false);
    };

    const handleUnhold = async (call: any) => {
        if (call.isOnHold().local || call.isOnHold().remote) {
            call.unhold();
        }
        setIsMixing(true);
        try {
            await mixAudioStreams(conference);
        } catch (error) {
            console.error("Erro ao mixar audios:", error);
        } finally {
            setIsMixing(false);
        }
    };

    if (isMixing) {
        return (
            <div className="flex-col justify-center items-center h-full">
                <Loading title="Iniciando conferência aguarde ..." />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Conferência</h2>
                <Tag color={"success"}>
                    <StopWatch datetime={new Date(conference[0].start_time)} isPaused={false} />
                </Tag>
            </div>
            <p className="mt-2 mb-2"> Participantes</p>
            {conference
                .filter((call) => call.isEstablished())
                .map((call) => {
                    const isOnHold = call.isOnHold().local || call.isOnHold().remote;
                    return (
                        <div key={call.id} className="flex items-center justify-between p-4 border-b border-gray-200">
                            <span className="text-lg font-semibold">{call.remote_identity.display_name || call.remote_identity.uri.user || "User not found"}</span>
                            <span>{call.isEstablished() ? "" : "ligando..."}</span>

                            {isOnHold && (
                                <Button onClick={() => handleUnhold(call)} type="default" icon={<StopOutlined />} className="text-green-500">
                                    <Tag>Despausar</Tag>
                                </Button>
                            )}
                            <div className="flex space-x-2">
                                <Button onClick={() => handleHangUp(call)} type="primary" danger icon={<PhoneOutlined />} />
                            </div>
                        </div>
                    );
                })}

            {conference.length > 1 && (
                <div className="flex justify-center">
                    <Button onClick={() => conference.forEach(handleHangUp)} type="primary" danger icon={<PhoneOutlined />} className="fixed  mt-60">
                        Encerrar conferência
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Conference;
