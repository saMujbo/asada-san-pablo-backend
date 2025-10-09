import { forwardRef, Module } from '@nestjs/common';
import { RequestAssociatedService } from './request-associated.service';
import { RequestAssociatedController } from './request-associated.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestAssociated } from './entities/request-associated.entity';
import { UsersModule } from 'src/users/users.module';
import { StateRequestModule } from 'src/state-request/state-request.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequestAssociated]),
    forwardRef(()=> UsersModule),
    forwardRef(() => StateRequestModule)
  ],
  controllers: [RequestAssociatedController],
  providers: [RequestAssociatedService],
  exports:[RequestAssociatedService]
})
export class RequestAssociatedModule {}
