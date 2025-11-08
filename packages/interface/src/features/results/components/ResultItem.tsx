import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";

import { useProjectMetadata } from "~/features/projects/hooks/useProjects";
import { useClaimsByRecipient } from "~/hooks/useResults";

import type { IRecipientWithVotes } from "~/utils/types";

export interface IResultItemProps {
  pollId: string;
  rank: number;
  project: IRecipientWithVotes;
  tallyAddress: string;
}

// Hardcoded claimed amounts array indexed by project.index
const CLAIMED_AMOUNTS = [
  67227804101617172n,
  17807606366864945n,
  5046477374323290n,
  1205274133345559305n,
  1025750334109575569n,
  57366866243744075n,
  86369077590429655n,
  5220460042403404n,
  49014363175898629n,
  6331352594649542079n,
  3770344475069125n,
  4350411702002836n,
  578017554139443595n,
  70881945131299555n,
  750463733206836050n,
  148549849317723537n,
  569257546512744550n,
  11427066870594118n,
  41879828784613976n,
  29698487019006033n,
  19315721156892595n,
  220012586675956804n,
  860323435988081024n,
  48376001726271546n,
  10614942752886922n,
  2625625529438138867n,
  29292527460152435n,
  11543055315980860n,
  75000574942528908n,
  1086365876824148430n,
  843387377961616646n,
  26682462438950732n,
  62239805949987253n,
  106264635974255962n,
  145940109296521835n,
  39559664876879130n,
  22738235295801494n,
  19141738488812482n,
  211716757830804729n,
  17633623698784832n,
  111601364462046109n,
  15255360568356614n,
  65371988975429295n,
  22448569182334638n,
  283991734306745192n,
  43562481242721740n,
  2378263130428217n,
  1444541246955715334n,
  463168368206568701n,
  14269223782569305n,
  4524394370082950n,
  21636050064627442n,
  10150988971339952n,
  764441985875938499n,
  6728609832431054n,
  206670395456481438n,
  546231000103476200n,
  903827978008109393n,
  130278829169311622n,
  718326858834708428n,
  12065218320221200n,
  365660559859011784n,
  21926021178094297n,
  584453467858407794n,
  274187695671565466n,
  672621131352331955n,
  46520186600083669n,
  298318367312007868n,
  2610240021201702n,
  513977932285961836n,
  43504487020028368n,
  6436863005728784216n,
  2088197016961361n,
  39037331872638789n,
  190430313102337513n,
  326101839982132653n,
  585906223425742073n,
  24246705085829144n,
  86311648367736284n,
  15371349013743357n,
  19431984602279338n,
  17923594812251688n,
  16357495799530666n,
  53190827209821352n,
  1624158235414392n,
  13979252669102449n,
  4988483151629919n,
  35150978952182922n,
  4930488928936548n,
  684513067004473043n,
  34629030947942581n,
  76392436287169815n,
  586251288761902300n,
];

export const ResultItem = ({ pollId, rank, project, tallyAddress }: IResultItemProps): JSX.Element => {
  const metadata = useProjectMetadata(project.metadataUrl);
  const claimsByRecipient = useClaimsByRecipient(tallyAddress);

  const claimedFormatted = useMemo(() => {
    const projectIndex = Number(project.index);
    const raw = CLAIMED_AMOUNTS[projectIndex];

    if (raw == null) {
      return null;
    }

    try {
      const decimals = 18;
      const value = formatUnits(raw, decimals);
      const [int, dec] = value.split(".");
      const trimmed = dec ? `${int}.${dec.slice(0, 4)}` : int;
      return trimmed;
    } catch {
      return null;
    }
  }, [project.index]);

  useEffect(() => {
    if (!claimsByRecipient.data && !claimsByRecipient.isLoading) {
      claimsByRecipient.refetch().catch(() => undefined);
    }
  }, [claimsByRecipient]);

  useEffect(() => {
    if (metadata.data) {
      return;
    }

    metadata.refetch().catch(() => undefined);
  }, [metadata]);

  return (
    <Link href={`/rounds/${pollId}/${project.id}`}>
      <div className="group flex cursor-pointer items-center gap-[14px] overflow-hidden rounded p-[10px] leading-8 duration-200 hover:bg-[var(--brand-50)] dark:hover:[background:var(--brand-gradient)]">
        <div className="flex flex-none items-center justify-center gap-2 text-center font-sans text-base font-semibold text-black dark:text-white dark:group-hover:text-white">
          <span className="w-3">{rank}</span>

          <div className="w-4">
            {rank === 1 && <Image alt="gold" height="26" src="/gold.svg" width="20" />}

            {rank === 2 && <Image alt="silver" height="26" src="/silver.svg" width="20" />}

            {rank === 3 && <Image alt="bronze" height="26" src="/bronze.svg" width="20" />}
          </div>
        </div>

        <div className="min-w-0 flex-1 font-sans text-lg font-medium leading-[28px] dark:text-white dark:group-hover:text-white">
          <div className="truncate">{metadata.data?.name}</div>
        </div>

        {claimedFormatted && (
          <div className="flex-none">
            <span className="ring-[var(--brand-300)]/60 dark:ring-[var(--brand-300)]/60 inline-flex h-6 items-center gap-1 rounded-full bg-[var(--brand-50)] px-2 text-[10px] font-semibold uppercase leading-none text-black ring-1 dark:bg-[var(--brand-300)] dark:text-white">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span className="tabular-nums">{claimedFormatted}</span>

              <span>$WETH</span>
            </span>
          </div>
        )}

        <div className="flex-none text-end font-sans text-base font-normal text-black dark:text-white dark:group-hover:text-white">{`${project.votes} votes`}</div>
      </div>
    </Link>
  );
};
