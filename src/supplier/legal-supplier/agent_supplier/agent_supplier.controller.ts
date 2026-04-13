import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AgentSupplierService } from './agent_supplier.service';
import { CreateAgentSupplierDto } from './dto/create-agent_supplier.dto';
import { UpdateAgentSupplierDto } from './dto/update-agent_supplier.dto';

@Controller('agent-supplier')
export class AgentSupplierController {
  constructor(private readonly agentSupplierService: AgentSupplierService) {}

  @Post()
  create(@Body() createAgentSupplierDto: CreateAgentSupplierDto) {
    return this.agentSupplierService.create(createAgentSupplierDto);
  }

  @Get()
  findAll() {
    return this.agentSupplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.agentSupplierService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number,
  @Body() updateAgentSupplierDto: UpdateAgentSupplierDto) {
    return this.agentSupplierService.update(id, updateAgentSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.agentSupplierService.remove(id);
  }
}
