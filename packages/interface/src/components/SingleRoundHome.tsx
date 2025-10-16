import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

import ConnectButton from "~/components/ConnectButton";
import DepositButton from "~/components/DepositButton";
import { Info } from "~/components/Info";
import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useMaci } from "~/contexts/Maci";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useRoundState } from "~/utils/state";
import { ERoundState, type IRoundData } from "~/utils/types";

interface ISingleRoundHomeProps {
  round: IRoundData;
}

export const SingleRoundHome = ({ round }: ISingleRoundHomeProps): JSX.Element => {
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { isRegistered, isEligibleToVote } = useMaci();
  const isMobile = useIsMobile();
  const roundState = useRoundState({ pollId: round.pollId });

  useEffect(() => {
    const handleStart = (url: string) => {
      setNavigatingTo(url);
    };
    const handleComplete = () => {
      setNavigatingTo(null);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <div className="flex h-auto w-full flex-col items-center justify-center gap-4 px-2 pb-4 sm:h-[90vh]">
      <h1 className="mb-0 mt-4 max-w-[858px] text-center text-[40px] font-medium leading-[48px] text-[var(--brand-500)] sm:mt-0 sm:text-[80px] sm:leading-[96px] dark:bg-[radial-gradient(70.54%_70.54%_at_50%_50%,#fff_0%,rgba(255,255,255,0.57)_92.71%,rgba(255,255,255,0.6)_92.72%)] dark:bg-clip-text dark:text-transparent">
        {round.roundId}
      </h1>

      <p className="text-gray-400">{round.description}</p>

      {roundState !== ERoundState.DEFAULT && (
        <div className="flex flex-row flex-wrap items-center justify-center gap-3">
          {isMobile && (
            <div className="flex w-full justify-center">
              <ConnectButton showMobile />
            </div>
          )}

          <Button
            as={Link}
            disabled={navigatingTo === `/rounds/${round.pollId}`}
            href={`/rounds/${round.pollId}`}
            size="auto"
            variant="primary"
          >
            {(() => {
              if (navigatingTo === `/rounds/${round.pollId}`) {
                return (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Loading...
                  </>
                );
              }
              if (roundState === ERoundState.APPLICATION) {
                return "Add Project";
              }
              return "View Projects";
            })()}
          </Button>

          {roundState === ERoundState.RESULTS && (
            <Button
              as={Link}
              disabled={navigatingTo === `/rounds/${round.pollId}/result`}
              href={`/rounds/${round.pollId}/result`}
              size="auto"
              variant="primary"
            >
              {navigatingTo === `/rounds/${round.pollId}/result` ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                "View Results"
              )}
            </Button>
          )}

          {(roundState === ERoundState.APPLICATION ||
            roundState === ERoundState.VOTING ||
            roundState === ERoundState.TALLYING) && <DepositButton tallyAddress={round.tallyAddress} />}

          {isConnected &&
            isEligibleToVote &&
            !isRegistered &&
            (roundState === ERoundState.APPLICATION || roundState === ERoundState.VOTING) && <JoinButton />}
        </div>
      )}

      {(roundState === ERoundState.APPLICATION || roundState === ERoundState.VOTING) &&
        isConnected &&
        !isEligibleToVote && (
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
