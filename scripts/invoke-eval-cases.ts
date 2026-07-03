export type InvokeEvalLanguage = "en" | "zh";
export type InvokeEvalSplit = "train" | "validation";

export interface InvokeEvalThresholds {
  criticalFailuresAllowed: number;
  minimumNegativeSpecificity: number;
  minimumOverallAccuracy: number;
  minimumPositiveRecall: number;
}

export interface InvokeEvalQuery {
  category?: string;
  critical?: boolean;
  id?: string;
  language?: InvokeEvalLanguage;
  query: string;
  reason: string;
  shouldTrigger: boolean;
}

export interface InvokeEvalCase extends Required<InvokeEvalQuery> {
  split: InvokeEvalSplit;
}

export interface InvokeEvalCaseSet {
  cases?: Array<InvokeEvalQuery & { split: InvokeEvalSplit }>;
  description: string;
  kind?: "nonce-skill-invoke-cases";
  passingThreshold?: number;
  runsPerCase?: number;
  runsPerQuery?: number;
  schemaVersion?: number;
  skill: string;
  thresholds?: Partial<InvokeEvalThresholds>;
  train?: InvokeEvalQuery[];
  validation?: InvokeEvalQuery[];
}

export const defaultInvokeThresholds: InvokeEvalThresholds = {
  criticalFailuresAllowed: 0,
  minimumNegativeSpecificity: 0.9,
  minimumOverallAccuracy: 0.9,
  minimumPositiveRecall: 0.9,
};

export const inferLanguage = (query: string): InvokeEvalLanguage =>
  /[\u3400-\u9fff]/.test(query) ? "zh" : "en";

export const getInvokeRunsPerCase = (caseSet: InvokeEvalCaseSet): number =>
  caseSet.runsPerCase ?? caseSet.runsPerQuery ?? 1;

export const getInvokeThresholds = (caseSet: InvokeEvalCaseSet): InvokeEvalThresholds => ({
  ...defaultInvokeThresholds,
  ...(caseSet.passingThreshold
    ? {
        minimumNegativeSpecificity: caseSet.passingThreshold,
        minimumOverallAccuracy: caseSet.passingThreshold,
        minimumPositiveRecall: caseSet.passingThreshold,
      }
    : {}),
  ...caseSet.thresholds,
});

export const flattenInvokeCases = (caseSet: InvokeEvalCaseSet): InvokeEvalCase[] => {
  const sourceCases =
    caseSet.cases ??
    ([
      ...(caseSet.train ?? []).map((evalCase) => ({ ...evalCase, split: "train" as const })),
      ...(caseSet.validation ?? []).map((evalCase) => ({
        ...evalCase,
        split: "validation" as const,
      })),
    ] satisfies Array<InvokeEvalQuery & { split: InvokeEvalSplit }>);

  const counters = new Map<string, number>();
  return sourceCases.map((evalCase) => {
    const triggerClass = evalCase.shouldTrigger ? "trigger" : "negative";
    const counterKey = `${evalCase.split}.${triggerClass}`;
    const counter = (counters.get(counterKey) ?? 0) + 1;
    counters.set(counterKey, counter);

    const fallbackId = `${evalCase.split}.${triggerClass}.${String(counter).padStart(2, "0")}`;
    const id = evalCase.id ?? fallbackId;

    return {
      category: evalCase.category ?? `${triggerClass}.invoke`,
      critical: evalCase.critical ?? true,
      id,
      language: evalCase.language ?? inferLanguage(evalCase.query),
      query: evalCase.query,
      reason: evalCase.reason,
      shouldTrigger: evalCase.shouldTrigger,
      split: evalCase.split,
    };
  });
};
