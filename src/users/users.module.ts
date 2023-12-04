import {forwardRef, Module} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./models/users.model";
import {Role} from "../roles/models/roles.model";
import {UserRoles} from "../roles/models/user-roles.model";
import {RolesModule} from "../roles/roles.module";
import {AuthModule} from "../auth/auth.module";
import {Post} from "../posts/models/posts.model";
import {FilesModule} from "../files/files.module";
import {Token} from "../auth/models/token.model";

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [
      SequelizeModule.forFeature([User, Role, UserRoles, Post, Token]),
      RolesModule,
      forwardRef(() => AuthModule),
      FilesModule,
  ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
