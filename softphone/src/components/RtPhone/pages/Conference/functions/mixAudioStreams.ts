/* eslint-disable @typescript-eslint/no-unused-vars */
export const mixAudioStreams = (sessions: any) => {
  return new Promise<void>((resolve, reject) => {
    console.log("Iniciando mixagem de audio...");

    try {
      setTimeout(() => {
        const audioContext = new AudioContext();
        // console.log("AudioContext criado com sucesso.");

        sessions.forEach((currentSession: any) => {
          // console.log(`Processando sessão ${index + 1}/${sessions.length}`);
          const mixedOutput = audioContext.createMediaStreamDestination();

          sessions.forEach((session: any) => {
            if (session) {
              // console.log(
              //   `  Processando sessão interna ${innerIndex + 1}/${
              //     sessions.length
              //   }`
              // );
              session.connection.getReceivers().forEach((receiver: any) => {
                if (receiver.track.kind === "audio") {
                  // console.log("    Recebendo track de áudio.");
                  if (session !== currentSession) {
                    const source = audioContext.createMediaStreamSource(
                      new MediaStream([receiver.track])
                    );
                    source.connect(mixedOutput);
                    // console.log(
                    //   "    Conectando track de áudio ao mixedOutput."
                    // );
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
              // console.log(
              //   "Conectando track de áudio do sender ao mixedOutput."
              // );
            }
          });

          const sender = currentSession.connection
            .getSenders()
            .find((sender: any) => sender.track.kind === "audio");
          if (sender) {
            sender.replaceTrack(mixedOutput.stream.getAudioTracks()[0]);
            // console.log("Track de áudio substituída no sender.");
          }
        });

        const allReceivedTracks: any = [];
        sessions.forEach((session: any) => {
          if (session) {
            session.connection.getReceivers().forEach((receiver: any) => {
              if (receiver.track.kind === "audio") {
                allReceivedTracks.push(receiver.track);
                // console.log(`Track de áudio recebida da sessão ${index + 1}`);
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
          // console.log(
          //   `Track de áudio ${index + 1} conectada ao mixedOutputGlobal.`
          // );
        });

        const remoteAudio: any = document.getElementById("conferenceAudio");
        if (remoteAudio) {
          remoteAudio.srcObject = mixedOutputGlobal.stream;
          remoteAudio.play();
          // console.log("Áudio remoto configurado e reproduzido.");
        } else {
          // console.error("Elemento de áudio remoto não encontrado.");
        }

        console.log("Mixagem de audio finalizada com sucesso.");
        console.log("Todas as chamadas de conferencia mixadas", sessions);
        // resolve();
        resolve(mixedOutputGlobal.stream);
      }, 3000); // Simulando delay de 3 segundos
    } catch (error) {
      console.error("Erro ao mixar audio streams:", error);
      reject(error);
    }
  });
};
