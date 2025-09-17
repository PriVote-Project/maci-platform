import { useEffect, useState } from "react";
import { Hex, createPublicClient, http } from "viem";

import { config } from "~/config";

interface TokenMeta {
  symbol: string;
  decimals: number;
  isLoading: boolean;
  tokenAddress?: Hex;
}

const TALLY_ABI = [
  {
    type: "function",
    name: "token",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const ERC20_ABI = [
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export function useTokenMeta(tallyAddress: string | undefined): TokenMeta {
  const [meta, setMeta] = useState<TokenMeta>({
    symbol: "TOKEN",
    decimals: 18,
    isLoading: false,
    tokenAddress: undefined,
  });

  useEffect(() => {
    async function run(): Promise<void> {
      if (!tallyAddress) {
        return;
      }
      setMeta((m) => ({ ...m, isLoading: true }));
      try {
        const client = createPublicClient({ chain: config.network, transport: http() });
        const tokenAddress = await client.readContract({
          abi: TALLY_ABI,
          address: tallyAddress as Hex,
          functionName: "token",
        });

        let symbol = "TOKEN";
        let decimals = 18;
        try {
          symbol = await client.readContract({
            abi: ERC20_ABI,
            address: tokenAddress,
            functionName: "symbol",
          });
        } catch {
          symbol = "TOKEN";
        }
        try {
          const dec = await client.readContract({ abi: ERC20_ABI, address: tokenAddress, functionName: "decimals" });
          decimals = Number(dec);
        } catch {
          decimals = 18;
        }

        setMeta({ symbol, decimals, isLoading: false, tokenAddress });
      } catch {
        setMeta({ symbol: "TOKEN", decimals: 18, isLoading: false, tokenAddress: undefined });
      }
    }

    run().catch(() => undefined);
  }, [tallyAddress]);

  return meta;
}
