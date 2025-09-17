import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useRound } from "~/contexts/Round";
import { AdminLayout } from "~/layouts/AdminLayout";

const ApproveVoters = dynamic(() => import("~/features/voters/components/ApproveVoters"), { ssr: false });
const VotersList = dynamic(() => import("~/features/voters/components/VotersList").then((m) => m.VotersList), {
  ssr: false,
});

const VotersPage = (): JSX.Element => {
  const { rounds } = useRound();
  const singleRound = useMemo(() => (rounds && rounds.length === 1 ? rounds[0] : undefined), [rounds]);

  return (
    <AdminLayout pollId={singleRound ? singleRound.pollId : ""}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <ApproveVoters />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-white">Voters</h1>

          <div className="mt-4">
            <VotersList />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VotersPage;
