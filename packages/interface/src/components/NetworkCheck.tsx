import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";

import { config } from "~/config";

/**
 * Component that automatically prompts users to switch to the correct network
 * when they connect their wallet
 */
export const NetworkCheck = (): null => {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Only check if user is connected and on wrong network
    if (isConnected && chainId && chainId !== config.network.id) {
      // Prompt user to switch to the correct network
      switchChain({ chainId: config.network.id });
    }
  }, [isConnected, chainId, switchChain]);

  return null;
};
