/* eslint-disable @typescript-eslint/no-unused-vars */
export const mixAudioStreams = (sessions: any) => {
  return new Promise<void>((resolve, reject) => {
    try {
      setTimeout(() => {
        const audioContext = new AudioContext();

        sessions.forEach((currentSession: any) => {
          const mixedOutput = audioContext.createMediaStreamDestination();

          sessions.forEach((session: any) => {
            if (session) {
              session.connection.getReceivers().forEach((receiver: any) => {
                if (receiver.track.kind === "audio") {
                  if (session !== currentSession) {
                    const source = audioContext.createMediaStreamSource(
                      new MediaStream([receiver.track])
                    );
                    source.connect(mixedOutput);
                  }
                }
              });
            }
          });

          currentSession.connection.getSenders().forEach((sender: any) => {
            if (sender.track.kind === "audio") {
              const source = audioContext.createMediaStreamSource(
                new MediaStream([sender.track])
              );
              source.connect(mixedOutput);
            }
          });

          const sender = currentSession.connection
            .getSenders()
            .find((sender: any) => sender.track.kind === "audio");
          if (sender) {
            sender.replaceTrack(mixedOutput.stream.getAudioTracks()[0]);
          }
        });

        const allReceivedTracks: any = [];
        sessions.forEach((session: any) => {
          if (session) {
            session.connection.getReceivers().forEach((receiver: any) => {
              if (receiver.track.kind === "audio") {
                allReceivedTracks.push(receiver.track);
              }
            });
          }
        });

        const mixedOutputGlobal: any =
          audioContext.createMediaStreamDestination();
        allReceivedTracks.forEach((track: any) => {
          const source = audioContext.createMediaStreamSource(
            new MediaStream([track])
          );
          source.connect(mixedOutputGlobal);
        });

        const remoteAudio: any = document.getElementById("conferenceAudio");
        if (remoteAudio) {
          remoteAudio.srcObject = mixedOutputGlobal.stream;
          remoteAudio.play();
        } else {
          return;
        }

        resolve(mixedOutputGlobal.stream);
      }, 3000);
    } catch (error) {
      console.error("Erro ao mixar audio streams:", error);
      reject(error);
    }
  });
};
