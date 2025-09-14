import dynamic from "next/dynamic";

import { AdminLayout } from "~/layouts/AdminLayout";

const ApproveVoters = dynamic(() => import("~/features/voters/components/ApproveVoters"), { ssr: false });
const VotersList = dynamic(() => import("~/features/voters/components/VotersList").then((m) => m.VotersList), {
  ssr: false,
});

const VotersPage = (): JSX.Element => (
  <AdminLayout>
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

export default VotersPage;
