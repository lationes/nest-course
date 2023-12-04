import {forwardRef, Module} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import * as process from "process";
import {RefreshTokenStrategy} from "./strategies/refreshToken.strategy";
import {AccessTokenStrategy} from "./strategies/accessToken.strategy";
import {SequelizeModule} from "@nestjs/sequelize";
import {Token} from "./models/token.model";

@Module({
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenStrategy, AccessTokenStrategy],
  imports: [
      SequelizeModule.forFeature([Token]),
      forwardRef(() => UsersModule),
      JwtModule.register({})
  ],
    exports: [
        AuthService,
        JwtModule
    ]
})
export class AuthModule {}
