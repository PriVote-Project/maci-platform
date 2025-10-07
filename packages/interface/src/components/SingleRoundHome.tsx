import Link from "next/link";
import { useAccount } from "wagmi";

import DepositButton from "~/components/DepositButton";
import { Info } from "~/components/Info";
import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { useMaci } from "~/contexts/Maci";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useRoundState } from "~/utils/state";
import { ERoundState, type IRoundData } from "~/utils/types";

interface ISingleRoundHomeProps {
  round: IRoundData;
}

export const SingleRoundHome = ({ round }: ISingleRoundHomeProps): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered, isEligibleToVote } = useMaci();
  const isMobile = useIsMobile();
  const roundState = useRoundState({ pollId: round.pollId });

  return (
    <div className="flex h-auto w-full flex-col items-center justify-center gap-4 px-2 pb-4 sm:h-[90vh]">
      <h1 className="mb-0 mt-4 max-w-[858px] text-center text-[40px] font-medium leading-[48px] text-[var(--brand-500)] sm:mt-0 sm:text-[80px] sm:leading-[96px] dark:bg-[radial-gradient(70.54%_70.54%_at_50%_50%,#fff_0%,rgba(255,255,255,0.57)_92.71%,rgba(255,255,255,0.6)_92.72%)] dark:bg-clip-text dark:text-transparent">
        {round.roundId}
      </h1>

      <p className="text-gray-400">{round.description}</p>

      {roundState !== ERoundState.DEFAULT && (
        <div className="flex flex-row flex-wrap items-center justify-center gap-3">
          <Button as={Link} href={`/rounds/${round.pollId}`} size="auto" variant="primary">
            {roundState === ERoundState.APPLICATION ? "Add Project" : "View Projects"}
          </Button>

          {roundState === ERoundState.RESULTS && (
            <Button as={Link} href={`/rounds/${round.pollId}/result`} size="auto" variant="primary">
              View Results
            </Button>
          )}

          {(roundState === ERoundState.APPLICATION ||
            roundState === ERoundState.VOTING ||
            roundState === ERoundState.RESULTS) && <DepositButton tallyAddress={round.tallyAddress} />}

          {isConnected && isEligibleToVote && !isRegistered && <JoinButton />}
        </div>
      )}

      {roundState !== ERoundState.DEFAULT && isConnected && !isEligibleToVote && (
        <div className="mt-2 flex items-center justify-center">
          <JoinButton />
        </div>
      )}

      {roundState === ERoundState.DEFAULT && (
        <p className="text-gray-400">Round has not started yet. Please check back later.</p>
      )}

      {roundState !== ERoundState.DEFAULT && !isConnected && !isMobile && (
        <p className="text-gray-400">Connect your wallet to get started.</p>
      )}

      <Info showAppState pollId={round.pollId} showBallot={false} showRoundInfo={false} size="default" />
    </div>
  );
};
