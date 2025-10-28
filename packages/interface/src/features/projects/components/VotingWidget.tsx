import { useMemo, useCallback, useState } from "react";
import { useAccount } from "wagmi";

import { Button } from "~/components/ui/Button";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

import { EButtonState } from "../types";

interface IVotingWidgetProps {
  projectId: string;
  pollId: string;
  projectIndex: number;
}

export const VotingWidget = ({ projectId, pollId, projectIndex }: IVotingWidgetProps): JSX.Element => {
  const { ballotContains, removeFromBallot, addToBallot } = useBallot();
  const { address } = useAccount();
  const { isRegistered } = useMaci();

  const projectBallot = useMemo(() => ballotContains(projectIndex, pollId), [ballotContains, projectIndex]);
  const projectIncluded = useMemo(() => !!projectBallot, [projectBallot]);

  const isWalletConnected = !!address;
  const canVote = isWalletConnected && isRegistered;

  /**
   * buttonState
   * 0. this project is not included in the ballot before
   * 1. this project is included in the ballot before
   */
  const [buttonState, setButtonState] = useState<EButtonState>(
    projectIncluded ? EButtonState.ADDED : EButtonState.DEFAULT,
  );

  const handleRemove = useCallback(() => {
    removeFromBallot(projectIndex, pollId);
    setButtonState(0);
  }, [projectIndex, removeFromBallot]);

  const handleButtonAction = () => {
    if (!canVote) {
      return;
    }
    addToBallot([{ projectId, amount: 0, projectIndex }], pollId);
    if (buttonState === EButtonState.DEFAULT) {
      setButtonState(EButtonState.ADDED);
    } else {
      setButtonState(EButtonState.UPDATED);
    }
  };

  const getTooltipMessage = () => {
    if (!isWalletConnected) {
      return "Please connect your wallet to vote";
    }
    if (!isRegistered) {
      return "Please sign up before voting";
    }
    return "";
  };

  return (
    <div className="flex items-center justify-center gap-5">
      {projectIncluded && canVote && (
        <Button variant="inverted" onClick={handleRemove}>
          Remove from ballot
        </Button>
      )}

      {buttonState === EButtonState.DEFAULT && (
        <div className={`group relative ${!canVote ? "cursor-not-allowed" : ""}`}>
          <Button
            className={!canVote ? "pointer-events-none opacity-50" : ""}
            variant="inverted"
            onClick={handleButtonAction}
          >
            Add to ballot
          </Button>

          {!canVote && (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
              {getTooltipMessage()}

              <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
