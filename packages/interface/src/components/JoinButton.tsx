/* eslint-disable no-console */
import { decStringToBigIntToUuid } from "@pcd/util";
import { ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { zuAuthPopup } from "@pcd/zuauth";
import { Info } from "lucide-react";
import { GatekeeperTrait, getZupassGatekeeperData } from "maci-cli/sdk";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { zupass, config, gitcoinPassport } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { jsonPCD } from "~/utils/types";

import type { EdDSAPublicKey } from "@pcd/eddsa-pcd";

import { Button } from "./ui/Button";

export const JoinButton = (): JSX.Element => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup, gatekeeperTrait, storeZupassProof } = useMaci();
  const signer = useEthersSigner();
  const { address } = useAccount();

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(() => onSignup(onError), [onSignup, onError]);

  const handleZupassVerify = useCallback(async () => {
    if (address !== undefined && signer) {
      const zupassGatekeeperData = await getZupassGatekeeperData({ maciAddress: config.maciAddress!, signer });
      const eventId = decStringToBigIntToUuid(zupassGatekeeperData.eventId);
      const result = await zuAuthPopup({
        fieldsToReveal: {
          revealTicketId: true,
          revealEventId: true,
        },
        watermark: address,
        config: [
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            eventName: zupass.eventName,
          },
        ],
      });
      if (result.type === "pcd") {
        try {
          const parsedPCD = (JSON.parse(result.pcdStr) as jsonPCD).pcd;
          const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(parsedPCD);
          await storeZupassProof(pcd);
        } catch (e) {
          console.error("zupass error:", e);
        }
      }
    }
  }, [signer, address, storeZupassProof]);

  if (!isEligibleToVote && gatekeeperTrait === GatekeeperTrait.Zupass) {
    return (
      <div>
        <Button
          size="auto"
          variant={isRegistered === undefined || isLoading ? "disabled" : "primary"}
          onClick={handleZupassVerify}
        >
          Generate Zupass Proof
        </Button>
      </div>
    );
  }

  if (isEligibleToVote && !isRegistered) {
    return (
      <div>
        <Button
          size="auto"
          variant={isRegistered === undefined || isLoading ? "disabled" : "primary"}
          onClick={handleSignup}
        >
          Voter sign up
        </Button>
      </div>
    );
  }

  if (!isEligibleToVote) {
    return (
      <div className="flex flex-col gap-2">
        <Button size="auto" variant="disabled">
          You are not allowed to vote
        </Button>

        {gatekeeperTrait === GatekeeperTrait.GitcoinPassport && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
            <Info className="h-4 w-4 flex-shrink-0" />

            <span>Requires Gitcoin Passport score ≥ {gitcoinPassport.passingScore / 100}.</span>

            <a
              className="underline hover:text-blue-700 dark:hover:text-blue-100"
              href="https://app.passport.xyz"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get your score
            </a>
          </div>
        )}
      </div>
    );
  }

  return <div />;
};
