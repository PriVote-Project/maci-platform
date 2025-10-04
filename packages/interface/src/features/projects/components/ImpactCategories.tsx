import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";

export interface IImpacCategoriesProps {
  tags?: string[];
  onCategoryClick?: (category: string) => void;
  selectedCategories?: string[];
}

export const ImpactCategories = ({
  tags = undefined,
  onCategoryClick = undefined,
  selectedCategories = [],
}: IImpacCategoriesProps): JSX.Element => (
  <div className="no-scrollbar">
    <div className="flex gap-[6px] overflow-x-auto">
      {tags?.map((key) => (
        <div key={key}>
          {Object.keys(impactCategories).includes(key) ? (
            <Tag
              selected={selectedCategories.includes(key)}
              size="xs"
              onClick={
                onCategoryClick
                  ? (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCategoryClick(key);
                    }
                  : undefined
              }
            >
              {impactCategories[key as keyof typeof impactCategories].label}
            </Tag>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);
