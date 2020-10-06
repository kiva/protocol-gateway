import { MiddlewareConsumer, Module, NestModule, HttpModule } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestContextMiddleware } from 'protocol-common/http-context/request.context.middleware';
import { GatewayService } from './gateway.service';
import { RequestIdMiddleware } from './request.id.middleware';
import { AuthenticationMiddleware } from './authentication.middleware';
import { SpanPropagationMiddleware } from './span.propagation.middleware';

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
     * @param consumer
     */
    configure(consumer: MiddlewareConsumer) {
        // We need to handle request id, request context, authentication, gateway logger,
        // and api key auth as middlewares before going to http proxy middleware
        consumer.apply(
            SpanPropagationMiddleware,
            RequestIdMiddleware,
            RequestContextMiddleware,
            AuthenticationMiddleware,
        ).forRoutes('*');

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
