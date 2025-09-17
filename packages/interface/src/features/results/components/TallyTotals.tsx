import { formatUnits } from "viem";

import { Heading } from "~/components/ui/Heading";
import { useTallyTotals } from "~/hooks/useResults";
import { useTokenMeta } from "~/hooks/useTokenMeta";

interface ITallyTotalsProps {
  tallyAddress: string;
}

export const TallyTotals = ({ tallyAddress }: ITallyTotalsProps): JSX.Element => {
  const { data, isLoading } = useTallyTotals(tallyAddress);
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

  const { decimals } = tokenMeta;
  const { symbol } = tokenMeta;
  const deposited = data?.deposited ? trim4(formatUnits(BigInt(data.deposited), Number(decimals))) : "0";
  const claimed = data?.claimed ? trim4(formatUnits(BigInt(data.claimed), Number(decimals))) : "0";

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <Heading as="h4" size="lg">
        Payout totals
      </Heading>

      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-400">Deposited</span>

            <div className="font-sans text-xl font-bold text-black dark:text-white flex items-baseline gap-1">
              <span>{deposited}</span>
              <span>{symbol}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-400">Claimed</span>

            <div className="font-sans text-xl font-bold text-black dark:text-white flex items-baseline gap-1">
              <span>{claimed}</span>
              <span>{symbol}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TallyTotals;
