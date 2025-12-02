export const openArtifactPrint = (artifactId: string) => {
  window.open(
    `${window.location.protocol}//${window.location.hostname}?printArtifactId=${artifactId}&autoPrint=true`,
  );
};
