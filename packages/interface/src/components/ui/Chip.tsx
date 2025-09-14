import { tv } from "tailwind-variants";

import { createComponent } from ".";

const chip = tv({
  base: "rounded-md min-w-[42px] px-2 md:px-3 py-2 cursor-pointer inline-flex justify-center items-center whitespace-nowrap uppercase",
  variants: {
    color: {
      primary: "text-white bg-[var(--brand-300)]",
      secondary: "text-black bg-white border border-black",
      neutral: "text-white [background:var(--brand-gradient)] border border-transparent hover:opacity-90",
      disabled: "cursor-not-allowed text-gray-500 bg-gray-50 border border-gray-500",
    },
  },
});

export const Chip = createComponent("button", chip);
