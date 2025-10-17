import { useState, useMemo } from "react";
import { useHarmonicIntervalFn } from "react-use";

import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { calculateTimeLeft } from "~/utils/time";

import { TimeSlot } from "./TimeSlot";

interface IApplicationInfoProps {
  pollId: string;
}

export const ApplicationInfo = ({ pollId }: IApplicationInfoProps): JSX.Element => {
  const { isLoading } = useMaci();
  const { getRoundByPollId } = useRound();
  const [timeLeft, setTimeLeft] = useState<[number, number, number, number]>([0, 0, 0, 0]);

  const applicationEndsAt = useMemo(() => {
    const round = getRoundByPollId(pollId);
    return round?.registrationEndsAt ? new Date(round.registrationEndsAt) : new Date();
  }, [getRoundByPollId, pollId]);

  useHarmonicIntervalFn(() => {
    setTimeLeft(calculateTimeLeft(applicationEndsAt));
  }, 1000);

  const hasEnded = applicationEndsAt.getTime() < Date.now();

  return (
    <div className="flex w-full flex-col">
      <h4 className="font-sans text-base font-normal uppercase text-gray-400">Application Ends</h4>

      {isLoading && <p className="dark:text-white">Loading...</p>}

      {!isLoading && hasEnded && <p className="dark:text-white">Application period has ended</p>}

      {!isLoading && !hasEnded && (
        <div className="flex gap-[14px] dark:text-white">
          <TimeSlot num={timeLeft[0]} unit="Days" />

          <TimeSlot num={timeLeft[1]} unit="Hours" />

          <TimeSlot num={timeLeft[2]} unit="Minutes" />

          <TimeSlot num={timeLeft[3]} unit="Seconds" />
        </div>
      )}
    </div>
  );
};
