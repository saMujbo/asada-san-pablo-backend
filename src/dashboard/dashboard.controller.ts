import { Controller, Get, Query } from "@nestjs/common";
import { StateRequestService } from "src/state-request/state-request.service";
import { DashboardService } from "./dashboard.service";

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly stateRequestService: StateRequestService,
  private readonly dashboardService: DashboardService,
  ) {}

  @Get('pending-requests')
  async getPendingRequests() {
    const totalPendingRequests = await this.stateRequestService.countAllPendingRequests();
    return { totalPendingRequests };
  }

  @Get('approved-requests')
  async getApprovedRequests() {
    const totalApprovedRequests = await this.stateRequestService.countAllApprovedRequests();
    return { totalApprovedRequests };
  }

  @Get('requests/monthly')
  async getMonthlyRequests(@Query('months') months?: string) {
    const data = await this.dashboardService.getMonthlyAllRequests(months ? Number(months) : 12);
    return data; // [{ year, month, count }]
  }
}