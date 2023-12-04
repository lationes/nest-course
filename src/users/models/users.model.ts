import {BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table} from "sequelize-typescript";
import {ApiOperation, ApiProperty} from "@nestjs/swagger";
import {Role} from "../../roles/models/roles.model";
import {UserRoles} from "../../roles/models/user-roles.model";
import {Post} from "../../posts/models/posts.model";
import {Token} from "../../auth/models/token.model";

interface UserCreationAttrs {
    email: string;
    password: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({example: 1, description: 'Unique identifier for User'})
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'user@gmail.com', description: 'User email'})
    @Column({ type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @ApiProperty({example: 'qwerty', description: 'User password'})
    @Column({ type: DataType.STRING, allowNull: false})
    password: string;

    @ApiProperty({example: 'avatarname.jpg', description: 'Name or link for user avatar'})
    @Column({ type: DataType.STRING, allowNull: true})
    avatar: string;

    @ApiProperty({example: true, description: "User's ban status"})
    @Column({ type: DataType.BOOLEAN, defaultValue: false})
    banned: boolean;

    @ApiProperty({example: 'Ban for using exploits', description: "Reason for user's ban"})
    @Column({ type: DataType.STRING, allowNull: true})
    banReason: string;

    @BelongsToMany(() => Role, () => UserRoles)
    roles: Role[];

    @HasMany(() => Post)
    posts: Post[];

    @HasOne(() => Token)
    token: Token;
}