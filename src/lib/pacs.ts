export type PacsFileMetadata = {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
};

export async function registerStudyFileForPacs(_studyId: string, metadata: PacsFileMetadata) {
  // PACS integration placeholder: DICOMweb / HL7 order binding can be added here.
  return {
    externalStudyUid: null,
    viewerUrl: null,
    metadata
  };
}
