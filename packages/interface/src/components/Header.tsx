import {
  Menu,
  MoonIcon,
  SunIcon,
  X,
  BarChart3,
  ClipboardList,
  Pencil,
  FolderKanban,
  Home,
  Shield,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { type ComponentPropsWithRef, useState, useMemo, useEffect, useCallback } from "react";

import { useBallot } from "~/contexts/Ballot";
import { AppContainer } from "~/layouts/AppContainer";
import { cn } from "~/utils/classNames";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import ConnectButton from "./ConnectButton";
import { HelpButton } from "./HelpButton";
import { IconButton } from "./ui/Button";
import { Logo } from "./ui/Logo";

interface INavLinkProps extends ComponentPropsWithRef<typeof Link> {
  isActive: boolean;
}

const NavLink = ({ isActive, ...props }: INavLinkProps) => (
  <Link
    className={cn(
      "no-scrollbar relative flex h-full min-w-[110px] flex-row items-center gap-2 whitespace-nowrap uppercase text-black transition-all duration-200 ease-linear hover:text-[#c45ec6] dark:text-white",
      isActive && "text-[#c45ec6]",
    )}
    {...props}
  >
    {props.children}
  </Link>
);

const NavIcon = ({ link }: { link: { label: string; href: string } }): JSX.Element => {
  let IconComp = Home;

  if (link.label === "round") {
    IconComp = FolderKanban;
  } else if (link.label === "ballot") {
    if (link.href.includes("confirmation")) {
      IconComp = Shield;
    } else {
      IconComp = ClipboardList;
    }
  } else if (link.label === "result") {
    IconComp = BarChart3;
  } else if (link.label === "proposals") {
    IconComp = Pencil;
  } else if (link.label === "voters") {
    IconComp = Users;
  } else if (link.label === "coordinator") {
    IconComp = Shield;
  } else {
    IconComp = Home;
  }

  return <IconComp className="h-[21px] w-[21px] shrink-0" />;
};

interface IMobileMenuProps {
  isOpen?: boolean;
  navLinks: INavLink[];
  pollId: string;
  setOpen: (open: boolean) => void;
}

const MobileMenu = ({ isOpen = false, navLinks, pollId, setOpen }: IMobileMenuProps) => {
  const { getBallot } = useBallot();
  const roundState = useRoundState({ pollId });
  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  return (
    <div
      className={cn("fixed left-0 top-16 z-10 h-full w-full bg-white transition-transform duration-150", {
        "-translate-x-full": !isOpen,
      })}
    >
      <Link
        key="home"
        className={cn(
          "flex items-center gap-2 p-4 text-2xl font-medium uppercase tracking-[0.6px] text-black transition-all duration-200 ease-linear hover:text-[#c45ec6] dark:text-white",
        )}
        href="/"
        onClick={() => {
          setOpen(false);
        }}
      >
        <Home className="h-[21px] w-[21px]" />
        Home
      </Link>

      {navLinks.map((link) => (
        <Link
          key={link.href}
          className={cn(
            "flex items-center gap-2 p-4 text-2xl font-medium uppercase tracking-[0.6px] text-black transition-all duration-200 ease-linear hover:text-[#c45ec6] dark:text-white",
          )}
          href={link.href}
          onClick={() => {
            setOpen(false);
          }}
        >
          <NavIcon link={link} />

          {link.name}

          {roundState === ERoundState.VOTING && link.href.includes("/ballot") && ballot.votes.length > 0 && (
            <div className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-50)] font-sans text-sm font-medium leading-5 text-[var(--accent-color)]">
              {ballot.votes.length}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

interface INavLink {
  label: string;
  href: string;
  name: string;
}

interface IHeaderProps {
  navLinks: INavLink[];
  pollId?: string;
}

const Header = ({ navLinks, pollId = "" }: IHeaderProps) => {
  const { asPath } = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { getBallot } = useBallot();
  const roundState = useRoundState({ pollId });
  const { theme, setTheme } = useTheme();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  // set default theme to dark if it's not set
  useEffect(() => {
    if (!["dark", "light"].includes(theme ?? "")) {
      setTheme("dark");
    }
  }, []);

  const handleChangeTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // the URI of round index page looks like: /rounds/:pollId, without anything else, which is the reason why the length is 3
  const isRoundIndexPage = useMemo(
    () => asPath.includes("rounds") && !asPath.includes("proposals") && !asPath.includes("ballot"),
    [asPath],
  );

  return (
    <header className="dark:border-lighterBlack relative z-[100] border-b border-gray-200 bg-white/90 py-[18px] backdrop-blur-md dark:bg-[rgba(15,14,13,0.1)] dark:text-white">
      <AppContainer as="div" className="container relative mx-auto flex items-center px-2">
        <div className="mr-4 flex items-center md:mr-16">
          <IconButton
            className="mr-1 text-gray-600 md:hidden"
            icon={isOpen ? X : Menu}
            variant="ghost"
            onClick={() => {
              setOpen(!isOpen);
            }}
          />

          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="absolute left-1/2 top-1/2 hidden h-full -translate-x-1/2 -translate-y-1/2 items-center gap-[48px] overflow-x-hidden uppercase md:flex">
          {navLinks.map((link) => {
            const isActive =
              (link.label !== "round" && asPath.includes(link.label)) || (link.label === "round" && isRoundIndexPage);

            return (
              <NavLink key={link.label} href={link.href} isActive={isActive}>
                <NavIcon link={link} />

                <span className="font-sans text-base font-medium leading-5 tracking-[0.6px]">{link.name}</span>

                {roundState === ERoundState.VOTING && link.href.includes("/ballot") && ballot.votes.length > 0 && (
                  <div className="ml-2 h-5 w-5 rounded-full bg-[var(--brand-50)] font-sans text-sm font-medium leading-5 text-[var(--accent-color)]">
                    {ballot.votes.length}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="flex-1 md:ml-8" />

        <div className="flex items-center gap-2">
          <HelpButton />

          <IconButton
            className="w-[50px] text-gray-600"
            icon={theme === "light" ? SunIcon : MoonIcon}
            variant="ghost"
            onClick={handleChangeTheme}
          />

          <ConnectButton showMobile={false} />
        </div>

        <MobileMenu isOpen={isOpen} navLinks={navLinks} pollId={pollId} setOpen={setOpen} />
      </AppContainer>
    </header>
  );
};

export default dynamic(async () => Promise.resolve(Header), { ssr: false });
