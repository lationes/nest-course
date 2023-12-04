import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreatePostDto} from "./dto/create-post.dto";
import {InjectModel} from "@nestjs/sequelize";
import {Post} from "./models/posts.model";
import {FilesService} from "../files/files.service";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class PostsService {

    constructor(@InjectModel(Post) private postRepository: typeof  Post,
                private fileService: FilesService,
                private jwtService: JwtService) {}

    async createPost(dto: CreatePostDto, authHeader: string, image: Express.Multer.File) {
        try {
            const oldPost = await this.postRepository.findOne({where: { title: dto.title}})

            if (oldPost) {
                return  new HttpException('Post with this title already exist', HttpStatus.FORBIDDEN)
            }

            const fileName = await this.fileService.createFile(image);

            const token = authHeader.split(' ')[1];
            const { id } = this.jwtService.decode(token);

            const post = await this.postRepository.create({...dto, image: fileName, userId: Number(id)})
            return post;
        } catch (e) {
            return new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getPostsByUser(userId: string) {
        const posts = await this.postRepository.findAll({where: { userId: Number(userId) }});

        if (!posts.length) {
            return new HttpException('This user have no posts', HttpStatus.NOT_FOUND)
        }

        return posts;
    }
}
