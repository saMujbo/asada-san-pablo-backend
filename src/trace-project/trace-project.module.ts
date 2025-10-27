// trace-project.module.ts (ejemplo)
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceProject } from './entities/trace-project.entity';
import { TraceProjectService } from './trace-project.service';
import { TraceProjectController } from './trace-project.controller';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraceProject]),
    forwardRef(() => ProjectModule), // 👈 importante para cerrar el ciclo
  ],
  controllers: [TraceProjectController],
  providers: [TraceProjectService],
  exports: [TraceProjectService], // 👈 exporta si otros lo inyectan
})
export class TraceProjectModule {}
