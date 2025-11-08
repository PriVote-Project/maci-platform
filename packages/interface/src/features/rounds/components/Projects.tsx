import clsx from "clsx";
import Link from "next/link";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Hex, zeroAddress } from "viem";
import { useAccount } from "wagmi";

import DepositButton from "~/components/DepositButton";
import { InfiniteLoading } from "~/components/InfiniteLoading";
import { SortFilter } from "~/components/SortFilter";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { StatusBar } from "~/components/ui/StatusBar";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useMyProjects } from "~/hooks/useProjects";
import { useRandomizedProjects } from "~/hooks/useRandomizedProjects";
import { useResults } from "~/hooks/useResults";
import { useRoundState } from "~/utils/state";
import { ERoundState, IRecipient } from "~/utils/types";

import { ImpactCategoryFilter } from "../../projects/components/ImpactCategoryFilter";
import { ProjectItem, ProjectItemAwarded } from "../../projects/components/ProjectItem";
import { useSearchProjects } from "../../projects/hooks/useProjects";
import { EProjectState } from "../../projects/types";

export interface IProjectsProps {
  pollId?: string;
}

export const Projects = ({ pollId = "" }: IProjectsProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isStatusBarDismissed, setIsStatusBarDismissed] = useState(false);

  const roundState = useRoundState({ pollId });

  const { address } = useAccount();

  const { getRoundByPollId } = useRound();
  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const projects = useSearchProjects({
    pollId,
    search: deferredSearchTerm,
    registryAddress: round?.registryAddress ?? zeroAddress,
  });

  const randomizedProjects = useRandomizedProjects(projects, pollId);

  const { isRegistered } = useMaci();
  const { addToBallot, removeFromBallot, ballotContains, getBallot } = useBallot();

  const results = useResults(
    pollId,
    (round?.registryAddress ?? zeroAddress) as Hex,
    (round?.tallyAddress ?? zeroAddress) as Hex,
  );

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const isMobile = useIsMobile();

  /**
   *  Find my projects: "I" am either the "creator" or the "payout address"
   */
  const myProjects = useMyProjects(round?.registryAddress ?? zeroAddress, address ?? zeroAddress);

  const myProjectsData = useMemo(() => myProjects.data, [myProjects]);

  const handleAction = useCallback(
    (projectIndex: number, projectId: string) => (e: Event) => {
      e.preventDefault();

      if (!pollId) {
        return;
      }

      if (!ballotContains(projectIndex, pollId)) {
        addToBallot(
          [
            {
              projectIndex,
              projectId,
              amount: 0,
            },
          ],
          pollId,
        );
      } else {
        removeFromBallot(projectIndex, pollId);
      }
    },
    [ballotContains, addToBallot, removeFromBallot, pollId],
  );

  const defineState = (projectIndex: number): EProjectState => {
    if (!isRegistered) {
      return EProjectState.UNREGISTERED;
    }
    if (ballotContains(projectIndex, pollId) && ballot.published && !ballot.edited) {
      return EProjectState.SUBMITTED;
    }
    if (ballotContains(projectIndex, pollId)) {
      return EProjectState.ADDED;
    }
    return EProjectState.DEFAULT;
  };

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const shouldShowProject = useCallback(
    (project: IRecipient) => {
      // If no categories are selected, show all projects
      if (selectedCategories.length === 0) {
        return true;
      }

      // Get impact categories from the project
      const { impactCategory } = project;

      // If project has no impact categories, don't show it when filtering
      if (!impactCategory || impactCategory.length === 0) {
        return false;
      }

      // Show project if it has any of the selected categories
      return selectedCategories.some((selectedCat) => impactCategory.includes(selectedCat));
    },
    [selectedCategories],
  );

  return (
    <div>
      {!isStatusBarDismissed && roundState === ERoundState.APPLICATION && (
        <StatusBar
          content={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />

              <span>Voting is disabled until the Application period ends.</span>
            </div>
          }
          status="default"
          onClose={() => {
            setIsStatusBarDismissed(true);
          }}
        />
      )}

      {!isStatusBarDismissed && (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS) && (
        <StatusBar
          content={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />

              <span>The voting period has ended.</span>
            </div>
          }
          status="default"
          onClose={() => {
            setIsStatusBarDismissed(true);
          }}
        />
      )}

      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
        <Heading as="h3" size="3xl">
          Projects
        </Heading>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
          {round?.tallyAddress &&
            (roundState === ERoundState.APPLICATION ||
              roundState === ERoundState.VOTING ||
              roundState === ERoundState.TALLYING) && (
              <DepositButton className="w-full sm:w-auto" tallyAddress={round.tallyAddress} />
            )}

          <div className="w-full sm:w-auto">
            <SortFilter onSearchChange={setSearchTerm} />
          </div>
        </div>
      </div>

      <ImpactCategoryFilter selectedCategories={selectedCategories} onCategoryClick={handleCategoryClick} />

      {roundState === ERoundState.APPLICATION && address && (
        <div className="mb-4 rounded-md border border-black p-4 dark:border-white">
          <div className="flex justify-between">
            <Heading size="xl">My Projects</Heading>

            <Link href={`/rounds/${pollId}/proposals/new`}>
              <Button size="auto" variant="primary">
                {isMobile ? "Create" : "Create Project Proposal"}
              </Button>
            </Link>
          </div>

          <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {myProjectsData &&
              myProjectsData.length > 0 &&
              myProjectsData.map((project) => (
                <ProjectItem
                  key={project.id}
                  showAppealButton
                  isLoading={false}
                  pollId={pollId}
                  recipient={project}
                  registryAddress={round?.registryAddress}
                />
              ))}

            {(!myProjectsData || myProjectsData.length === 0) && (
              <p className="text-gray-400">Create your project by clicking the button</p>
            )}
          </div>
        </div>
      )}

      <InfiniteLoading
        {...randomizedProjects}
        renderItem={(item: IRecipient, { isLoading }) => {
          if (!shouldShowProject(item)) {
            return null;
          }

          return (
            <div key={item.id} className={clsx("relative", { "animate-pulse": isLoading })}>
              {!results.isLoading && roundState === ERoundState.RESULTS ? (
                <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
              ) : null}

              <ProjectItem
                action={handleAction(Number.parseInt(item.index, 10), item.id)}
                isLoading={projects.isLoading}
                pollId={pollId}
                recipient={item}
                selectedCategories={selectedCategories}
                state={defineState(Number.parseInt(item.index, 10))}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          );
        }}
      />
    </div>
  );
};
