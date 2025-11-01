import { Contract, JsonRpcProvider } from "ethers";
import { useEffect, useState } from "react";

import { config } from "~/config";

interface TallyTotals {
  available: bigint;
  isLoading: boolean;
  error?: string;
}

const TALLY_ABI = ["function totalAmount() view returns (uint256)"];

/**
 * Hook to fetch the actual available balance from the Tally contract
 * This reads directly from the contract's totalAmount() function which returns token.balanceOf(address(this))
 */
export function useTallyContractBalance(tallyAddress: string | undefined): TallyTotals {
  const [totals, setTotals] = useState<TallyTotals>({
    available: BigInt(0),
    isLoading: false,
  });

  useEffect(() => {
    async function fetchBalance(): Promise<void> {
      if (!tallyAddress) {
        return;
      }

      setTotals((prev) => ({ ...prev, isLoading: true }));

      try {
        const provider = new JsonRpcProvider(config.network.rpcUrls.default.http[0]);
        interface TallyContract {
          totalAmount: () => Promise<bigint>;
        }
        const tally = new Contract(tallyAddress, TALLY_ABI, provider) as unknown as TallyContract;
        const available = await tally.totalAmount();

        setTotals({ available, isLoading: false });
      } catch (error) {
        setTotals({
          available: BigInt(0),
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to fetch balance",
        });
      }
    }

    fetchBalance().catch(() => undefined);
  }, [tallyAddress]);

  return totals;
}
