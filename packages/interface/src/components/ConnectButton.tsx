import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { config } from "~/config";
import { useIsMobile } from "~/hooks/useIsMobile";

import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";

interface IConnectedDetailsProps {
  account: { address: string; displayName: string; ensName?: string };
  openAccountModal: () => void;
  isMobile: boolean;
}

const ConnectedDetails = ({ openAccountModal, account, isMobile }: IConnectedDetailsProps) => {
  const displayName = isMobile ? null : account.ensName || account.displayName;

  return (
    <div>
      <div className="flex gap-2 text-white">
        <Chip color="neutral" onClick={openAccountModal}>
          {/* Avatar inside modal is controlled by Provider; here we just show name with spacing */}
          <span className="mr-2 font-sans text-base font-bold leading-none">{displayName}</span>

          {/* Inline SVG so it inherits current text color exactly */}
          <svg
            aria-hidden
            className="-mr-0.5"
            fill="currentColor"
            height="18"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z" />
          </svg>
        </Chip>
      </div>
    </div>
  );
};

interface IConnectButtonProps {
  showMobile: boolean;
}

const ConnectButton = ({ showMobile }: IConnectButtonProps): JSX.Element | null => {
  const isMobile = useIsMobile();

  const isShow = useMemo(() => showMobile === isMobile, [isMobile, showMobile]);

  return isShow ? (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted, authenticationStatus }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button suppressHydrationWarning variant="secondary" onClick={openConnectModal}>
                    <p>Connect wallet</p>
                  </Button>
                );
              }

              if (chain.unsupported ?? ![Number(config.network.id)].includes(chain.id)) {
                return (
                  <Chip color="disabled" onClick={openChainModal}>
                    Wrong network
                  </Chip>
                );
              }

              return <ConnectedDetails account={account} isMobile={false} openAccountModal={openAccountModal} />;
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  ) : null;
};

export default dynamic(async () => Promise.resolve(ConnectButton), { ssr: false });
