import { MiddlewareConsumer, Module, NestModule, HttpModule, Logger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestContextMiddleware } from 'protocol-common';
import { GatewayService } from './gateway.service.js';
import { RequestIdMiddleware } from './request.id.middleware.js';
import { AuthenticationMiddleware } from './authentication.middleware.js';
import { SpanPropagationMiddleware } from './span.propagation.middleware.js';

@Module({
    imports: [HttpModule],
    controllers: [],
    providers: [ GatewayService ],
})
export class GatewayModule implements NestModule {
    constructor(private readonly gatewayService: GatewayService) {}

    /**
     * Apply http-proxy-middleware for Gateway Routes.
     * For more information, see: https://github.com/chimurai/http-proxy-middleware
     *
     * @param consumer
     */
    configure(consumer: MiddlewareConsumer) {
        // We need to handle span, request id, and request context middlewares before going to http proxy middleware
        consumer.apply(
            SpanPropagationMiddleware,
            RequestIdMiddleware,
            RequestContextMiddleware,
        ).forRoutes('*');

        // Enable Auth0 unless explicitly set to false
        if (process.env.AUTH0_ENABLED !== 'false') {
            Logger.log('Enabling Auth0');
            consumer.apply(AuthenticationMiddleware).forRoutes('*');
        } else {
            Logger.warn('NOT enabling Auth0');
        }

        this.gatewayService.getJsonRoutes().map(routeOptions => {
            const proxyPath = routeOptions.path;
            delete routeOptions.path;
            const proxyOptions = {
                ...this.gatewayService.getDefaultOptions(),
                ...routeOptions,
            };
            consumer.apply(createProxyMiddleware(proxyPath, proxyOptions)).forRoutes('*');
        });
    }
}
