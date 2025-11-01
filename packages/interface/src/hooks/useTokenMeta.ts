import { Contract, JsonRpcProvider } from "ethers";
import { useEffect, useState } from "react";

import { getRPCURL } from "~/config";

interface TokenMeta {
  symbol: string;
  decimals: number;
  isLoading: boolean;
  tokenAddress?: string;
}

const TALLY_ABI = ["function token() view returns (address)"];

const ERC20_ABI = ["function symbol() view returns (string)", "function decimals() view returns (uint8)"];

export function useTokenMeta(tallyAddress: string | undefined): TokenMeta {
  const [meta, setMeta] = useState<TokenMeta>({
    symbol: "WETH",
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
        const provider = new JsonRpcProvider(getRPCURL());

        interface TallyContract {
          token: () => Promise<string>;
        }
        const tally = new Contract(tallyAddress, TALLY_ABI, provider) as unknown as TallyContract;
        const tokenAddress = await tally.token();

        let symbol = "TOKEN";
        let decimals = 18;

        interface ERC20Contract {
          symbol: () => Promise<string>;
          decimals: () => Promise<bigint>;
        }
        const erc20 = new Contract(tokenAddress, ERC20_ABI, provider) as unknown as ERC20Contract;

        try {
          symbol = await erc20.symbol();
        } catch {
          symbol = "TOKEN";
        }
        try {
          const dec = await erc20.decimals();
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
