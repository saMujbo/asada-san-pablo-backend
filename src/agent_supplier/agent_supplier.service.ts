import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAgentSupplierDto } from './dto/create-agent_supplier.dto';
import { UpdateAgentSupplierDto } from './dto/update-agent_supplier.dto';
import { Repository } from 'typeorm';

import { changeState } from 'src/utils/changeState';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentSupplier } from './entities/agent_supplier.entity';

@Injectable()
export class AgentSupplierService {
  constructor(
    @InjectRepository(AgentSupplier)
      private readonly agentSupplierRepo: Repository<AgentSupplier>,
  ) {}

  async create(createAgentSupplierDto: CreateAgentSupplierDto) {
    const newAgentSupplier = this.agentSupplierRepo.create(createAgentSupplierDto);
    return await this.agentSupplierRepo.save(newAgentSupplier);
  }

  async findAll() {
    return await this.agentSupplierRepo.find();
  }

  async findOne(Id: number) {
    const found = await this.agentSupplierRepo.findOne({where:{Id}});
    if(!found) throw new ConflictException(`AgentSupplier with ${Id} not found`);
    return found;
  }

  async update(Id: number, updateAgentSupplierDto: UpdateAgentSupplierDto) {
    const agentSupplier = await this.agentSupplierRepo.findOne({where:{Id}});
    if(!agentSupplier) throw new ConflictException(`AgentSupplier with ${Id} not found`);

    if(updateAgentSupplierDto.Name !== undefined && updateAgentSupplierDto.Name !== null && updateAgentSupplierDto.Name !== '') agentSupplier.Name = updateAgentSupplierDto.Name;
    if(updateAgentSupplierDto.Surname1 !== undefined && updateAgentSupplierDto.Surname1 !== null && updateAgentSupplierDto.Surname1 !== '') agentSupplier.Surname1 = updateAgentSupplierDto.Surname1;
    if(updateAgentSupplierDto.Surname2 !== undefined && updateAgentSupplierDto.Surname2 !== null && updateAgentSupplierDto.Surname2 !== '') agentSupplier.Surname2 = updateAgentSupplierDto.Surname2;
    if(updateAgentSupplierDto.PhoneNumber !== undefined && updateAgentSupplierDto.PhoneNumber !== null && updateAgentSupplierDto.PhoneNumber !== '') agentSupplier.PhoneNumber = updateAgentSupplierDto.PhoneNumber;
    if(updateAgentSupplierDto.Email !== undefined && updateAgentSupplierDto.Email !== null && updateAgentSupplierDto.Email !== '') agentSupplier.Email = updateAgentSupplierDto.Email;
    if(updateAgentSupplierDto.IsActive !== undefined && updateAgentSupplierDto.IsActive !== null) agentSupplier.IsActive = updateAgentSupplierDto.IsActive;
    }

  async remove(Id: number) {
    const agentSupplier = await this.agentSupplierRepo.findOneBy({Id});
    if(!agentSupplier) throw new ConflictException(`AgentSupplier with ${Id} not found`);
    agentSupplier.IsActive = false;
    return await this.agentSupplierRepo.save(agentSupplier);
  }
  async reactive(Id: number){
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive); 
}
}