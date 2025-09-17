import { config } from "~/config";

import type { Tally } from "./types";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

export interface GraphQLResponse {
  data?: {
    tally: Tally;
  };
}

const tallyQuery = `
  query Tally {
    tally(id: $id) {
      id
      results {
        id
        result
      }
    }
  }
`;

const talliesQuery = `
  query Tally {
    tallies {
      id
      results {
        id
        result
      }
    }
  }
`;

const tallyFundsQuery = `
  query TallyFunds {
    tally(id: $id) {
      id
      deposits { amount }
      claims { amount }
    }
  }
`;

const claimsByTallyQuery = `
  query ClaimsByTally($tally: Bytes!) {
    claims(where: { tally: $tally }) { id amount }
  }
`;

/**
 * Fetches the tally data from the subgraph
 *
 * @param id the address of the tally contract
 * @returns The tally data
 */
export async function fetchTally(id: string): Promise<Tally | undefined> {
  return cachedFetch<{ tally: Tally }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: tallyQuery.replace("id: $id", `id: "${id}"`),
    }),
  })
    .then((response: GraphQLResponse) => response.data?.tally)
    .catch(() => undefined);
}

/**
 * Fetches all the tallies from the subgraph
 *
 * @returns The on-chain tallies
 */
export async function fetchTallies(): Promise<Tally[] | undefined> {
  return cachedFetch<{ tallies: Tally[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: talliesQuery,
    }),
  })
    .then((r) => r.data.tallies)
    .catch(() => []);
}

/**
 * Fetches deposit and claim amounts for a tally and returns string totals in raw token units
 */
export async function fetchTallyFunds(id: string): Promise<{ deposited: string; claimed: string; available: string }> {
  interface AmountRecord {
    amount: string;
  }
  interface TallyFunds {
    tally?: { deposits?: AmountRecord[]; claims?: AmountRecord[] };
  }
  interface FundsResp {
    data?: TallyFunds;
  }
  return cachedFetch<unknown>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: tallyFundsQuery.replace("id: $id", `id: "${id}"`),
    }),
  })
    .then((raw) => {
      const response = raw as FundsResp;
      const { data } = response;
      const deposits: AmountRecord[] = data?.tally?.deposits ?? [];
      const claims: AmountRecord[] = data?.tally?.claims ?? [];
      const deposited = deposits.reduce((acc: bigint, d: AmountRecord) => acc + BigInt(d.amount), BigInt(0));
      const claimed = claims.reduce((acc: bigint, c: AmountRecord) => acc + BigInt(c.amount), BigInt(0));
      const available = deposited > claimed ? deposited - claimed : BigInt(0);
      return {
        deposited: deposited.toString(),
        claimed: claimed.toString(),
        available: available.toString(),
      };
    })
    .catch(() => ({ deposited: "0", claimed: "0", available: "0" }));
}

/**
 * Fetches per-recipient claim amounts for a tally.
 */
export async function fetchTallyClaims(id: string): Promise<Record<string, string>> {
  interface ClaimRecord {
    id: string;
    amount: string;
  }
  interface ClaimsData {
    claims?: ClaimRecord[];
  }
  interface ClaimsResp {
    data?: ClaimsData;
    errors?: unknown;
  }
  return cachedFetch<unknown>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: claimsByTallyQuery,
      variables: { tally: id.toLowerCase() },
    }),
  })
    .then((raw) => {
      const response = raw as ClaimsResp;
      const claims = response.data?.claims ?? [];
      return Object.fromEntries(claims.map((c) => [String(c.id), String(c.amount)] as const));
    })
    .catch(() => ({}));
}
