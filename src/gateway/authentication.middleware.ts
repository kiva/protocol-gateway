import { Injectable, NestMiddleware, HttpStatus, HttpService, UnauthorizedException } from '@nestjs/common';
import jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { ProtocolHttpService } from 'protocol-common/protocol.http.service';
import { AxiosRequestConfig } from 'axios';
import { Logger } from 'protocol-common/logger';
import { GatewayCommon } from './gateway.common';
import { HttpConstants } from '../common/http-context/http.constants';


/**
 * author: esmaeila
 * The middleware for authentication the auth0 tokens.
 * Client can provide the auth0 client id and secret through x-client-id/x-client-secret headers respectively. They also can provide the auth0 access
 * token through Authorization header. The middleware first looks at x-client-id/x-client-secret headers. If there is no such header, then, the
 * Authorization header is examined.
 *
 * TODO: http.constants?
 */
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {

    private readonly http: ProtocolHttpService;

    /**
     * Wraps the injected HttpService in a ProtocolHttpService
     */
    constructor(httpService: HttpService) {
        this.http = new ProtocolHttpService(httpService);
    }

    async use(req, res, next) {
        if (GatewayCommon.skipPermittedAuth0Routes(req.originalUrl)) {
            next();
        } else {
            const auth0ClientId = req.headers[HttpConstants.AUTH0_CLIENT_ID_HEADER];
            const auth0ClientSecret = req.headers[HttpConstants.AUTH0_CLIENT_SECRET_HEADER];

            if (auth0ClientId && auth0ClientSecret) {
                /**
                 * When there is no Auth0 token, it is assumed that this is an unsophisticated call where the client submits the Auth0 id/secret in
                 * header and the Gateway module will call Auth0 on behalf of client to fetch access token. If these headers are also missing,
                 * the 401 Unauthorized exception will be thrown.
                 */

                try {
                    const auth0Data = {
                        client_id: auth0ClientId,
                        client_secret: auth0ClientSecret,
                        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                        grant_type: HttpConstants.AUTH0_GRANT_TYPE,
                    };

                    const request: AxiosRequestConfig = {
                        method: 'POST',
                        url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
                        data: auth0Data,
                    };
                    const response = await this.http.requestWithRetry(request);

                    if (response.status !== HttpStatus.OK) {
                        Logger.error(response.data);
                        next(new UnauthorizedException(AuthenticationMiddleware.INVALID_AUTH0_CLIENT_HEADER_MESSAGE));
                    } else {
                        req.headers[HttpConstants.AUTH0_AUTH_HEADER] = 'Bearer ' + response.data.access_token;
                    }
                } catch (e) {
                    Logger.error(e);
                    next(new UnauthorizedException(AuthenticationMiddleware.INVALID_AUTH0_CLIENT_HEADER_MESSAGE));
                }

                next();
            } else if (auth0ClientId){
                /** Client has submitted only client id header. */
                next(new UnauthorizedException(AuthenticationMiddleware.AUTH0_MISSING_CLIENT_SECRET_MESSAGE));
            } else if (auth0ClientSecret){
                /** Client has submitted only client secret header. */
                next(new UnauthorizedException(AuthenticationMiddleware.AUTH0_MISSING_CLIENT_ID_MESSAGE));
            } else {
                /** Since there is no client id/secret header, the client should provide auth0 access token through autorization header. */
                jwt({
                    secret: expressJwtSecret({
                        cache: true,
                        rateLimit: true,
                        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
                    }),
                    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
                    algorithms: [process.env.AUTH0_ALGORITHM],
                })(req, res, err => {
                    if (err) {
                        next(new UnauthorizedException(err.message, err.code));
                    }
                    next();
                });
            }
        }
    }

    private static readonly INVALID_AUTH0_CLIENT_HEADER_MESSAGE = 'The submitted client id header or client secret header is invalid';
    private static readonly AUTH0_MISSING_CLIENT_ID_MESSAGE = 'The client id header is missing';
    private static readonly AUTH0_MISSING_CLIENT_SECRET_MESSAGE = 'The client secret header is missing';
}
