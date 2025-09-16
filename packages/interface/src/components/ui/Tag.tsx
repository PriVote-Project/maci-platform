import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Tag = createComponent(
  "div",
  tv({
    base: "cursor-pointer font-inter inline-flex items-center justify-center gap-2 whitespace-nowrap transition border border-[var(--brand-500)] text-[var(--brand-500)] hover:bg-[var(--brand-50)] dark:border-[var(--brand-300)] dark:text-[var(--brand-300)] dark:hover:bg-[var(--brand-50)] dark:hover:text-[var(--brand-500)]",
    variants: {
      size: {
        xs: "rounded py-1 px-[6px] text-[10px] leading-[16px] tracking-[0.05px]",
        sm: "rounded py-[2px] px-2 text-sm tracking-[0.05px]",
        md: "rounded-lg py-[2px] px-2 text-sm",
        lg: "rounded-xl py-2 px-4 text-lg",
      },
      selected: {
        true: "bg-[var(--brand-50)] text-[var(--brand-500)] dark:bg-[var(--brand-50)] dark:text-[var(--brand-500)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-50)]",
      },
      disabled: {
        true: "border-gray-200 text-gray-200 cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
