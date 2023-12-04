import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import * as fsPromise from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import {ConfigService} from "@nestjs/config";
import {PutObjectCommand, PutObjectCommandInput, PutObjectCommandOutput, S3Client} from "@aws-sdk/client-s3";

@Injectable()
export class FilesService {
    private readonly region = this.configService.getOrThrow('AWS_S3_REGION');
    private readonly s3Client = new S3Client({
        region: this.region,

    })
    constructor(private readonly configService: ConfigService) {}

    async createFile(file: Express.Multer.File): Promise<string> {
        try {
            const bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
            const fileName = uuid.v4();
            const input: PutObjectCommandInput = {
                Body: file.buffer,
                Bucket: bucket,
                Key: fileName,
                ContentType: file.mimetype,
                ACL: 'public-read',
            };

            const response: PutObjectCommandOutput = await this.s3Client.send(
                new PutObjectCommand(input),
            );

            if (response.$metadata.httpStatusCode === 200) {
                return `https://${bucket}.s3.${this.region}.amazonaws.com/${fileName}`
            }
            throw new HttpException('Error during file upload', HttpStatus.INTERNAL_SERVER_ERROR)
        } catch (e) {
            console.log(e)
            throw new HttpException('Error during file upload', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
