import { Injectable } from '@nestjs/common';
import { RequesAvailabilityWaterService } from 'src/reques-availability-water/reques-availability-water.service';
import { RequestsupervisionMeterService } from 'src/requestsupervision-meter/requestsupervision-meter.service';
import { RequestChangeMeterService } from 'src/request-change-meter/request-change-meter.service';
import { RequestChangeNameMeterService } from 'src/request-change-name-meter/request-change-name-meter.service';
import { RequestAssociatedService } from 'src/request-associated/request-associated.service';

type Point = { year: number; month: number; count: number };
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

   // Método para obtener todas las solicitudes aprobadas
  async getTotalApprovedRequests(): Promise<number> {
    const waterRequests = await this.requesAvailabilityWaterService.countApprovedRequests();
    const supervisionRequests = await this.requestSupervisionMeterService.countApprovedRequests();
    const changeMeterRequests = await this.requestChangeMeterService.countApprovedRequests();
    const changeNameMeterRequests = await this.requestChangeNameMeterService.countApprovedRequests();
    const associatedRequests = await this.requestAssociatedService.countApprovedRequests();

    // Sumar todos los resultados
    return (
      waterRequests +
      supervisionRequests +
      changeMeterRequests +
      changeNameMeterRequests +
      associatedRequests
    );
  }

  private buildKeys(from: Date, months: number) {
    const keys: string[] = [];
    const cursor = new Date(from);
    for (let i = 0; i < months; i++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      keys.push(`${y}-${String(m).padStart(2, '0')}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }

  async getMonthlyAllRequests(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    // 1) pedir a cada servicio su serie mensual
    const [
      water,
      supervision,
      changeMeter,
      changeName,
      associated,
    ] = await Promise.all([
      this.requesAvailabilityWaterService.getMonthlyCounts(months),
      this.requestSupervisionMeterService.getMonthlyCounts(months),
      this.requestChangeMeterService.getMonthlyCounts(months),
      this.requestChangeNameMeterService.getMonthlyCounts(months),
      this.requestAssociatedService.getMonthlyCounts(months),
    ]);

    // 2) sumar por YYYY-MM
    const sum = new Map<string, number>();
    const add = (rows: Point[]) => {
      rows.forEach(r => {
        const key = `${r.year}-${String(r.month).padStart(2, '0')}`;
        sum.set(key, (sum.get(key) ?? 0) + Number(r.count));
      });
    };

    add(water);
    add(supervision);
    add(changeMeter);
    add(changeName);
    add(associated);

    // 3) rellenar meses sin datos con 0
    const keys = this.buildKeys(from, months);
    return keys.map(k => {
      const [y, m] = k.split('-').map(Number);
      return { year: y, month: m, count: sum.get(k) ?? 0 };
    });
  }

  // ---- RESUMEN DE MIS SOLICITUDES (totales y desglose por tipo)
  async getMyRequestsSummary(userId: number) {
    const [
      a, b, c, d, e,
      pA, pB, pC, pD, pE,
      // okA, okB, okC, okD, okE,
    ] = await Promise.all([
      this.requesAvailabilityWaterService.countAllByUser(userId),
      this.requestSupervisionMeterService.countAllByUser(userId),
      this.requestChangeMeterService.countAllByUser(userId),
      this.requestChangeNameMeterService.countAllByUser(userId),
      this.requestAssociatedService.countAllByUser(userId),

      this.requesAvailabilityWaterService.countPendingByUser(userId),
      this.requestSupervisionMeterService.countPendingByUser(userId),
      this.requestChangeMeterService.countPendingByUser(userId),
      this.requestChangeNameMeterService.countPendingByUser(userId),
      this.requestAssociatedService.countPendingByUser(userId),

      // this.requesAvailabilityWaterService.countApprovedByUser(userId),
      // this.supervisionSv.countApprovedByUser(userId),
      // this.changeMeterSv.countApprovedByUser(userId),
      // this.changeNameSv.countApprovedByUser(userId),
      // this.associatedSv.countApprovedByUser(userId),
    ]);

    const total = a + b + c + d + e;
    const pending = pA + pB + pC + pD + pE;
    // const approved = okA + okB + okC + okD + okE;

    return {
      total,
      pending,
      // approved,
      byType: {
        availability: a,
        supervision: b,
        changeMeter: c,
        changeName: d,
        associated: e,
      },
    };
  }
}
