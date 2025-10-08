import { Contract, JsonRpcProvider } from "ethers";

import { gitcoinPassport, getRPCURL } from "~/config";

// ABI for the getScore function
const DECODER_ABI = [
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

/**
 * Fetch the Gitcoin Passport score for a given address
 * @param address - The user's wallet address
 * @returns The score divided by 100, or 0 if there's an error
 */
export async function fetchGitcoinPassportScore(address: string): Promise<number> {
  try {
    if (!gitcoinPassport.decoderAddress) {
      return 0;
    }

    const rpcUrl = getRPCURL();
    if (!rpcUrl) {
      return 0;
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const decoderContract = new Contract(gitcoinPassport.decoderAddress, DECODER_ABI, provider);

    // Call getScore function
    const getScore = decoderContract.getFunction("getScore");
    const score = (await getScore(address)) as bigint;

    // Convert BigInt to number and divide by 100 as per contract specification
    const normalizedScore = Number(score) / 100;

    return normalizedScore;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if a user is eligible based on their Gitcoin Passport score
 * @param address - The user's wallet address
 * @returns true if the user's score meets the passing threshold
 */
export async function checkGitcoinPassportEligibility(address: string): Promise<boolean> {
  const score = await fetchGitcoinPassportScore(address);
  return score >= gitcoinPassport.passingScore;
}
