import { type UseMutationResult, useMutation } from "@tanstack/react-query";

import { config, eas } from "~/config";
import { useAttest } from "~/hooks/useEAS";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { createAttestation } from "~/lib/eas/createAttestation";
import { encodeBytes32String } from "ethers";

// TODO: Move this to a shared folders
export interface TransactionError {
  reason?: string;
  data?: { message: string };
}

export function useApproveVoters(options: {
  onSuccess: () => void;
  onError: (err: TransactionError) => void;
}): UseMutationResult<void, TransactionError, string[]> {
  const attest = useAttest();
  const signer = useEthersSigner();

  return useMutation<void, TransactionError, string[]>({
    mutationFn: async (voters: string[]) => {
      if (!signer) {
        throw new Error("Connect wallet first");
      }

      /// TODO: should be changed to event name instead of roundId
      const attestations = await Promise.all(
        voters.map((recipient) =>
          createAttestation(
            {
              values: {
                type: encodeBytes32String("voter"),
                round: encodeBytes32String(config.eventName),
              },
              schemaUID: eas.schemas.approval,
              recipient,
            },
            signer,
          ),
        ),
      );
      await attest.mutateAsync(attestations.map((att) => ({ ...att, data: [att.data] })));
      return;
    },
    ...options,
  });
}
