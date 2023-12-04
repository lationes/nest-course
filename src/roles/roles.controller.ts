import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {RolesService} from "./roles.service";
import {CreateRoleDto} from "./dto/create-role.dto";
import {Roles} from "../auth/roles-auth.decorator";
import {AccessTokenGuard} from "../auth/guards/access-token.guard";
import {RolesGuard} from "../auth/guards/roles.guard";

@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {}

    @Post()
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.createRole(dto);
    }

    @Get('/:value')
    @Roles("ADMIN")
    @UseGuards(AccessTokenGuard, RolesGuard)
    getByValue(@Param('value') value: string) {
        return this.roleService.getRoleByValue(value);
    }

}
