import type { IRequest } from "~/utils/types";

import { SelectAllButton } from "./SelectAllButton";

interface IRequestsHeaderProps {
  requests?: IRequest[];
}

export const RequestsHeader = ({ requests = [] }: IRequestsHeaderProps): JSX.Element => (
  <div className="dark:bg-lighterBlack flex items-center bg-gray-50 py-4">
    <div className="flex-1 justify-center">
      <SelectAllButton requests={requests} />
    </div>

    <div className="flex-[2] font-sans text-sm font-medium tracking-[0.6px] sm:flex-[7] sm:pl-6">Project</div>

    <div className="flex-[3] font-sans text-sm font-medium tracking-[0.6px]">Submitted on</div>

    <div className="flex-[2] font-sans text-sm font-medium tracking-[0.6px]">Type</div>

    <div className="flex-[2] font-sans text-sm font-medium tracking-[0.6px]">Status</div>
  </div>
);
