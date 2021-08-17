import { Constants } from 'protocol-common/constants';
import { Logger } from 'protocol-common/logger';

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
            // TODO remove these once integration tests are off them
            {
                path: [ '/v2/kiva/agent' ],
                target : process.env.KIVA_CONTROLLER,
                pathRewrite: {
                    '^/v2/kiva/agent': '/v1/agent',
                },
            },
            {
                path: [ '/v2/demo/agent' ],
                target : process.env.DEMO_CONTROLLER,
                pathRewrite: {
                    '^/v2/demo/agent': '/v1/agent',
                },
            },
            {
                path: [ '/v2/multitenant' ],
                target : process.env.ARIES_GUARDIANSHIP_AGENCY,
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
            // (voutasaurus): TODO launch distinct record services for each issuer and route based on that
            {
                path: [ '/v2/credential' ],
                target : process.env.CREDENTIAL_URL,
                pathRewrite: {
                    '^/v2/credential': '/credential',
                },
            },
        ];
    }

    private static getProdRoutes(): Array<any> {
        const routes: Array<any> = [
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
            {
                path: [ '/v2/multitenant' ],
                target : process.env.MULTITENANT,
                pathRewrite: {
                    '^/v2/multitenant': ''
                }
            }
        ];

        // Controller names and urls are comma separated env vars to allow adding custom controller routes without needing code changes
        if (process.env.CONTROLLER_NAMES && process.env.CONTROLLER_URLS) {
            const controllerNames = process.env.CONTROLLER_NAMES.split(',');
            const controllerUrls = process.env.CONTROLLER_URLS.split(',');
            if (controllerNames.length < 1 || controllerUrls.length < 1 || controllerNames.length !== controllerUrls.length) {
                Logger.warn(`Invalid values set for controller names and urls: ${process.env.CONTROLLER_NAMES} ${process.env.CONTROLLER_URLS}`);
            } else {
                for (let i=0; i<controllerNames.length; i++) {
                    routes.push({
                        path: [ `/v2/${controllerNames[i]}/api` ],
                        target : controllerUrls[i],
                        pathRewrite: {
                            [`^/v2/${controllerNames[i]}/api`]: '/v2/api',
                        },
                    });
                }
            }
        }
        return routes;
    }
}
