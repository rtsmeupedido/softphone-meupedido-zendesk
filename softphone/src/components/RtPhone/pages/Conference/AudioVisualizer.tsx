import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream;
  width: number;
  height: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  width,
  height,
}: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      if (canvasCtx && canvas) {
        canvasCtx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          canvasCtx.fillStyle = "black";
          canvasCtx.fillRect(
            x,
            height - barHeight / 2,
            barWidth,
            barHeight / 2
          );

          x += barWidth + 1;
        }
      }
    };

    draw();

    return () => {
      audioContext.close();
    };
  }, [stream, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};
