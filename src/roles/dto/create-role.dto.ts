import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsString} from "class-validator";

export class CreateRoleDto {
    @ApiProperty({example: 'USER', description: 'ROLE NAME'})
    @IsString({message: 'Should be string'})
    readonly value: string;
    @ApiProperty({example: 'User of the app', description: 'Description of the role'})
    @IsString({message: 'Should be string'})
    readonly description: string;
}