import { type ReactNode } from "react";
import Markdown from "react-markdown";

import { Heading } from "~/components/ui/Heading";
import { markdownComponents } from "~/components/ui/MarkdownComponents";
import { Navigation } from "~/components/ui/Navigation";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { ProjectBanner } from "~/features/projects/components/ProjectBanner";
import { VotingWidget } from "~/features/projects/components/VotingWidget";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { IRecipient } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";

import { ImpactCategories } from "./ImpactCategories";
import { ProjectContacts } from "./ProjectContacts";
import { ProjectDescriptionSection } from "./ProjectDescriptionSection";

export interface IProjectDetailsProps {
  pollId: string;
  action?: ReactNode;
  project: IRecipient;
}

const ProjectDetails = ({ pollId, project, action = undefined }: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(project.metadataUrl);

  const { bio, websiteUrl, payoutAddress, github, twitter, fundingSources, profileImageUrl, bannerImageUrl } =
    metadata.data ?? {};

  const roundState = useRoundState({ pollId });

  return (
    <div className="markdown-support relative flex flex-col gap-[30px]">
      <Navigation pollId={pollId} projectName={metadata.data?.name ?? "project name"} />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <div className="overflow-hidden rounded-3xl">
            {bannerImageUrl ? (
              <img
                alt="Project banner"
                className="max-h-[400px] w-full rounded-3xl object-contain"
                src={bannerImageUrl}
              />
            ) : (
              <ProjectBanner url={bannerImageUrl} />
            )}
          </div>

          <div className="flex items-end gap-4">
            <ProjectAvatar className="-mt-[75px] ml-8 !size-[105px]" rounded="full" size="lg" url={profileImageUrl} />
          </div>
        </div>

        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-4 px-2">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Heading as="h3" size="3xl">
                {metadata.data?.name}
              </Heading>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {action}

                {roundState === ERoundState.VOTING && (
                  <VotingWidget
                    pollId={pollId}
                    projectId={project.id}
                    projectIndex={Number.parseInt(project.index, 10)}
                  />
                )}
              </div>
            </div>

            {metadata.data?.impactCategory && metadata.data.impactCategory.length > 0 && (
              <ImpactCategories tags={metadata.data.impactCategory} />
            )}
          </div>

          <ProjectContacts author={payoutAddress} github={github} twitter={twitter} website={websiteUrl} />

          <Markdown components={markdownComponents}>{bio}</Markdown>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="font-sans text-lg font-bold uppercase leading-[27px] dark:text-white">Impact statements</h3>

          <Markdown components={markdownComponents}>{metadata.data?.impactDescription}</Markdown>

          <ProjectDescriptionSection
            contributions={metadata.data?.contributionLinks}
            description={metadata.data?.contributionDescription}
            title="contributions"
          />

          {fundingSources && fundingSources.length > 0 && (
            <ProjectDescriptionSection fundings={fundingSources} title="past grants and funding" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
