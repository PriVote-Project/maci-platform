import { ReactNode } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";

const StatusBarContainer = createComponent(
  "div",
  tv({
    base: "flex rounded-[12px] text-base font-sans font-medium border py-6 px-4 leading-6 justify-center mb-4",
    variants: {
      status: {
        default: "text-white border-transparent [background:var(--brand-gradient)]",
        pending:
          "text-[#4E1D0D] border-[#4E1D0D] bg-[#FFEDD5] dark:text-[#F1B37A] dark:bg-[#4E1D0D] dark:border-[#F1B37A]",
        approved: "text-[var(--success)] border-[var(--success)] bg-transparent",
        declined: "text-[var(--error)] border-[var(--error)] bg-transparent",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }),
);

interface IStatusBarProps {
  status: string;
  content: ReactNode;
}

export const StatusBar = ({ status, content }: IStatusBarProps): JSX.Element => (
  <StatusBarContainer status={status}>{content}</StatusBarContainer>
);
