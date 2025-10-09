import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";

import { useProjectMetadata } from "~/features/projects/hooks/useProjects";
import { useClaimsByRecipient } from "~/hooks/useResults";
import { useTokenMeta } from "~/hooks/useTokenMeta";

import type { IRecipientWithVotes } from "~/utils/types";

export interface IResultItemProps {
  pollId: string;
  rank: number;
  project: IRecipientWithVotes;
  tallyAddress: string;
}

export const ResultItem = ({ pollId, rank, project, tallyAddress }: IResultItemProps): JSX.Element => {
  const metadata = useProjectMetadata(project.metadataUrl);
  const claimsByRecipient = useClaimsByRecipient(tallyAddress);
  const tokenMeta = useTokenMeta(tallyAddress);
  const claimedFormatted = useMemo(() => {
    const indexKey = String(project.index);
    const raw = claimsByRecipient.data?.[indexKey];
    if (raw == null) {
      return null;
    }
    try {
      const { decimals } = tokenMeta;
      const value = formatUnits(BigInt(raw), decimals);
      const [int, dec] = value.split(".");
      const trimmed = dec ? `${int}.${dec.slice(0, 4)}` : int;
      return trimmed;
    } catch {
      return null;
    }
  }, [claimsByRecipient.data, project.index, tokenMeta.decimals]);

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

        <div className="flex-1 font-sans text-lg font-medium leading-[28px] dark:text-white dark:group-hover:text-white">
          <span className="truncate">{metadata.data?.name}</span>
        </div>

        {claimedFormatted && (
          <div className="flex-none">
            <span className="ring-[var(--brand-300)]/60 dark:ring-[var(--brand-300)]/60 inline-flex h-6 items-center gap-1 rounded-full bg-[var(--brand-50)] px-2 text-[10px] font-semibold uppercase leading-none text-black ring-1 dark:bg-[var(--brand-300)] dark:text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />

                <path d="M3.553 9.776l6.053 2.595a1 1 0 00.788 0l6.053-2.595A1 1 0 0117 10.723v3.557a1 1 0 01-.606.923l-6 2.571a1 1 0 01-.788 0l-6-2.571A1 1 0 013 14.28v-3.557a1 1 0 01.553-.947z" />
              </svg>

              <span>Received</span>

              <span className="tabular-nums">{claimedFormatted}</span>

              <span>{tokenMeta.symbol}</span>
            </span>
          </div>
        )}

        <div className="flex-none text-end font-sans text-base font-normal text-black dark:text-white dark:group-hover:text-white">{`${project.votes} votes`}</div>
      </div>
    </Link>
  );
};
