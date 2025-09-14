import Image from "next/image";
import Link from "next/link";

import { config, metadata } from "~/config";

export const Logo = (): JSX.Element =>
  config.logoUrl ? (
    <Link className="flex items-center gap-3" href="/">
      <Image alt="privote logo" className="dark:invert-0" height={30} src={config.logoUrl} width={30} />

      <p className="font-sans text-[18px] font-normal uppercase leading-[29px] tracking-[9.473px]">
        PRI
        <span className="text-[#c45ec6]">VOTE</span>
      </p>
    </Link>
  ) : (
    <div className="flex h-full min-h-10 items-center justify-center rounded-md border border-black font-mono text-sm font-medium">
      {metadata.title}
    </div>
  );
