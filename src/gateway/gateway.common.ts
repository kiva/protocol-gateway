/**
 * author: esmaeila
 * The utility class for methods shared among gateway modules.
 */
export class GatewayCommon {
    /**
     * This is required here because consumer.apply().exclude does not exclude wildcard matches at this time :(
     * https://github.com/nestjs/nest/issues/853
     * Note that v1/router exposes the http routes to our agents which we want accessible without Auth0 permissions
     */
    public static skipPermittedRoutes(url): boolean {
        const permitted = ['^/$', '^/ping$', '^/healthz$', '^/v1/router'];
        return permitted.some((permittedUrl) => { return url.match(permittedUrl); });
    }

    /**
     * The utility is temporarily used to filter the routes we want to verify Auth0 and we will update it when the frontend submits the Auth0 token.
     * For now we skip ping and healthz routes and validate Auth0 for all other routes.
     */
    public static skipPermittedAuth0Routes(url): boolean {
        return GatewayCommon.skipPermittedRoutes(url);
    }
}
