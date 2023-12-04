import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class CreatePostDto {
    @ApiProperty({example: 'Title', description: 'Title of the post'})
    @IsString({message: 'Should be string'})
    readonly title: string;
    @ApiProperty({example: 'Lorem ipsum', description: 'Content of the post'})
    @IsString({message: 'Should be string'})
    readonly content: string;
}