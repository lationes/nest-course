import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import * as process from "process";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                RefreshTokenStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: process.env.REFRESH_TOKEN_SECRET,
            passReqToCallback: true,
        });
    }

    private static extractJWT(req): string | null {
        if (req.cookies && req.cookies.refreshToken) {
            return req.cookies.refreshToken;
        }
        return null;
    }

    validate(req: Request, payload: any) {
        const refreshToken = req.cookies && req.cookies.refreshToken;
        return { ...payload, refreshToken };
    }
}