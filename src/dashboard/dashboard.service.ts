import { Injectable } from '@nestjs/common';
import { RequesAvailabilityWaterService } from 'src/reques-availability-water/reques-availability-water.service';
import { RequestsupervisionMeterService } from 'src/requestsupervision-meter/requestsupervision-meter.service';
import { RequestChangeMeterService } from 'src/request-change-meter/request-change-meter.service';
import { RequestChangeNameMeterService } from 'src/request-change-name-meter/request-change-name-meter.service';
import { RequestAssociatedService } from 'src/request-associated/request-associated.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly requesAvailabilityWaterService: RequesAvailabilityWaterService,
    private readonly requestSupervisionMeterService: RequestsupervisionMeterService,
    private readonly requestChangeMeterService: RequestChangeMeterService,
    private readonly requestChangeNameMeterService: RequestChangeNameMeterService,
    private readonly requestAssociatedService: RequestAssociatedService,
  ) {}

  // Método para obtener todas las solicitudes pendientes
  async getTotalPendingRequests(): Promise<number> {
    const waterRequests = await this.requesAvailabilityWaterService.countPendingRequests();
    const supervisionRequests = await this.requestSupervisionMeterService.countPendingRequests();
    const changeMeterRequests = await this.requestChangeMeterService.countPendingRequests();
    const changeNameMeterRequests = await this.requestChangeNameMeterService.countPendingRequests();
    const associatedRequests = await this.requestAssociatedService.countPendingRequests();

    // Sumar todos los resultados
    return (
      waterRequests +
      supervisionRequests +
      changeMeterRequests +
      changeNameMeterRequests +
      associatedRequests
    );
  }
}
