import { LucideIcon } from "lucide-react";
import { type ComponentPropsWithRef, createElement, forwardRef, ReactNode } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

const button = tv({
  base: "font-sans inline-flex items-center justify-center font-semibold uppercase rounded-lg text-center transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  variants: {
    variant: {
      primary:
        "text-white bg-[var(--brand-300)] [background:var(--brand-gradient)] hover:[background:var(--brand-50)] hover:text-[var(--brand-500)]",
      inverted:
        "text-black border border-black hover:text-blue-500 hover:border-blue-500 dark:border-white dark:text-white",
      tertiary: "bg-[var(--brand-50)] text-[var(--brand-500)] border border-[var(--brand-500)] hover:opacity-90",
      secondary: "bg-[var(--brand-300)] text-white hover:[background:var(--brand-50)] hover:text-[var(--brand-500)]",
      ghost: "hover:bg-gray-100 dark:invert",
      outline: "border border-gray-200 hover:border-gray-300 dark:text-white dark:border-white",
      disabled:
        "cursor-not-allowed border border-[var(--glass-stroke)] bg-white/60 text-gray-400 dark:bg-[var(--glass-bg-08)] dark:text-[var(--text-tertiary)]",
      none: "",
    },
    size: {
      xs: "px-2 text-xs rounded-md",
      md: "py-3 px-6 text-base leading-6 rounded-[8px] !normal-case",
      sm: "px-3 py-2 h-8 text-xs rounded-md",
      default: "px-4 py-2 h-10 w-full",
      auto: "px-4 py-2 h-10 w-auto",
      icon: "h-12 w-12",
    },
    disabled: {
      true: "text-gray-400 pointer-events-none pointer-default opacity-50 border-none",
    },
  },
  defaultVariants: {
    variant: "none",
    size: "default",
  },
});

export const Button = createComponent("button", button);

export interface IIconButtonProps extends Omit<ComponentPropsWithRef<typeof Button>, "size"> {
  icon?: LucideIcon | null;
  size?: string;
  children?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IIconButtonProps>(
  ({ children = null, icon = null, size = "", ...props }, ref) => (
    <Button ref={ref} {...props} size={children ? size : "icon"}>
      {icon &&
        createElement(icon, {
          className: `w-4 h-4 ${children ? "mr-2" : ""}`,
        })}

      {children}
    </Button>
  ),
);

IconButton.displayName = "IconButton";
