import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportAssignment } from './entities/report-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportAssignment])],
  exports: [TypeOrmModule],
})
export class ReportAssignmentsModule {}
