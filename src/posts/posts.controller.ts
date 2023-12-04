import {
    Body,
    Controller,
    FileTypeValidator,
    Get, Param,
    ParseFilePipe,
    Post,
    UploadedFile, UseGuards,
    UseInterceptors,
    Headers
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {CreatePostDto} from "./dto/create-post.dto";
import {FileInterceptor} from '@nestjs/platform-express';
import {UserIdDto} from "../users/dto/user-id.dto";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {UserPostsGuard} from "../auth/guards/userPosts.guard";
import {Roles} from "../auth/roles-auth.decorator";
import {AccessTokenGuard} from "../auth/guards/access-token.guard";

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  createPost(@Body() dto: CreatePostDto,
             @Headers('Authorization') authHeader: string,
                   @UploadedFile(
                       new ParseFilePipe({
                         validators: [
                           new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                         ],
                       }),
                   ) image: Express.Multer.File) {
    return this.postsService.createPost(dto, authHeader, image)
  }

  @ApiOperation({summary: 'Return posts by user'})
  @ApiResponse({ status: 200, type: [Post]})
  @Roles('ADMIN')
  @UseGuards(AccessTokenGuard, UserPostsGuard)
  @Get('/:userId')
  getPostsByUser(@Param('userId') userId: string) {
      return this.postsService.getPostsByUser(userId);
  }
}
