import { useMemo } from "react";
import { useAccount } from "wagmi";

import ConnectButton from "~/components/ConnectButton";
import { JoinButton } from "~/components/JoinButton";
import { SingleRoundHome } from "~/components/SingleRoundHome";
import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { FAQList } from "~/features/home/components/FaqList";
import { Glossary } from "~/features/home/components/Glossary";
import { RoundsList } from "~/features/rounds/components/RoundsList";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { Layout } from "~/layouts/DefaultLayout";

const HomePage = (): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();
  const isAdmin = useIsAdmin();
  const { rounds } = useRound();
  const singleRound = useMemo(() => (rounds && rounds.length === 1 ? rounds[0] : undefined), [rounds]);

  return (
    <div className="bg-blue-50 dark:bg-transparent">
      <Layout pollId={singleRound ? singleRound.pollId : ""} type="home">
        {singleRound && <SingleRoundHome round={singleRound} />}

        {!singleRound && (
          <div className="flex h-auto flex-col items-center justify-center gap-4 px-2 pb-4 sm:min-h-[90vh]">
            <h1 className="mb-0 mt-4 max-w-[858px] text-center text-[40px] font-medium leading-[48px] text-[var(--brand-500)] sm:mt-0 sm:text-[80px] sm:leading-[96px] dark:bg-[radial-gradient(70.54%_70.54%_at_50%_50%,#fff_0%,rgba(255,255,255,0.57)_92.71%,rgba(255,255,255,0.6)_92.72%)] dark:bg-clip-text dark:text-transparent">
              {config.eventName}
            </h1>

            <p className="text-gray-400">{config.eventDescription}</p>

            {!isConnected && <p className="text-gray-400">Connect your wallet to get started.</p>}

            <ConnectButton showMobile />

            {isConnected && !isRegistered && <JoinButton />}

            {isConnected && isAdmin && (
              <div className="flex flex-col gap-4">
                <p className="text-center text-gray-400">Configure and deploy your contracts to get started.</p>

                <Button size="auto" variant="primary">
                  <a href="/coordinator">Get Started</a>
                </Button>
              </div>
            )}

            {isConnected && !isAdmin && rounds && rounds.length === 0 && (
              <p className="text-gray-400">There are no rounds deployed.</p>
            )}

            {rounds && rounds.length > 1 && <RoundsList />}
          </div>
        )}

        <FAQList />

        <Glossary />
      </Layout>
    </div>
  );
};

export default HomePage;
