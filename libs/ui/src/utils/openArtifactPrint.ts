export const openArtifactPrint = (artifactId: string) => {
  window.open(
    `${window.location.hostname}?printArtifactId=${artifactId}&autoPrint=true`,
  );
};
