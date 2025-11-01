import { formatUnits } from "ethers";

import { Heading } from "~/components/ui/Heading";
import { useTallyTotals } from "~/hooks/useResults";
import { useTallyContractBalance } from "~/hooks/useTallyContract";
import { useTokenMeta } from "~/hooks/useTokenMeta";

interface ITallyTotalsProps {
  tallyAddress: string;
}

export const TallyTotals = ({ tallyAddress }: ITallyTotalsProps): JSX.Element => {
  const { data, isLoading: isLoadingSubgraph } = useTallyTotals(tallyAddress);
  const { available: contractBalance, isLoading: isLoadingContract } = useTallyContractBalance(tallyAddress);
  const tokenMeta = useTokenMeta(tallyAddress);

  const trim4 = (value: string): string => {
    const parts = value.split(".");
    const int = parts[0] ?? "";
    const dec = parts[1];
    if (!dec) {
      return int;
    }
    return dec.length > 4 ? `${int}.${dec.slice(0, 4)}` : value;
  };

  const { decimals, symbol } = tokenMeta;
  const claimedBigInt = data?.claimed ? BigInt(data.claimed) : BigInt(0);
  const totalPool = contractBalance + claimedBigInt;
  const totalPoolFormatted = trim4(formatUnits(totalPool, Number(decimals)));

  const isLoading = isLoadingSubgraph || isLoadingContract;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <Heading as="h4" size="lg">
        Total Pool
      </Heading>

      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="mt-2">
          <div className="flex items-baseline gap-1 font-sans text-2xl font-bold text-black dark:text-white">
            <span>{totalPoolFormatted}</span>

            <span>{symbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TallyTotals;
