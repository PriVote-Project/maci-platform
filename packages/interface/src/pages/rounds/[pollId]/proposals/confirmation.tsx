import { useSearchParams } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { EmptyState } from "~/components/EmptyState";
import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useRound } from "~/contexts/Round";
import { ProjectItem } from "~/features/projects/components/ProjectItem";
import { useRequestByIndex } from "~/hooks/useRequests";
import { Layout } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState, type IRecipient } from "~/utils/types";

import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });

const ConfirmProposalPage = ({ pollId }: { pollId: string }): JSX.Element => {
  const state = useRoundState({ pollId });

  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const searchParams = useSearchParams();

  const requestIndex = useMemo(() => searchParams.get("index"), [searchParams]);
  const proposal = useRequestByIndex(round?.registryAddress ?? zeroAddress, requestIndex ?? "");

  const project = useMemo(() => proposal.data, [proposal]);

  // Auto-refetch every 3 seconds if data is not available yet (for up to 30 seconds)
  const [refetchCount, setRefetchCount] = useState(0);
  const maxRefetches = 10; // 10 * 3 seconds = 30 seconds max

  useEffect(() => {
    if (!proposal.data && !proposal.isLoading && refetchCount < maxRefetches) {
      const timer = setTimeout(() => {
        proposal.refetch();
        setRefetchCount((prev) => prev + 1);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }

    return undefined;
  }, [proposal.data, proposal.isLoading, refetchCount, proposal]);

  // Show loading state while fetching or when data is not available yet (and still retrying)
  const isStillLoading =
    proposal.isLoading || proposal.isFetching || (project === undefined && refetchCount < maxRefetches);

  if (isStillLoading) {
    return (
      <Layout pollId={pollId}>
        <EmptyState title="Loading your proposal..." />
      </Layout>
    );
  }

  // If we've exhausted retries and still no data, show error
  if (project === undefined) {
    return (
      <Layout pollId={pollId}>
        <div className="flex w-full justify-center">
          <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
            <Heading as="h2" size="4xl">
              There is no such proposal for this round!
            </Heading>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pollId={pollId}>
      <div className="flex w-fit justify-center sm:w-full">
        <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
          <div>
            <Heading as="h2" size="4xl">
              Your project proposal has been submitted!
            </Heading>

            <p className="text-gray-400">
              Thank you for submitting your project proposal. Our team is now reviewing it.
            </p>

            <p className="flex gap-1 text-[var(--brand-500)]">
              <FiAlertCircle className="h-4 w-4" />

              <i className="text-sm">Proposal can be approved until the Application period ends.</i>
            </p>

            {state !== ERoundState.APPLICATION && <Alert title="Application period has ended" variant="info" />}
          </div>

          <div className="w-[330px]">
            <ProjectItem isLoading={false} pollId={pollId} recipient={project.recipient as IRecipient} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProposalPage;
