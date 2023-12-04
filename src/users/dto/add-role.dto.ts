import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsString} from "class-validator";

export class AddRoleDto {
    @ApiProperty({example: 'ADMIN', description: 'Role name'})
    @IsString({message: 'Should be string'})
    readonly value: string;
    @ApiProperty({example: 1, description: 'User id'})
    @IsNumber({},{message: 'Should be number'})
    readonly userId: number;
}