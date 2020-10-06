import { Injectable } from '@nestjs/common';
import { Logger } from 'protocol-common/logger';
import { DatadogLogger } from 'protocol-common/datadog.logger';
import { GatewayRoutes } from './gateway.routes';

@Injectable()
export class GatewayService {

    private readonly logger: Logger;
    constructor() {
        this.logger = DatadogLogger.getLogger();
    }

    /**
     * Nestjs treats the middleware http proxy requests different than regular request so doesn't trigger the interceptors and filters we're used to
     * Need to apply logger to http-proxy itself
     */
    public getDefaultOptions(): object {
        return {
            logProvider: () => this.logger,
            changeOrigin: true,
            prependPath: false,
        };
    }

    public getJsonRoutes(): Array<any> {
        return GatewayRoutes.getRoutes();
    }
}
