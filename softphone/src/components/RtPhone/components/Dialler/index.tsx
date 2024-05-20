import { useCallback, useEffect, useState } from "react";
import { WebSocketInterface, UA as UAService } from "jssip";
import { UA } from "jssip/lib/JsSIP";
import { RTCSessionEvent } from "jssip/lib/UA";
import { Container } from "../../styles/Dialler";
import { RTCSession } from "jssip/lib/RTCSession";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import api, {
  getPbxExtension,
  getTenantSettings,
  getTenantSettingsOrganizationsId,
} from "../../api";
import { setUser } from "../../features/user/User";
import {
  addCall,
  removeCall,
  setCallMuted,
  setCallHolded,
  addToConference,
} from "../../features/softphone/Call";
import { setUserSession } from "../../features/softphone/Session";
import CurrentCall from "../CurrentCall";
import CallingIn from "../CallingIn";

import CallingOut from "../CallingInOut";
import { getUsersZendesk } from "../../utils";
import {
  setPbxExtension,
  setTenantSettings,
} from "../../features/phoneSlice/phoneSlice";
import { useAuth } from "../../hooks/useAuth";
import { useZaf } from "../../hooks/useZaf";
import Home from "../../pages/Home";
import Conference from "../../pages/Conference/Conference";

import { Button, notification } from "rtk-ux";

export default function Dialler() {
  const { user, organizationsId } = useAuth();
  const { zafClient } = useZaf();
  // const { isConferenceActive } = useConference();
  const dispatch = useAppDispatch();
  const pbxServer = useAppSelector((state) => state.session.data);

  //Calls normais
  const currentCalls = useAppSelector((state) => state.softphone.data);
  console.log("🚀 ~ Fila Calls:", currentCalls);

  //conference
  const conference = useAppSelector((state) => state.softphone.conferenceData);

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [newCall, setNewCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenantSettingsOrganizationsId, setTenantSettingsOrganizationsId] =
    useState<any>();

  const callAudio = new Audio("/audio/externov4.wav");
  const callInAudio = new Audio("/audio/calling.mp3");

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
        if (
          newSession.direction === "outgoing" ||
          newSession.direction === "incoming"
        ) {
          dispatch(removeCall(newSession.id));
        }
      });

      for (const call of currentCalls) {
        if (
          newSession.direction === "incoming" ||
          newSession.direction === "outgoing"
        ) {
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
    callAudio.play();
    callAudio.loop = true;
  }
  function playAudioIn() {
    callInAudio.play();
    callInAudio.loop = true;
  }
  function resetAudio() {
    callAudio.pause();
    callAudio.currentTime = 0;
    callInAudio.pause();
    callInAudio.currentTime = 0;
  }
  function clearAll() {
    callAudio.pause();
    callInAudio.pause();
    callAudio.currentTime = 0;
    callInAudio.currentTime = 0;
  }
  async function register(extension: string) {
    if (extension) {
      const fetchedPbxExtension = await getPbxExtension(extension);
      const fetchedTenantSettings = await getTenantSettings();
      dispatch(setPbxExtension(fetchedPbxExtension));
      dispatch(setTenantSettings(fetchedTenantSettings));

      const socket = new WebSocketInterface(
        `wss://${fetchedTenantSettings?.asterisk_host}:8089/ws`
      );
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

  useEffect(() => {
    if (user === null) return;
    api.get(`api/local_users/${user?._id}?field=_id`).then((res) => {
      const user = res?.data?.data;
      if (user && user.extension?._id) {
        register(user.extension._id);
        dispatch(setUser(res.data.data));
      }
    });
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
      const session: RTCSession = data.session;

      // Verifica se tem alguma chamada em andamento.
      const activeCall = currentCalls.find(
        (call) => !call.holded && call !== session
      );

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
        console.log("accepted");
        if (session.direction === "incoming") {
          setNewCall(false);
          dispatch(getUsersZendesk(session.remote_identity.uri.user));
          resetAudio();
        }
        resetAudio();
      });
      session.on("confirmed", function () {
        console.log("🚀 ~ confirmed:");

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
        console.log("🚀 ~ muted:");
        dispatch(setCallMuted({ id: session.id, muted: true }));
        setIsMuted(true);
      });
      session.on("unmuted", function () {
        console.log("🚀 ~ unmuted:");
        dispatch(setCallMuted({ id: session.id, muted: false }));
        setIsMuted(false);
      });
      session.on("hold", function (e) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const oring = e.originator;
        dispatch(setCallHolded({ id: session.id, holded: true }));
        setIsPaused(true);
      });
      session.on("unhold", function (e) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const oring = e.originator;
        dispatch(setCallHolded({ id: session.id, holded: false }));
        setIsPaused(false);
      });
      session.on("ended", () => {
        console.log("🚀 ~ ended:");
        dispatch(removeCall(session.id));
        dispatch(setCallMuted({ id: session.id, muted: false }));
        dispatch(setCallHolded({ id: session.id, holded: false }));
        if (session.direction === "incoming") {
          setNewCall(false);
        }
        resetAudio();
      });
      session.on("failed", function () {
        console.log("failed");
        setCalling(false);
        setNewCall(false);
        clearAll();

        if (
          session.direction === "incoming" ||
          session.direction === "outgoing"
        ) {
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

      session.on("refer", (e) => {
        if (session.direction === "incoming") {
          console.log("refer" + e);
        }
      });
    });
  }, [pbxServer, currentCalls, conference]);

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
      await Promise.all([
        ensureCallNotPaused(call_01),
        ensureCallNotPaused(call_02),
      ]);

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
      console.log("Error TenantSettings", error);
    }
  }, [organizationsId]);

  useEffect(() => {
    fetchTenantSettings();
  }, [fetchTenantSettings]);

  const isButtonAddConference =
    currentCalls.length > 1 &&
    currentCalls.every((call: any) => call.isEstablished());

  const showHome =
    !calling && !currentCalls.find((e) => e.isEstablished()) && !newCall;

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
                    <Button
                      type="primary"
                      onClick={handleInitConference}
                      loading={loading}
                      disabled={loading}
                    >
                      Iniciar Conferência
                    </Button>
                  )}
                </div>
              )}

              <CurrentCall
                currentCalls={currentCalls}
                isPaused={isPaused}
                isMuted={isMuted}
                startCall={startCall}
                tenantSettingsOrganizationsId={tenantSettingsOrganizationsId}
              />
            </>
          )}

          {showHome && <Home sendCall={startCall} />}
        </Container>
      )}
    </>
  );
}