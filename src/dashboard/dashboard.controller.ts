import { Controller, Get } from "@nestjs/common";
import { StateRequestService } from "src/state-request/state-request.service";

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly stateRequestService: StateRequestService) {}

  @Get('pending-requests')
  async getPendingRequests() {
    const totalPendingRequests = await this.stateRequestService.countAllPendingRequests();
    return { totalPendingRequests };
  }
}