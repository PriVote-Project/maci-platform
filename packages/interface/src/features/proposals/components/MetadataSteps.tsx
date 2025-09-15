import { cn } from "~/utils/classNames";

export enum EStepState {
  DEFAULT = -1,
  ACTIVE = 0,
  DONE = 1,
}

interface IStepCategoryProps {
  title: string;
  progress: EStepState;
}

interface IMetadataStepsProps {
  step: number;
}

const StepCategory = ({ title, progress }: IStepCategoryProps): JSX.Element => (
  <div className="flex items-center gap-1 text-xs sm:gap-[11px] sm:text-base">
    <div className="w-[22px]">
      {progress === EStepState.ACTIVE && (
        <svg
          aria-hidden
          className="h-[22px] w-[22px] text-[var(--brand-500)]"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" fill="none" r="10" stroke="currentColor" strokeWidth="2" />

          <path
            d="M8 12l2.5 2.5L16 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )}

      {progress >= EStepState.DONE && (
        <svg
          aria-hidden
          className="h-[22px] w-[22px] text-[var(--brand-500)]"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" />

          <path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )}

      {progress <= EStepState.DEFAULT && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
    </div>

    <div
      className={cn(
        "w-fit font-sans font-normal",
        progress === EStepState.ACTIVE ? "text-[var(--brand-500)]" : "text-gray-300",
      )}
    >
      {title}
    </div>
  </div>
);

const Interline = (): JSX.Element => <div className="h-[1px] w-4 bg-gray-200 sm:w-9" />;

export const MetadataSteps = ({ step }: IMetadataStepsProps): JSX.Element => (
  <div className="flex items-center gap-1 lg:gap-5">
    <StepCategory progress={step} title="Project Profile" />

    <Interline />

    <StepCategory progress={step - 1} title="Contribution & Impact" />

    <Interline />

    <StepCategory progress={step - 2} title="Review & Submit" />
  </div>
);
