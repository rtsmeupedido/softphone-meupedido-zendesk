import { useState, useEffect } from "react";
import { useAppSelector } from "../../../store/hooks";

function useConference() {
  const conference = useAppSelector((state) => state.softphone.conferenceData);
  const [isConferenceActive, setIsConferenceActive] = useState<boolean>(false);

  useEffect(() => {
    setIsConferenceActive(conference.length > 0);
  }, [conference, isConferenceActive]);

  return { isConferenceActive, setIsConferenceActive };
}

export default useConference;
