import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const inputBase = [
  "text-black text-sm leading-5 font-normala font-sans",
  "duration-200",
  "disabled:opacity-30",
  "checked:bg-gray-800",
  "rounded-[10px] border-2 outline outline-transparent",
  "py-[14px] px-[16px]",
  "placeholder:text-gray-400",
  "dark:bg-[rgba(255,255,255,0.06)] dark:text-white dark:border-[rgba(255,255,255,0.15)]",
  "focus:border-[rgba(250,117,248,0.5)] focus:shadow-[0_0_0_4px_rgba(250,117,248,0.15)]",
];

export const Input = createComponent(
  "input",
  tv({
    base: ["w-full", ...inputBase],
    variants: {
      error: {
        true: "!border-red-900",
      },
    },
  }),
);

export const InputWrapper = createComponent(
  "div",
  tv({
    base: "flex w-full relative",
    variants: {},
  }),
);

export const InputAddon = createComponent(
  "div",
  tv({
    base: "absolute right-0 text-gray-900 inline-flex items-center justify-center h-full border-gray-300 border-l px-4 font-semibold",
    variants: {
      disabled: {
        true: "text-gray-500",
      },
    },
  }),
);

export const InputIcon = createComponent(
  "div",
  tv({
    base: "absolute text-gray-600 left-0 inline-flex items-center justify-center h-full px-4",
  }),
);
