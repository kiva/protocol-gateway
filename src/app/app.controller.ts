import { Get, Controller } from '@nestjs/common';
import { V1Uri } from '../V1Uri';
import { HttpConstants } from 'protocol-common/http-context/http.constants';

/**
 * Base route is just for various health check endpoints
 */
@Controller()
export class AppController {

    @Get()
    base(): string {
        return process.env.SERVICE_NAME;
    }

    @Get(V1Uri.APP_PING)
    ping(): string {
        return HttpConstants.PING_RESPONSE;
    }

    @Get(V1Uri.APP_HEALTHZ)
    healthz(): string {
        return HttpConstants.HEALTHZ_RESPONSE;
    }
}
