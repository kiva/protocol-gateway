import { Injectable, Logger } from '@nestjs/common';
import { GatewayRoutes } from './gateway.routes.js';

@Injectable()
export class GatewayService {

    /**
     * Nestjs treats the middleware http proxy requests different than regular request so doesn't trigger the interceptors and filters we're used to
     * Need to apply logger to http-proxy itself
     */
    public getDefaultOptions(): object {
        return {
            logProvider: () => Logger,
            changeOrigin: true,
            prependPath: false,
        };
    }

    public getJsonRoutes(): Array<any> {
        return GatewayRoutes.getRoutes();
    }
}
