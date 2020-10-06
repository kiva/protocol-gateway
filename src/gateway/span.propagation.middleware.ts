import { Injectable, NestMiddleware } from '@nestjs/common';
import { globalTracer, FORMAT_HTTP_HEADERS } from 'opentracing';

/**
 * Injects OpenTracing span id into request headers to propagate span info to downstream services
 */
@Injectable()
export class SpanPropagationMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        let sp = req.span;
        if (sp == null) {
          sp = globalTracer().startSpan('gateway-null-span');
        }
        globalTracer().inject(sp, FORMAT_HTTP_HEADERS, req.headers);
        next();
    }
}
