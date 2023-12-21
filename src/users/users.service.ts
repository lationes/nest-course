import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {User} from "./models/users.model";
import {CreateUserDto} from "./dto/create-user.dto";
import {Role} from "../roles/models/roles.model";
import {RolesService} from "../roles/roles.service";
import {ApiTags} from "@nestjs/swagger";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {FilesService} from "../files/files.service";
import {UserIdDto} from "./dto/user-id.dto";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService,
                private fileService: FilesService,
                private jwtService: JwtService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue('USER');
        await user.$set('roles', [role.id]);
        user.roles = [role];
        return user;
    }

    async addAvatar(dto: UserIdDto, avatar: any) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (user) {
            const fileName = await this.fileService.createFile(avatar);
            await user.$add('avatar', fileName);
            return user;
        }
        throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
    }

    async deleteUser(id: string) {
        const user = await this.userRepository.destroy({where: { id: Number(id) }});
        return user;
    }

    async findUser(id: number) {
        const user = await this.userRepository.findOne({where: { id: id }, include: { all: true }});
        return user;
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll({include: {all: true}});
        return users;
    }

    async getUserByToken(authHeader: string) {
        const token = authHeader.split(' ')[1];
        const { id } = this.jwtService.decode(token);

        const user = await this.findUser(id);
        return user;
    }

    async getUsersByEmail(email: string) {
        const user = await this.userRepository.findOne({where: {email}, include: { all: true }});
        return user;
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);

        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw new HttpException('User or role is not found', HttpStatus.NOT_FOUND);
    }

    async banUser(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);

        if (!user) {
            throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
        }

        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return user;
    }

}
