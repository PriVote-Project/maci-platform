import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { FilterSchema } from "~/features/filter/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchApprovedProjectsWithMetadata,
  fetchProjects,
  fetchProjectsByAddress,
  fetchApprovedProjectByIndex,
  fetchProjectById,
} from "~/utils/fetchProjects";
import { getProjectCount } from "~/utils/registry";

import type { Chain, Hex } from "viem";

export const projectsRouter = createTRPCRouter({
  count: publicProcedure
    .input(z.object({ chain: z.custom<Chain>(), registryAddress: z.string() }))
    .query(async ({ input }) =>
      getProjectCount(input.chain, input.registryAddress as Hex).then((count) => ({
        count,
      })),
    ),

  get: publicProcedure
    .input(z.object({ ids: z.array(z.string()), registryAddress: z.string() }))
    .query(async ({ input: { ids, registryAddress } }) => {
      if (!ids.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // First, try to find the project in the cached data
      const projects = await fetchProjects(registryAddress);
      let project = projects.find((p) => ids.includes(p.id));

      // If not found in cache, make a direct subgraph call for the first ID
      if (!project && ids[0]) {
        const directFetch = await fetchProjectById(ids[0]);
        project = directFetch ?? undefined;
      }

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return project;
    }),

  getWithMetadataById: publicProcedure
    .input(z.object({ projectId: z.string(), registryAddress: z.string() }))
    .query(async ({ input: { projectId, registryAddress } }) => {
      const projects = await fetchApprovedProjectsWithMetadata("", registryAddress);
      return projects.find((project) => project?.id === projectId);
    }),

  search: publicProcedure
    .input(FilterSchema.extend({ search: z.string(), registryAddress: z.string() }))
    .query(async ({ input }) =>
      // get the projects that are approved
      fetchApprovedProjectsWithMetadata(input.search, input.registryAddress),
    ),

  projects: publicProcedure
    .input(FilterSchema.extend({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchProjects(input.registryAddress)),

  getMine: publicProcedure
    .input(z.object({ registryAddress: z.string(), address: z.string() }))
    .query(async ({ input }) => fetchProjectsByAddress(input.registryAddress, input.address)),

  getApprovedByIndex: publicProcedure
    .input(z.object({ registryAddress: z.string(), index: z.string() }))
    .query(async ({ input }) => fetchApprovedProjectByIndex(input.registryAddress, input.index)),

  // Used for distribution to get the projects' payoutAddress
  // To get this data we need to fetch all projects and their metadata
  // payoutAddresses: publicProcedure.input(z.object({ ids: z.array(z.string()) })).query(async ({ input }) =>
  //   fetchAttestations([eas.schemas.metadata], {
  //     where: { id: { in: input.ids } },
  //   })
  //     .then((attestations) =>
  //       Promise.all(
  //         attestations.map((attestation) =>
  //           fetchMetadata(attestation.metadataPtr).then((data) => {
  //             const { payoutAddress } = data as unknown as {
  //               payoutAddress: string;
  //             };

  //             return { projectId: attestation.id, payoutAddress };
  //           }),
  //         ),
  //       ),
  //     )
  //     .then((projects) => projects.reduce((acc, x) => ({ ...acc, [x.projectId]: x.payoutAddress }), {})),
  // ),
});
