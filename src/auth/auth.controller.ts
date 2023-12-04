import {Body, Controller, Post, Req, Res, UseGuards} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {Request, Response} from "express";
import {RefreshTokenGuard} from "./guards/refresh-token.guard";
import {AccessTokenGuard} from "./guards/access-token.guard";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    login(@Body() userDto: CreateUserDto, @Res() response: Response) {
        return this.authService.login(userDto, response);
    }

    @Post('/registration')
    registration(@Body() userDto: CreateUserDto, @Res() response: Response) {
        return this.authService.registration(userDto, response);
    }

    @UseGuards(AccessTokenGuard)
    @Post('/logout')
    logout(@Req() request: Request, @Res() response: Response) {
        return this.authService.logout(request, response);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('/refresh')
    refresh(@Req() request: Request, @Res() response: Response) {
        return this.authService.refresh(request, response);
    }
}
