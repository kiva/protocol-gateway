import { Injectable, NestMiddleware } from '@nestjs/common';
import { HttpConstants } from 'protocol-common/http-context/http.constants';

/**
 * author: esmaeila
 * The middleware for setting request id header.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req, res, next: () => void) {
        req.headers[HttpConstants.REQUEST_ID_HEADER] = req.id;
        next();
    }
}
