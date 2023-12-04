import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {User} from "../../users/models/users.model";

interface PostCreationAttrs {
    title: string;
    content: string;
    userId: number;
    image: string;
}

@Table({tableName: 'posts'})
export class Post extends Model<Post, PostCreationAttrs> {
    @ApiProperty({example: 1, description: 'Unique identifier for Post'})
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'test', description: 'Post title'})
    @Column({ type: DataType.STRING, unique: true, allowNull: false})
    title: string;

    @ApiProperty({example: 'Lorem ipsum', description: 'Post text content'})
    @Column({ type: DataType.STRING, allowNull: false})
    content: string;

    @ApiProperty({example: 'test.jpg', description: 'Post image name'})
    @Column({ type: DataType.STRING, allowNull: false})
    image: string;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER})
    userId: number;

    @BelongsTo(() => User)
    author: User;
}