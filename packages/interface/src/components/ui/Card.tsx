import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Card = createComponent(
  "div",
  tv({
    base: "cursor-pointer rounded-[20px] border p-2 transition-colors hover:border-gray-400",
  }),
);

export const CardTitle = createComponent(
  "h3",
  tv({
    base: "font-sans text-base md:text-lg font-semibold tracking-[0.6px]",
  }),
);
