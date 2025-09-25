import { FileUpload } from '../../interfaces/upload.interface';
import { MinioConfig } from '../../interfaces/MinioConfig.interface';
import { Client } from 'minio';

export class MinioAdapter implements FileUpload {
    private minioClient: Client;
    private bucketName: string = 'cardaloom';

    constructor(config: MinioConfig) {
        this.minioClient = new Client({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: config.accessKey,
            secretKey: config.secretKey,
        });
        this.bucketName = config.bucketName;
    }

    async uploadFile(
        buffer: Buffer,
        fileName: string,
        mimeType: string,
        companyDocumentNumber: string
    ): Promise<{ fileId: string; filePath: string }> {

        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);
            if (!bucketExists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            }

            const filePath = `${companyDocumentNumber}/${Date.now()}-${fileName}`;
            const uploadResult = await this.minioClient.putObject(
                this.bucketName,
                filePath,
                buffer,
                buffer.length,
                {
                    'Content-Type': mimeType,
                }
            );
           
            return { fileId: uploadResult.etag, filePath: filePath };
        } catch (error: any) {            
            throw new Error(`Ocorreu um erro ao fazer o upload: ${error.message}`);
        }
    }

    getFileLink(fileName: string, fileExpension: string, companyDocumentNumber: string, completeLink?: string | null): string {
        if (completeLink) {
            return `http://172.19.0.3:9000/cardaloom/${completeLink}`;
        }
        return `http://172.19.0.3:9000/cardaloom/${companyDocumentNumber}/${fileName}.${fileExpension}`;
    }
}