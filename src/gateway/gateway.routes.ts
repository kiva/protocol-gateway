import { Constants } from 'protocol-common/constants';

/**
 * Defines all routes.
 * For full list of options see https://github.com/chimurai/http-proxy-middleware
 */
export class GatewayRoutes {

    /**
     * Builds routes array based on environment
     */
    public static getRoutes(): Array<any> {
        if (process.env.NODE_ENV === Constants.PROD) {
            return this.getProdRoutes();
        }
        // We want to expose the sandbox routes in Dev and Local as well
        return this.getProdRoutes().concat(this.getSandboxRoutes());
    }

    private static getSandboxRoutes(): Array<any> {
        return [
            {
                path: [ '/v1/sandbox/register' ],
                target : process.env.WALLET_SYNC_SERVICE_URL,
                pathRewrite: {
                    '^/v1/sandbox/register': '/v1/register',
                },
            },
            {
                path: [ '/v2/sandbox/register' ],
                target : process.env.NCRA_CONTROLLER,
                pathRewrite: {
                    '^/v2/sandbox/register': '/v2/register',
                },
            },
            // TODO remove this once frontend is off it
            {
                path: [ '/v2/demo/mobile' ],
                target : process.env.DEMO_CONTROLLER,
                pathRewrite: {
                    '^/v2/demo/mobile': '/v2/mobile',
                },
            },
            // TODO remove this once frontend is off it
            {
                path: [ '/v2/mobile' ],
                target : process.env.FSP_CONTROLLER,
            },
            // TODO remove this once integration tests are off it
            {
                path: [ '/v2/kiva/agent' ],
                target : process.env.KIVA_CONTROLLER,
                pathRewrite: {
                    '^/v2/kiva/agent': '/v1/agent',
                },
            },
            // Putting these 4 in sandbox for now, but can eventually expose them via prod
            {
                path: [ '/v2/demo/api' ],
                target : process.env.DEMO_CONTROLLER,
                pathRewrite: {
                    '^/v2/demo/api': '/v2/api',
                },
            },
            {
                path: [ '/v2/kiva/api' ],
                target : process.env.KIVA_CONTROLLER,
                pathRewrite: {
                    '^/v2/kiva/api': '/v2/api',
                },
            },
            {
                path: [ '/v2/ncra/api' ],
                target : process.env.NCRA_CONTROLLER,
                pathRewrite: {
                    '^/v2/ncra/api': '/v2/api',
                },
            },
            {
                path: [ '/v2/fsp/api' ],
                target : process.env.FSP_CONTROLLER,
                pathRewrite: {
                    '^/v2/fsp/api': '/v2/api',
                },
            },
        ];
    }

    private static getProdRoutes(): Array<any> {
        return [
            {
                path: [ '/v1/ping' ],
                target : process.env.WALLET_SYNC_SERVICE_URL,
                pathRewrite: {
                    '^/v1/ping': '/ping',
                },
            },
            {
                path: [ '/v1/kyc' ],
                target : process.env.WALLET_SYNC_SERVICE_URL,
            },
            {
                path: [ '/v1/connections' ],
                target : process.env.WALLET_SYNC_SERVICE_URL,
            },
            {
                path: [ '/v2/ping' ],
                target : process.env.FSP_CONTROLLER,
                pathRewrite: {
                    '^/v2/ping': '/ping',
                },
            },
            {
                path: [ '/v2/kyc' ],
                target : process.env.FSP_CONTROLLER,
            },
            {
                path: [ '/v1/router' ],
                target : process.env.ARIES_GUARDIANSHIP_AGENCY,
            },
        ];
    }


}

