import { Module } from '@nestjs/common';
import { AgentSupplierService } from './agent_supplier.service';
import { AgentSupplierController } from './agent_supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentSupplier } from './entities/agent_supplier.entity';
import { LegalSupplierModule } from 'src/legal-supplier/legal-supplier.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([AgentSupplier]),
    LegalSupplierModule
  ],
  controllers: [AgentSupplierController],
  providers: [AgentSupplierService],
  exports: [AgentSupplierService],
})
export class AgentSupplierModule {}
