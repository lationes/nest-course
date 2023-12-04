import {Body, HttpException, HttpStatus, Injectable, Post, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {User} from "../users/models/users.model";
import {TokenDataDto} from "./dto/token-data.dto";
import {ConfigService} from "@nestjs/config";
import {InjectModel} from "@nestjs/sequelize";
import {Token, TokenCreationAttrs} from "./models/token.model";
import {Request, Response} from "express";

@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private jwtService: JwtService,
                private readonly configService: ConfigService,
                @InjectModel(Token) private tokenRepository: typeof Token) {}

    async login(userDto: CreateUserDto, response: Response) {
        const user = await this.validateUser(userDto);
        const { accessToken, refreshToken } = await this.saveRefreshToken(Number(user.id));

        response.cookie('refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true } );
        response.status(HttpStatus.OK).send({ accessToken });
    }

    async registration(userDto: CreateUserDto, response: Response) {
        const candidate = await this.userService.getUsersByEmail(userDto.email);
        if (candidate) {
            throw new HttpException('User with this email already exisist', HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({...userDto, password: hashPassword});

        const { accessToken, refreshToken } = await this.saveRefreshToken(Number(user.id));

        response.cookie('refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true } );
        response.status(HttpStatus.OK).send({ accessToken });
    }

    async logout(request: Request, response: Response) {
        const { refreshToken } = request.cookies;

        if (refreshToken) {
            await this.removeRefreshToken(refreshToken);

            response.clearCookie('refreshToken');

            response.status(HttpStatus.OK).send({ message: 'Logout successfully' });
        }

        throw new UnauthorizedException({ message: 'User is unauthorized'});
    }

    async refresh(request: Request, response: Response) {
        try {
            const { refreshToken: oldRefreshToken } = request.cookies;

            const { id } = await this.jwtService.verifyAsync(oldRefreshToken, { secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')});

            if (!id) {
                throw new UnauthorizedException({ message: 'User is unauthorized'});
            }

            const { accessToken, refreshToken } = await this.saveRefreshToken(Number(id));

            response.cookie('refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true } );
            response.status(HttpStatus.OK).send({ accessToken });
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException({ message: 'User is unauthorized'});
        }
    }

    private async generateTokens(user: User) {
        const payload: TokenDataDto = {
            email: user.email,
            id: user.id,
            roles: user.roles.map(role => role.value),
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                payload,
                {
                    secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                    expiresIn: '30m',
                },
            ),
            this.jwtService.signAsync(
                payload,
                {
                    secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUsersByEmail(userDto.email);
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (user && passwordEquals) {
            return user;
        }
        throw new UnauthorizedException({ message: 'Incorrect password or email'});
    }

    private async saveRefreshToken(userId: number) {
        const user = await this.userService.findUser(userId);

        if (user) {
            const { accessToken, refreshToken } = await this.generateTokens(user);

            const savedRefreshToken = await this.tokenRepository.findOne({where: { userId }});

            if (savedRefreshToken) {
                await this.tokenRepository.update({ token: refreshToken }, { where: { userId }});
            } else {
                const tokenCreationAttrs: TokenCreationAttrs = {
                    token: refreshToken,
                    userId,
                };

                await this.tokenRepository.create(tokenCreationAttrs);
            }

            return { accessToken, refreshToken };
        }

        throw new HttpException('There is no such user', HttpStatus.NOT_FOUND);
    }

    private async removeRefreshToken(token: string) {
        const savedRefreshToken = await this.tokenRepository.destroy({where: { token }});

        return { savedRefreshToken };
    }
}
