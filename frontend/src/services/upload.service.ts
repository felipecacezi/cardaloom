import { FileUpload } from "../interfaces/upload.interface";

export class UploadService {
    private uploader: FileUpload;

    constructor(uploader: FileUpload) {
        this.uploader = uploader;
    }

    async uploadFile(
        buffer: Buffer,
        fileName: string,
        mimeType: string,
        companyDocumentNumber: string
    ): Promise<{ fileId: string; filePath: string }> {
        return await this.uploader.uploadFile(buffer, fileName, mimeType, companyDocumentNumber);
    }

    getPublicLink(fileName: string, fileExpension: string, companyDocumentNumber: string, completeLink?: string | null): string {
        return this.uploader.getFileLink(fileName, fileExpension, companyDocumentNumber, completeLink);
    }
}