import clsx from "clsx";

import type { ComponentPropsWithRef } from "react";

export interface IBackgroundImageProps extends ComponentPropsWithRef<"div"> {
  src?: string;
  fallbackSrc?: string;
  isLoading?: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
}

export const BackgroundImage = ({
  src = "",
  fallbackSrc = "",
  isLoading = false,
  className = "",
  objectFit = "cover",
  ...props
}: IBackgroundImageProps): JSX.Element => (
  <div
    {...props}
    className={clsx(className, "bg-cover bg-center", {
      "blur-[40px]": fallbackSrc && !src,
      "animate-pulse bg-gray-100": isLoading,
    })}
    style={{ backgroundImage: `url("${src || fallbackSrc}")`, backgroundSize: objectFit }}
  />
);
