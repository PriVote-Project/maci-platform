import { config } from "~/config";
import { Metadata } from "~/features/proposals/types";

import { createCachedFetch } from "./fetch";
import { fetchMetadata } from "./fetchMetadata";
import { getGraphAuthHeaders } from "./graphql";
import { IRecipient } from "./types";

const cachedFetch = createCachedFetch({ ttl: 1000 });

export interface GraphQLResponse {
  data?: {
    recipients: IRecipient[];
  };
}

// Query to fetch all approved projects
const ApprovedProjects = `
  query Recipients($registryAddress: String) {
    recipients(where:{ deleted: false, initialized: true, registry: $registryAddress }) {
      id
      payout
      metadataUrl
      index
      initialized
      registry {
        id
      }
    }
  }`;

// Query to fetch all projects, no matter approved or not
const Projects = `
  query Recipients($registryAddress: String) {
    recipients(where:{ registry: $registryAddress }) {
      id
      payout
      metadataUrl
      index
      initialized
      deleted
      registry {
        id
      }
    }
  }`;

// Query to fetch project by payout address
const ProjectsByAddress = `
  query ProjectsByAddress($registryAddress: String!, $address: String!) {
    recipients(where: { registry: $registryAddress, payout: $address, deleted: false  }) {
      id
      metadataUrl
      index
      initialized
      payout
      registry {
        id
      }
    }
  }
`;

const ApprovedProjectByIndex = `
  query ApprovedProjectByIndex($registryAddress: String!, $index: String!) {
    recipients(where: { registry: $registryAddress, deleted: false, initialized: true, index: $index }) {
      id
      metadataUrl
      index
      initialized
      payout
      registry {
        id
      }
    }
  }
`;

// Query to fetch a single project by ID
const ProjectById = `
  query ProjectById($id: String!) {
    recipients(where: { id: $id }) {
      id
      payout
      metadataUrl
      index
      initialized
      deleted
      registry {
        id
      }
    }
  }
`;

/**
 * Fetch all projects
 *
 * @returns the projects
 */
export async function fetchProjects(registryAddress: string): Promise<IRecipient[]> {
  const response = await cachedFetch<{ recipients: IRecipient[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: Projects,
      variables: { registryAddress },
    }),
    headers: getGraphAuthHeaders(),
  }).then((resp: GraphQLResponse) => resp.data?.recipients);

  const recipients = response?.map((request) => ({
    id: request.id,
    metadataUrl: request.metadataUrl,
    payout: request.payout,
    initialized: request.initialized,
    index: request.index,
    deleted: request.deleted,
  }));

  return recipients ?? [];
}

/**
 * Fetch all approved projects
 *
 * @returns the projects
 */
export async function fetchApprovedProjects(registryAddress: string): Promise<IRecipient[]> {
  const response = await cachedFetch<{ recipients: IRecipient[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: ApprovedProjects,
      variables: { registryAddress },
    }),
    headers: getGraphAuthHeaders(),
  }).then((resp: GraphQLResponse) => resp.data?.recipients);

  const recipients = response?.map((request) => ({
    id: request.id,
    metadataUrl: request.metadataUrl,
    payout: request.payout,
    initialized: request.initialized,
    index: request.index,
  }));

  return recipients ?? [];
}

/**
 * Fetch all approved projects with metadata
 * @param search
 * @param registryAddress
 * @returns the projects with metadata values filtered by the search term
 */
export async function fetchApprovedProjectsWithMetadata(
  search: string,
  registryAddress: string,
): Promise<(IRecipient | null)[]> {
  const response = await cachedFetch<{ recipients: IRecipient[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: ApprovedProjects,
      variables: { registryAddress },
    }),
    headers: getGraphAuthHeaders(),
  }).then((resp: GraphQLResponse) => resp.data?.recipients);

  if (!response) {
    return [];
  }

  const recipients = await Promise.all(
    response.map(async (request) => {
      const metadata = (await fetchMetadata(request.metadataUrl)) as unknown as Metadata;
      const name = metadata.name.toLowerCase();
      if (search !== "" && !name.includes(search.trim().toLowerCase())) {
        return null;
      }
      return {
        id: request.id,
        metadataUrl: request.metadataUrl,
        metadata,
        payout: request.payout,
        initialized: request.initialized,
        index: request.index,
        // Populate commonly used fields to avoid extra metadata fetches
        bannerImageUrl: metadata.bannerImageUrl,
        profileImageUrl: metadata.profileImageUrl,
        name: metadata.name,
        bio: metadata.bio,
        shortBio: metadata.shortBio,
        // Required for filtering functionality
        impactCategory: metadata.impactCategory,
      };
    }),
  );

  return recipients.filter((r) => r !== null);
}

/**
 * Fetch  projects of a specific payout address
 * @param registryAddress
 * @param address
 * @return only the projects with a specific payout address
 */
export async function fetchProjectsByAddress(registryAddress: string, address: string): Promise<IRecipient[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getGraphAuthHeaders(),
    },
    body: JSON.stringify({
      query: ProjectsByAddress,
      variables: { registryAddress, address },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.recipients;
}

/**
 * Fetch  projects of a specific payout address
 * @param registryAddress
 * @param index recipient index
 * @return only the projects with a specific payout address
 */
export async function fetchApprovedProjectByIndex(registryAddress: string, index: string): Promise<IRecipient[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getGraphAuthHeaders(),
    },
    body: JSON.stringify({
      query: ApprovedProjectByIndex,
      variables: { registryAddress, index },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data || result.data.recipients.length === 0) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.recipients;
}

/**
 * Fetch a single project by ID directly from subgraph (no cache)
 * @param projectId
 * @returns the project or null if not found
 */
export async function fetchProjectById(projectId: string): Promise<IRecipient | null> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getGraphAuthHeaders(),
    },
    body: JSON.stringify({
      query: ProjectById,
      variables: { id: projectId },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data || result.data.recipients.length === 0) {
    return null;
  }

  const project = result.data.recipients[0];

  if (!project) {
    return null;
  }

  return {
    id: project.id,
    metadataUrl: project.metadataUrl,
    payout: project.payout,
    initialized: project.initialized,
    index: project.index,
    deleted: project.deleted,
  };
}
