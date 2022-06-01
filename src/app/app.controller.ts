import { Get, Controller } from '@nestjs/common';
import { HttpConstants, DisableAutoLogging } from 'protocol-common';
import { AppService } from './app.service.js';
import { ServiceReportDto } from './dtos/service.report.dto.js';

/**
 * Base route is just for various health check endpoints
 */
@DisableAutoLogging()
@Controller()
export class AppController {

    constructor(private readonly service: AppService) {
    }

    @Get()
    base(): string {
        return process.env.SERVICE_NAME;
    }

    @Get('ping')
    ping(): string {
        return HttpConstants.PING_RESPONSE;
    }

    @Get('healthz')
    healthz(): string {
        return HttpConstants.HEALTHZ_RESPONSE;
    }

    /**
     * Called by the protocol-services-support service
     * for uptime statistics reporting "engine".
     */
    @Get('stats')
    generateStatsReport() : ServiceReportDto {
        return this.service.generateStatsReport();
    }
}
