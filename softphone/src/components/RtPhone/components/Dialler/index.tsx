import { useCallback, useEffect, useState } from "react";
import { WebSocketInterface, UA as UAService } from "jssip";
import { UA } from "jssip/lib/JsSIP";
import { RTCSessionEvent } from "jssip/lib/UA";
import { Container } from "../../styles/Dialler";
import { RTCSession } from "jssip/lib/RTCSession";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getPbxExtension, getTenantSettings, getTenantSettingsOrganizationsId } from "../../api";
import { addCall, removeCall, setCallMuted, setCallHolded, addToConference } from "../../features/softphone/Call";
import { setUserSession } from "../../features/softphone/Session";
import CurrentCall from "../CurrentCall";
import CallingIn from "../CallingIn";

import CallingOut from "../CallingInOut";
import { setPbxExtension, setTenantSettings } from "../../features/phoneSlice/phoneSlice";
import { useAuth } from "../../hooks/useAuth";
import { useZaf } from "../../hooks/useZaf";
import Home from "../../pages/Home";
import Conference from "../../pages/Conference/Conference";

import { Button, notification } from "rtk-ux";
import { Dispatch } from "redux";
import { setTicket } from "../../features/zendesk";

export default function Dialler() {
    const { organizationsId, setOriginator } = useAuth();
    const { zafClient } = useZaf();

    const dispatch = useAppDispatch();
    const pbxServer = useAppSelector((state) => state.session.data);
    const user = useAppSelector((state) => state.user.data);

    //Calls normais
    const currentCalls = useAppSelector((state) => state.softphone.data);

    //conference
    const conference = useAppSelector((state) => state.softphone.conferenceData);

    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [newCall, setNewCall] = useState(false);
    const [calling, setCalling] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tenantSettingsOrganizationsId, setTenantSettingsOrganizationsId] = useState<any>();

    const callAudio = new Audio("https://www.meupedi.do/softphone/audios/externov4.mp3");
    const callInAudio = new Audio("https://www.meupedi.do/softphone/audios/calling.mp3");

    const getUsersZendesk = (phone: string) => {
        return async (dispatch: Dispatch) => {
            try {
                const res: any = await zafClient?.request({
                    url: `/api/v2/users/search?query=phone:${phone}`,
                    httpCompleteResponse: true,
                    contentType: "application/json",
                    method: "GET",
                });

                if (res) {
                    dispatch(setTicket({ users: res?.responseJSON.users }));
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
    };

    //Nova função startCall teste
    const startCall = (phone: string) => {
        const newSession = pbxServer?.call(phone, {
            mediaConstraints: {
                audio: true,
                video: false,
            },
        });

        if (newSession) {
            newSession.connection.addEventListener("addstream", (e: any) => {
                const audio = document.createElement("audio");
                audio.srcObject = e.stream;
                audio.play();
            });

            newSession.on("failed", () => {
                if (newSession.direction === "outgoing" || newSession.direction === "incoming") {
                    dispatch(removeCall(newSession.id));
                }
            });

            for (const call of currentCalls) {
                if (newSession.direction === "incoming" || newSession.direction === "outgoing") {
                    if (call !== newSession) {
                        if (call.isEstablished()) {
                            dispatch(setCallHolded({ id: call.id, holded: true }));
                            setIsPaused(true);
                            call.hold();
                        }
                    }
                }
            }
        }
    };

    function playAudio() {
        callAudio.loop = true;
        callAudio.play();
    }

    function playAudioIn() {
        callInAudio.loop = true;
        callInAudio.play();
    }

    function resetAudio() {
        if (!callAudio.paused) {
            callAudio.pause();
            callAudio.currentTime = 0;
        }
        if (!callInAudio.paused) {
            callInAudio.pause();
            callInAudio.currentTime = 0;
        }
    }

    function clearAll() {
        callAudio.pause();
        callAudio.currentTime = 0;
        callInAudio.pause();
        callInAudio.currentTime = 0;
    }

    async function register(extension: string) {
        if (extension) {
            const fetchedPbxExtension = await getPbxExtension(extension);
            const fetchedTenantSettings = await getTenantSettings();
            dispatch(setPbxExtension(fetchedPbxExtension));
            dispatch(setTenantSettings(fetchedTenantSettings));

            const socket = new WebSocketInterface(`wss://${fetchedTenantSettings?.asterisk_host}:8089/ws`);
            const ua: UA = new UAService({
                sockets: [socket],
                uri: `sip:${fetchedPbxExtension.sip_user}@${fetchedTenantSettings?.asterisk_host}`,
                password: fetchedPbxExtension.sip_password,
            });
            new Promise((resolve) => {
                ua.on("connected", () => {
                    resolve(ua);
                });
                ua.on("disconnected", () => {
                    resolve(ua);
                });
                ua.on("registered", () => {
                    dispatch(setUserSession(ua));
                    resolve(ua);
                });
                ua.on("registrationFailed", () => {
                    resolve(ua);
                });
                ua.start();
            });
        }
    }

    const handleInitConference = async () => {
        if (currentCalls.length > 2) {
            notification.warning({
                message: "Limite de Chamadas",
                description: "A conferência só pode incluir até 2 chamadas.",
            });
            return;
        }

        setLoading(true);

        const call_01 = currentCalls[0];
        const call_02 = currentCalls[1];

        const ensureCallNotPaused = async (call: any) => {
            if (call.isOnHold()) {
                await call.unhold();
            }
        };

        try {
            await Promise.all([ensureCallNotPaused(call_01), ensureCallNotPaused(call_02)]);

            dispatch(addToConference([call_01, call_02]));
        } catch (error) {
            notification.error({
                message: "Erro na Conferência",
                description: "Ocorreu um erro ao tentar iniciar a conferência.",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTenantSettings = useCallback(async () => {
        if (!organizationsId) return;

        try {
            const response = await getTenantSettingsOrganizationsId(organizationsId);
            setTenantSettingsOrganizationsId(response);
        } catch (error) {
            return;
        }
    }, [organizationsId]);

    useEffect(() => {
        fetchTenantSettings();
    }, [fetchTenantSettings]);

    const isButtonAddConference = currentCalls.length > 1 && currentCalls.every((call: any) => call.isEstablished());

    const showHome = !calling && !currentCalls.find((e) => e.isEstablished()) && !newCall;
    useEffect(() => {
        if (user && user.extension?._id) {
            register(user.extension._id);
        }
        return () => {};
    }, [user]);

    useEffect(() => {
        if (!pbxServer) return;
        pbxServer.on("newRTCSession", (data: RTCSessionEvent) => {
            const remoteAudio = new window.Audio();
            remoteAudio.autoplay = true;
            remoteAudio.id = "rt-remote-audio-814";
            remoteAudio.crossOrigin = "anonymous";
            const originator = data.originator;
            if (originator) {
                setOriginator(originator);
            }
            const session: RTCSession = data.session;

            // Verifica se tem alguma chamada em andamento.
            const activeCall = currentCalls.find((call) => !call.holded && call !== session);

            dispatch(addCall(session));

            zafClient?.invoke("popover", "show");
            if (originator === "remote" && !activeCall) {
                playAudio();
            }
            if (originator === "local") {
                playAudioIn();
            }
            if (session.direction === "incoming") {
                setNewCall(true);
            }
            session.on("progress", function () {
                if (session.direction === "outgoing") {
                    setCalling(true);
                }
            });
            session.on("accepted", function () {
                if (session.direction === "incoming") {
                    setNewCall(false);

                    dispatch(getUsersZendesk(session?.remote_identity?.uri?.user));
                    resetAudio();
                }
                resetAudio();
            });
            session.on("confirmed", function () {
                if (activeCall) {
                    dispatch(setCallHolded({ id: activeCall.id, holded: true }));
                    setIsPaused(true);
                    activeCall.hold();
                }

                if (session.direction === "incoming") {
                    setNewCall(false);
                } else {
                    setCalling(false);
                }

                resetAudio();
            });
            session.on("muted", function () {
                dispatch(setCallMuted({ id: session.id, muted: true }));
                setIsMuted(true);
            });
            session.on("unmuted", function () {
                dispatch(setCallMuted({ id: session.id, muted: false }));
                setIsMuted(false);
            });
            session.on("hold", function () {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                dispatch(setCallHolded({ id: session.id, holded: true }));
                setIsPaused(true);
            });
            session.on("unhold", function () {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                dispatch(setCallHolded({ id: session.id, holded: false }));
                setIsPaused(false);
            });
            session.on("ended", () => {
                dispatch(removeCall(session.id));
                dispatch(setCallMuted({ id: session.id, muted: false }));
                dispatch(setCallHolded({ id: session.id, holded: false }));
                if (session.direction === "incoming") {
                    setNewCall(false);
                }
                resetAudio();
            });
            session.on("failed", function () {
                setCalling(false);
                setNewCall(false);
                clearAll();

                if (session.direction === "incoming" || session.direction === "outgoing") {
                    dispatch(removeCall(session.id));
                }
            });

            session.on("peerconnection", (e: any) => {
                const peerconnection = e.peerconnection;
                peerconnection.onaddstream = function (e: any) {
                    remoteAudio.srcObject = e.stream;
                    remoteAudio.play();
                };
                const remoteStream = new MediaStream();
                peerconnection.getReceivers().forEach(function (receiver: any) {
                    remoteStream.addTrack(receiver.track);
                });
            });
        });
    }, [pbxServer, currentCalls, conference]);

    return (
        <>
            {conference.length > 1 ? (
                <>
                    {newCall && <CallingIn />}
                    <Conference />
                </>
            ) : (
                <Container>
                    {calling && <CallingOut />}
                    {newCall && <CallingIn />}
                    {currentCalls.find((e) => e.isEstablished()) && (
                        <>
                            {tenantSettingsOrganizationsId?.enable_transfer_button && (
                                <div className="flex justify-start w-full mb-3">
                                    {isButtonAddConference && (
                                        <Button type="primary" onClick={handleInitConference} loading={loading} disabled={loading}>
                                            Iniciar Conferência
                                        </Button>
                                    )}
                                </div>
                            )}

                            <CurrentCall currentCalls={currentCalls} isPaused={isPaused} isMuted={isMuted} startCall={startCall} tenantSettingsOrganizationsId={tenantSettingsOrganizationsId} />
                        </>
                    )}
                    {showHome && <Home sendCall={startCall} />}
                </Container>
            )}
        </>
    );
}
