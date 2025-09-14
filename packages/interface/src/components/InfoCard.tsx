import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { formatPeriod } from "~/utils/time";
import { EInfoCardState } from "~/utils/types";

const InfoCardContainer = createComponent(
  "div",
  tv({
    base: "rounded-[12px] p-2 px-[10px] w-full",
    variants: {
      state: {
        [EInfoCardState.PASSED]: "border border-[var(--brand-300)] bg-[rgba(198,94,198,0.10)] text-[var(--brand-300)]",
        [EInfoCardState.ONGOING]: "border border-transparent text-white [background:var(--brand-gradient)]",
        [EInfoCardState.UPCOMING]: "border border-[var(--border-strong)] bg-transparent text-[var(--text-tertiary)]",
      },
    },
  }),
);

interface InfoCardProps {
  state: EInfoCardState;
  title: string;
  start: Date;
  end: Date;
}

export const InfoCard = ({ state, title, start, end }: InfoCardProps): JSX.Element => (
  <InfoCardContainer state={state}>
    <div className="flex min-w-[200px] items-center justify-between">
      <span className="font-sans text-base font-extrabold uppercase leading-6 tracking-[0.16px]">{title}</span>

      {state === EInfoCardState.PASSED && <div className="h-4 w-4 rounded-full bg-[var(--brand-300)]" />}

      {state === EInfoCardState.ONGOING && <div className="h-4 w-4 animate-pulse rounded-full bg-white/90" />}

      {state === EInfoCardState.UPCOMING && (
        <div className="h-4 w-4 rounded-full border-2 border-[var(--border-strong)] bg-transparent" />
      )}
    </div>

    <span className="font-sans text-sm font-medium leading-5">{formatPeriod({ start, end })}</span>
  </InfoCardContainer>
);
