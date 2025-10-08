import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useDebounce } from "react-use";

import { useFilter } from "~/features/filter/hooks/useFilter";
import { OrderBy, SortOrder } from "~/features/filter/types";

import type { SortType } from "~/features/filter/hooks/useFilter";

import { SortByDropdown } from "./SortByDropdown";
import { SearchInput } from "./ui/Form";

export interface ISortFilterProps {
  onSearchChange: (search: string) => void;
}

export const SortFilter = ({ onSearchChange }: ISortFilterProps): JSX.Element => {
  const { orderBy, sortOrder, setFilter } = useFilter();

  const [search, setSearch] = useState("");
  useDebounce(() => setFilter({ search }), 500, [search]);

  const onChangeSearchInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearch(term);
      onSearchChange(term);
    },
    [setSearch, onSearchChange],
  );

  const onChangeSortByDropdown = useCallback(
    async (sort: string) => {
      const [order, sorting] = sort.split("_") as [OrderBy, SortOrder];

      await setFilter({ orderBy: order, sortOrder: sorting }).catch();
    },
    [setFilter],
  );

  // Compute the current sort value, empty string if random (no selection)
  const currentSortValue = useMemo<SortType | "">(() => {
    const value = `${orderBy}_${sortOrder}`;
    // If orderBy is random, return empty string (no option selected)
    return orderBy === OrderBy.random ? "" : (value as SortType);
  }, [orderBy, sortOrder]);

  return (
    <div className="mb-2 flex flex-1 gap-2">
      <SearchInput className="w-full" placeholder="Search project..." value={search} onChange={onChangeSearchInput} />

      <SortByDropdown options={["name_asc", "name_desc"]} value={currentSortValue} onChange={onChangeSortByDropdown} />
    </div>
  );
};
