import { Contract, ZeroAddress, formatUnits, parseUnits } from "ethers";
import { CheckCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Input, InputAddon, InputWrapper } from "~/components/ui/Input";
import { config } from "~/config";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { useTokenMeta } from "~/hooks/useTokenMeta";

interface IDepositButtonProps {
  tallyAddress: string;
}

const TALLY_ABI = ["function token() view returns (address)", "function deposit(uint256 amount)"];

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

export const DepositButton = ({ tallyAddress }: IDepositButtonProps): JSX.Element | null => {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const tokenMeta = useTokenMeta(tallyAddress);

  const chainName = useMemo(() => {
    const { name } = config.network;
    return name.slice(0, 3).toUpperCase();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [depositedAmount, setDepositedAmount] = useState<string>("");

  const [tokenAddress, setTokenAddress] = useState<string>(ZeroAddress);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [balance, setBalance] = useState<string>("0");
  const [allowance, setAllowance] = useState<string>("0");

  const [amount, setAmount] = useState<string>("");
  const [validationError, setValidationError] = useState<string | undefined>();

  const canSubmit = useMemo(() => {
    if (!amount || Number.isNaN(Number(amount))) {
      return false;
    }
    if (Number(amount) <= 0) {
      return false;
    }
    // Check if amount exceeds balance
    if (Number(amount) > Number(balance)) {
      return false;
    }
    return true;
  }, [amount, balance]);

  const refreshTokenData = useCallback(async () => {
    if (!signer || !address || !tallyAddress) {
      return;
    }
    try {
      setError(undefined);
      const tknAddr: string = tokenMeta.tokenAddress || ZeroAddress;
      setTokenAddress(tknAddr);
      if (tknAddr && tknAddr !== ZeroAddress) {
        interface ERC20Contract {
          balanceOf: (owner: string) => Promise<bigint>;
          allowance: (owner: string, spender: string) => Promise<bigint>;
        }
        const erc20 = new Contract(tknAddr, ERC20_ABI, signer) as unknown as ERC20Contract;
        const [bal, allo] = await Promise.all([
          (erc20.balanceOf as (owner: string) => Promise<bigint>)(address),
          (erc20.allowance as (owner: string, spender: string) => Promise<bigint>)(address, tallyAddress),
        ]);
        const dec = Number(tokenMeta.decimals || 18);
        setTokenSymbol(tokenMeta.symbol || "TOKEN");
        setTokenDecimals(dec);
        setBalance(formatUnits(bal, dec));
        setAllowance(formatUnits(allo, dec));
      }
    } catch (e: unknown) {
      // Non-critical metadata fetch error; keep defaults and avoid surfacing error to the UI
      // eslint-disable-next-line no-console
      console.error("token metadata fetch error:", e);
    }
  }, [signer, address, tallyAddress, tokenMeta.tokenAddress, tokenMeta.symbol, tokenMeta.decimals]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    // fetch token info whenever dialog opens
    refreshTokenData().catch(() => undefined);
  }, [isOpen, refreshTokenData]);

  const handleDeposit = useCallback(async () => {
    if (!signer || !address || !tokenAddress || !tallyAddress || !canSubmit) {
      return;
    }
    setIsLoading(true);
    setError(undefined);

    try {
      interface ERC20Write {
        allowance: (owner: string, spender: string) => Promise<bigint>;
        approve: (spender: string, amount: bigint) => Promise<{ wait: () => Promise<unknown> }>;
      }
      interface TallyWrite {
        deposit: (amount: bigint) => Promise<{ wait: () => Promise<unknown> }>;
      }
      const erc20 = new Contract(tokenAddress, ERC20_ABI, signer) as unknown as ERC20Write;
      const tally = new Contract(tallyAddress, TALLY_ABI, signer) as unknown as TallyWrite;
      const amountWei = parseUnits(amount, tokenDecimals);

      // Ensure allowance
      const currentAllowance = await (erc20.allowance as (owner: string, spender: string) => Promise<bigint>)(
        address,
        tallyAddress,
      );
      if (currentAllowance < amountWei) {
        const approveTx = await (
          erc20.approve as (spender: string, amount: bigint) => Promise<{ wait: () => Promise<unknown> }>
        )(tallyAddress, amountWei);
        await approveTx.wait();
      }

      const tx = await (tally.deposit as (amount: bigint) => Promise<{ wait: () => Promise<unknown> }>)(amountWei);
      await tx.wait();

      // refresh balances and show success
      await refreshTokenData();
      setDepositedAmount(amount);
      setIsSuccess(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setAmount("");
        setIsSuccess(false);
        setDepositedAmount("");
      }, 3000);
    } catch (e: unknown) {
      if ((e as { code?: string }).code === "ACTION_REJECTED") {
        setError("Transaction rejected");
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, tokenAddress, tallyAddress, canSubmit, amount, tokenDecimals, refreshTokenData]);

  // direct transfer flow removed; deposit uses approve + tally.deposit only

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <Button
        className="w-full sm:w-auto"
        size="auto"
        variant="primary"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Donate
      </Button>

      <Dialog
        description={
          tokenAddress && tokenAddress !== ZeroAddress
            ? `Enter amount of ${tokenSymbol || "tokens"} to donate.`
            : "Fetching payout token information..."
        }
        isLoading={isLoading}
        isOpen={isOpen}
        size="sm"
        title="Donate to Round"
        onOpenChange={setIsOpen}
      >
        <div className="flex w-full flex-col gap-3">
          <InputWrapper>
            <Input
              className="no-spinner"
              min="0"
              placeholder="0.0"
              step="any"
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;
                setAmount(value);

                // Validate amount
                if (value && !Number.isNaN(Number(value))) {
                  if (Number(value) > Number(balance)) {
                    setValidationError("Amount exceeds balance");
                  } else if (Number(value) <= 0) {
                    setValidationError("Amount must be greater than 0");
                  } else {
                    setValidationError(undefined);
                  }
                } else if (value) {
                  setValidationError("Please enter a valid number");
                } else {
                  setValidationError(undefined);
                }
              }}
            />

            <InputAddon>{tokenSymbol || "TOKEN"}</InputAddon>
          </InputWrapper>

          {chainName && (
            <p className="text-xs text-gray-400">
              <span>Network: {chainName}</span>
            </p>
          )}

          {tokenAddress && (
            <p className="text-xs text-gray-400">
              <span>Token: {tokenAddress}</span>

              <span> • </span>

              <span>Balance:</span>

              <span> </span>

              <span>{balance}</span>

              <span> </span>

              <span>{tokenSymbol}</span>

              <span> • </span>

              <span>Allowance:</span>

              <span> </span>

              <span>{allowance}</span>

              <span> </span>

              <span>{tokenSymbol}</span>
            </p>
          )}

          {validationError && (
            <p className="text-xs font-medium" style={{ color: "#dc2626" }}>
              {validationError}
            </p>
          )}

          {isSuccess && (
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="mb-2 flex justify-center">
                <CheckCircle className="h-8 w-8" style={{ color: "#16a34a" }} />
              </div>

              <p className="text-sm font-semibold text-green-800">
                <span>Successfully deposited </span>

                <span>{depositedAmount}</span>

                <span> </span>

                <span>{tokenSymbol}</span>
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="mt-2 flex w-full flex-col gap-2">
            <Button
              disabled={isLoading || !canSubmit}
              size="auto"
              variant={canSubmit && !isLoading ? "primary" : "secondary"}
              onClick={handleDeposit}
            >
              {isLoading ? "Processing..." : "Approve & Deposit"}
            </Button>

            <Button
              as="a"
              href="https://app.uniswap.org/"
              rel="noopener noreferrer"
              size="auto"
              target="_blank"
              variant="outline"
            >
              Need to swap? Use Uniswap
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DepositButton;
