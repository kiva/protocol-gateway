import { Injectable } from '@nestjs/common';
import { ProtocolLogger } from 'protocol-common';
import { GatewayRoutes } from './gateway.routes.js';

@Injectable()
export class GatewayService {

    constructor(readonly logger: ProtocolLogger) {
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
