import {
    Body,
    Controller, FileTypeValidator,
    Get,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    Headers, Delete, Param,
} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UsersService} from "./users.service";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "./models/users.model";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/guards/roles.guard";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {UserIdDto} from "./dto/user-id.dto";
import {AccessTokenGuard} from "../auth/guards/access-token.guard";

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @ApiOperation({summary: 'User creation'})
    @ApiResponse({ status: 200, type: User})
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto);
    }

    @ApiOperation({summary: 'User add avatar'})
    @ApiResponse({ status: 200, type: User})
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Post('/add-avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    addAvatar(@Body() userIdDto: UserIdDto,
              @UploadedFile(
                  new ParseFilePipe({
                      validators: [
                          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                      ],
                  })
              ) avatar: Express.Multer.File) {
        return this.userService.addAvatar(userIdDto, avatar);
    }

    @ApiOperation({summary: 'User delete'})
    @ApiResponse({ status: 200 })
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Delete('/:id')
    delete(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }

    @ApiOperation({summary: 'Getting list of all users'})
    @ApiResponse({ status: 200, type: [User]})
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Get()
    getAll() {
        return this.userService.getAllUsers();
    }

    @ApiOperation({summary: 'Getting current user by token'})
    @ApiResponse({ status: 200, type: User})
    @UseGuards(AccessTokenGuard)
    @Get('/current')
    getUserByToken(@Headers('Authorization') authHeader: string) {
        return this.userService.getUserByToken(authHeader);
    }

    @ApiOperation({summary: 'Adding role to user'})
    @ApiResponse({ status: 200 })
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Post('/role')
    addRole(@Body() dto: AddRoleDto) {
        return this.userService.addRole(dto);
    }

    @ApiOperation({summary: 'Ban user'})
    @ApiResponse({ status: 200 })
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Post('/ban')
    banUser(@Body() dto: BanUserDto) {
        return this.userService.banUser(dto);
    }
}
