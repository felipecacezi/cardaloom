export interface FileUpload {
    uploadFile(
        buffer: Buffer,
        fileName: string,
        mimeType: string,
        companyDocumentNumber: string
    ): Promise<{ fileId: string; filePath: string }>;
    getFileLink(fileName: string, fileExpension: string, companyDocumentNumber: string, completeLink?: string | null): string;
}