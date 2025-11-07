// comment-availability-water.controller.ts
import {Controller,Get,Post,Body,Param,UseInterceptors,UploadedFiles,ParseFilePipe,FileTypeValidator,MaxFileSizeValidator,ParseIntPipe,} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { CreateCommentAssociatedDto } from './dto/create-comment-associated.dto';
import { CommentAssociatedService } from './comment-associated.service';

@Controller('comment-Request-Associated')
export class CommentAssociatedController {
  constructor(
    private readonly commentService: CommentAssociatedService
  ) {}

  @Post('admin/:requestId')
  async createAdminComment(
    @Param('requestId') requestId: number,
    @Body() dto: CreateCommentAssociatedDto,
  ) {
    return this.commentService.createAdminCommentAssociated(
      requestId,
      dto.Subject,
      dto.Comment
    );
  }

  @Get('by-request/:requestId')
  async findByRequest(@Param('requestId') requestId: number) {
    return this.commentService.findByRequestAssociatedId(requestId);
  }
  @Get('All')
  async findAll(){
    return this.commentService.getAll();
  }


  @Post('reply/:requestId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async replyWithFiles(
    @Param('requestId') requestId: number,
    @Body() dto: CreateCommentAssociatedDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ 
            fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ 
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.commentService.replyWithFiles(
      requestId,
      dto.Subject,
      dto.Comment,
      files
    );
  }
}