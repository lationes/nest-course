import {ApiProperty} from "@nestjs/swagger";
import {IsNumber} from "class-validator";

export class UserIdDto {
    @ApiProperty({example: 1, description: 'User id'})
    @IsNumber({},{message: 'Should be number'})
    readonly userId: number;
}