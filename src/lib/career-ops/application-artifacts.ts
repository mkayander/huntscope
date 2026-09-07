export type ApplicationArtifactSource = "linked" | "inferred";

export type ApplicationArtifactRef = {
  value: string;
  path: string;
  label: string;
  source: ApplicationArtifactSource;
};
