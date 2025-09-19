import { Module } from '@nestjs/common';
import { AgentSupplierService } from './agent_supplier.service';
import { AgentSupplierController } from './agent_supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentSupplier } from './entities/agent_supplier.entity';
import { SupplierService } from 'src/supplier/supplier.service';
import { SupplierModule } from 'src/supplier/supplier.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([AgentSupplier]),
    SupplierModule,
  ],
  controllers: [AgentSupplierController],
  providers: [AgentSupplierService],
  exports: [AgentSupplierService],
})
export class AgentSupplierModule {}
