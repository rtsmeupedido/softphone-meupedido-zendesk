import { useEffect } from "react";
import { useStopwatch } from "react-timer-hook";

type Props = {
  datetime: Date | undefined;
  isPaused: boolean;
};

export default function StopWatch({ datetime, isPaused }: Props) {
  const { seconds, minutes, hours, days, pause, start } = useStopwatch({
    autoStart: true,
    offsetTimestamp: datetime,
  });

  useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      start();
    }
    return () => {};
  }, [isPaused]);

  return (
    <div className="stopwatch">
      {days > 0 ? `${days}d:` : ""}
      {hours > 0 ? hours : ""}
      {minutes > 9 ? minutes : `0${minutes}`}:
      {seconds > 9 ? seconds : `0${seconds}`}
    </div>
  );
}
