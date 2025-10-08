import { type InfiniteData } from "@tanstack/react-query";
import { type UseTRPCInfiniteQueryResult } from "@trpc/react-query/shared";
import { useMemo, useState } from "react";

import { useFilter } from "~/features/filter/hooks/useFilter";
import { OrderBy, SortOrder } from "~/features/filter/types";
import { IRecipient } from "~/utils/types";

type RandomizedProjectsResult = UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown>;

export function useRandomizedProjects(projects: RandomizedProjectsResult, pollId: string): RandomizedProjectsResult {
  const { orderBy, sortOrder } = useFilter();
  const [randomSeed] = useState(() => {
    try {
      if (typeof window === "undefined") {
        return Math.random();
      }

      const storedSeed = window.localStorage.getItem(`projectRandomSeed-${pollId}`);
      if (storedSeed) {
        return parseFloat(storedSeed);
      }
      const newSeed = Math.random();
      window.localStorage.setItem(`projectRandomSeed-${pollId}`, newSeed.toString());
      return newSeed;
    } catch {
      return Math.random();
    }
  });

  // @ts-expect-error - this is a temporary fix to allow the randomized projects to be used in the projects component
  return useMemo(() => {
    if (!projects.data) {
      return projects as RandomizedProjectsResult;
    }

    const data = projects.data as InfiniteData<IRecipient[]>;

    const sortProjects = (page: IRecipient[]): IRecipient[] => {
      const sorted = [...page];

      if (orderBy === OrderBy.name) {
        // Sort by name alphabetically
        sorted.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();

          if (sortOrder === SortOrder.asc) {
            return nameA.localeCompare(nameB);
          }
          return nameB.localeCompare(nameA);
        });
      } else {
        // Random sort using seed (default for OrderBy.random)
        sorted.sort(() => randomSeed - 0.5);
      }

      return sorted;
    };

    return {
      ...projects,
      data: {
        ...data,
        pages: data.pages.map(sortProjects),
      },
    };
  }, [projects, randomSeed, orderBy, sortOrder]);
}
