import { useMemo, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { StatusBar } from "~/components/ui/StatusBar";
import { useRound } from "~/contexts/Round";
import { AppealButton } from "~/features/projects/components/AppealButton";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById, useProjectMetadata } from "~/features/projects/hooks/useProjects";
import { ReviewBar } from "~/features/proposals/components/ReviewBar";
import { useChangeRequestByRecipientIndex } from "~/hooks/useRequests";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState, IRecipient } from "~/utils/types";

import type { GetServerSideProps } from "next";

export interface IProjectDetailsProps {
  pollId: string;
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "", pollId }: IProjectDetailsProps): JSX.Element => {
  const [isStatusBarDismissed, setIsStatusBarDismissed] = useState(false);

  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const project = useProjectById(projectId, round?.registryAddress ?? zeroAddress);
  const metadata = useProjectMetadata(project.data?.metadataUrl ?? "");

  const roundState = useRoundState({ pollId });

  const edition = useChangeRequestByRecipientIndex(round?.registryAddress ?? zeroAddress, project.data?.index ?? ""); // both approved or pending request could have edition

  const hasEdition = useMemo(() => edition.data && edition.data.status.toString() === "Pending", [edition]);

  const isDeleted = useMemo(() => project.data?.deleted === true, [project]);

  const { chain } = useAccount();

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo pollId={pollId} sidebar="left">
      {roundState === ERoundState.APPLICATION && !isDeleted && chain && (
        <ReviewBar
          edition={hasEdition ? edition.data?.recipient.id : undefined}
          pollId={pollId}
          projectId={projectId}
        />
      )}

      {!isStatusBarDismissed && isDeleted && (
        <StatusBar
          content={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />

              <span>This project proposal is outdated.</span>

              <i>Project proposal can be outdated after latest version is approved.</i>
            </div>
          }
          status="declined"
          onClose={() => {
            setIsStatusBarDismissed(true);
          }}
        />
      )}

      {project.data && (
        <ProjectDetails
          action={
            roundState === ERoundState.VOTING || roundState === ERoundState.APPLICATION ? (
              <AppealButton projectName={metadata.data?.name ?? "this project"} />
            ) : undefined
          }
          pollId={pollId}
          project={project.data as unknown as IRecipient}
        />
      )}
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId, pollId } }) =>
  Promise.resolve({
    props: { projectId, pollId },
  });
