import { useController, useFormContext } from "react-hook-form";
import { z } from "zod";

import { ErrorMessage, Label } from "~/components/ui/Form";
import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";

import { MetadataSchema } from "../types";

export const ImpactTags = (): JSX.Element => {
  const { control, watch, formState } = useFormContext<z.infer<typeof MetadataSchema>>();
  const { field } = useController({
    name: "impactCategory",
    control,
  });

  const selected = watch("impactCategory") ?? [];

  const error = formState.errors.impactCategory;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>
          Impact categories<span className="text-[var(--brand-500)]">*</span>
        </Label>

        <span className="font-sans text-sm font-normal leading-5 text-gray-400">
          Please select the categories your project is related to{" "}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(impactCategories).map(([value, { label }]) => {
          const isSelected = selected.includes(value);
          return (
            <Tag
              key={value}
              selected={isSelected}
              size="sm"
              onClick={() => {
                const currentlySelected = isSelected ? selected.filter((s) => s !== value) : selected.concat(value);

                field.onChange(currentlySelected);
              }}
            >
              {label}
            </Tag>
          );
        })}
      </div>

      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
