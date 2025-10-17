import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';  // Importamos el módulo de RequesAvailabilityWater
import { RequestsupervisionMeterModule } from 'src/requestsupervision-meter/requestsupervision-meter.module'; // Importamos el módulo de RequestsupervisionMeter
import { RequestChangeMeterModule } from 'src/request-change-meter/request-change-meter.module'; // Importamos el módulo de RequestChangeMeter
import { RequestChangeNameMeterModule } from 'src/request-change-name-meter/request-change-name-meter.module'; // Importamos el módulo de RequestChangeNameMeter
import { RequestAssociatedModule } from 'src/request-associated/request-associated.module'; // Importamos el módulo de RequestAssociated
import { StateRequestModule } from 'src/state-request/state-request.module';

@Module({
  imports: [
    StateRequestModule,
    RequesAvailabilityWaterModule,  
    RequestsupervisionMeterModule,  
    RequestChangeMeterModule,      
    RequestChangeNameMeterModule,  
    RequestAssociatedModule,       
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
