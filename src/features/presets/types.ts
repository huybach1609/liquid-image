export type PresetScope = "single" | "batch" | "shared";

export type PresetSummary = {
  id: string;
  name: string;
  scope: PresetScope;
  updatedAt: number;
};
