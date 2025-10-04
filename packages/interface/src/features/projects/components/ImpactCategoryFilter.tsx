import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";

export interface IImpactCategoryFilterProps {
  selectedCategories: string[];
  onCategoryClick: (category: string) => void;
}

export const ImpactCategoryFilter = ({
  selectedCategories,
  onCategoryClick,
}: IImpactCategoryFilterProps): JSX.Element => {
  const categories = Object.keys(impactCategories);

  return (
    <div className="mb-6 flex flex-col gap-3">
      <h4 className="font-sans text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">
        Filter by Impact Category
      </h4>

      <div className="flex flex-wrap gap-2">
        {categories.map((key) => (
          <Tag
            key={key}
            selected={selectedCategories.includes(key)}
            size="sm"
            onClick={() => {
              onCategoryClick(key);
            }}
          >
            {impactCategories[key as keyof typeof impactCategories].label}
          </Tag>
        ))}
      </div>

      {selectedCategories.length > 0 && (
        <button
          className="self-start text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          type="button"
          onClick={() => {
            // Clear all selections by clicking each one
            selectedCategories.forEach((cat) => {
              onCategoryClick(cat);
            });
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};
