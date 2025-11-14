import { forwardRef, Module } from '@nestjs/common';
import { CommentAssociatedService } from './comment-associated.service';
import { CommentAssociatedController } from './comment-associated.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentAssociated } from './entities/comment-associated.entity';
import { RequestAssociatedModule } from 'src/request-associated/request-associated.module';
import { RequestAssociatedFileModule } from 'src/request-associated-file/request-associated-file.module';
import { UsersModule } from 'src/users/users.module';


@Module({
      imports:[
        TypeOrmModule.forFeature([CommentAssociated]),
      forwardRef(() => RequestAssociatedModule),
      forwardRef(() => RequestAssociatedFileModule),
      forwardRef(() => UsersModule),
    ],
  controllers: [CommentAssociatedController],
  providers: [CommentAssociatedService],
  exports:[CommentAssociatedService]
})
export class CommentAssociatedModule {}
