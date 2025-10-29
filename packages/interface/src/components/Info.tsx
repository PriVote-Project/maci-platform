import { useRouter } from "next/router";
import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { useRound } from "~/contexts/Round";
import { cn } from "~/utils/classNames";
import { useRoundState } from "~/utils/state";
import { EInfoCardState, ERoundState } from "~/utils/types";

import { ApplicationInfo } from "./ApplicationInfo";
import { BallotOverview } from "./BallotOverview";
import { InfoCard } from "./InfoCard";
import { RoundInfo } from "./RoundInfo";
import { VotingInfo } from "./VotingInfo";

const InfoContainer = createComponent(
  "div",
  tv({
    base: "flex justify-center gap-4 rounded-[12px] p-5 overflow-hidden bg-white dark:bg-[var(--glass-bg-08)] backdrop-blur-md border border-[var(--glass-stroke)] text-[var(--text-primary)]",
    variants: {
      size: {
        sm: "flex-col",
        default: "flex-col max-lg:w-full xl:flex-row xl:w-fit",
      },
    },
  }),
);

interface IInfoProps {
  size: string;
  pollId: string;
  showRoundInfo?: boolean;
  showAppState?: boolean;
  showBallot?: boolean;
}

export const Info = ({
  size,
  pollId,
  showRoundInfo = false,
  showAppState = false,
  showBallot = false,
}: IInfoProps): JSX.Element => {
  const roundState = useRoundState({ pollId });

  const { getRoundByPollId } = useRound();
  const round = getRoundByPollId(pollId);
  const { asPath } = useRouter();

  const steps = [
    {
      label: "application",
      state: ERoundState.APPLICATION,
      start: round?.startsAt ? new Date(round.startsAt) : new Date(),
      end: round?.registrationEndsAt ? new Date(round.registrationEndsAt) : new Date(),
    },
    {
      label: "voting",
      state: ERoundState.VOTING,
      start: round?.registrationEndsAt ? new Date(round.registrationEndsAt) : new Date(),
      end: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
    },
    {
      label: "tallying",
      state: ERoundState.TALLYING,
      start: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
      end: round?.votingEndsAt
        ? new Date(new Date(round.votingEndsAt).getTime() + 2 * 24 * 60 * 60 * 1000)
        : new Date(),
    },
    {
      label: "results",
      state: ERoundState.RESULTS,
      start: round?.votingEndsAt
        ? new Date(new Date(round.votingEndsAt).getTime() + 2 * 24 * 60 * 60 * 1000)
        : new Date(),
      end: undefined, // No end date - results are permanent
    },
  ];

  return (
    <div className="flex flex-col justify-center gap-5">
      <InfoContainer size={size}>
        {showRoundInfo && <RoundInfo roundId={round?.roundId ?? ""} />}

        {showBallot && <BallotOverview pollId={pollId} title={asPath.includes("ballot") ? "Summary" : undefined} />}

        {showRoundInfo && roundState === ERoundState.APPLICATION && <ApplicationInfo pollId={pollId} />}

        {showRoundInfo && roundState === ERoundState.VOTING && <VotingInfo pollId={pollId} />}

        <div
          className={cn("flex flex-col gap-[10px]", {
            "w-full": size === "sm",
            "mx-auto max-lg:w-full xl:w-fit xl:flex-row": size === "default",
          })}
        >
          {showAppState &&
            steps.map((step) => (
              <InfoCard
                key={step.label}
                end={step.end}
                start={step.start}
                state={defineState({ state: step.state, roundState })}
                title={step.label}
              />
            ))}
        </div>
      </InfoContainer>
    </div>
  );
};

function defineState({ state, roundState }: { state: ERoundState; roundState: ERoundState }): EInfoCardState {
  const statesOrder = [ERoundState.APPLICATION, ERoundState.VOTING, ERoundState.TALLYING, ERoundState.RESULTS];
  const currentStateOrder = statesOrder.indexOf(state);
  const appStateOrder = statesOrder.indexOf(roundState);

  if (currentStateOrder < appStateOrder) {
    return EInfoCardState.PASSED;
  }

  if (currentStateOrder === appStateOrder) {
    return EInfoCardState.ONGOING;
  }

  return EInfoCardState.UPCOMING;
}
