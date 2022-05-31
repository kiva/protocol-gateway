import { Injectable, INestApplication, Logger } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { ProtocolExceptionFilter, ProtocolLogger, traceware } from 'protocol-common';
import { ServiceReportDto } from './dtos/service.report.dto.js';
// @ts-ignore: assertions are currently required when importing json
import swaggerDocument from '../docs/swagger.json' assert { type: 'json'};

/**
 * Sets up the gateway to handle external traffic, eg cors, rate-limiting, etc
 */
@Injectable()
export class AppService {

    private static startedAt: Date;

    /**
     * Sets up app in a way that can be used by main.ts and e2e tests
     */
    public static setup = async (app: INestApplication): Promise<void> => {

        // Setting request-id middleware which assigns a unique requestid per incomming requests if not sent by client.
        const {default: requestIdGenerator} = await import('express-request-id');
        app.use(requestIdGenerator());

        const logger = new Logger(app.get(ProtocolLogger));
        app.useLogger(logger);

        app.use(helmet());

        const corsWhitelist = process.env.CORS_WHITELIST;
        if (corsWhitelist === undefined || corsWhitelist === null || corsWhitelist === '') {
            app.enableCors({credentials: true, origin: true});
        } else {
            app.enableCors({credentials: true, origin: corsWhitelist.split(',')});
        }
        app.useGlobalFilters(new ProtocolExceptionFilter());

        app.use(traceware('gateway'));

        AppService.startedAt = new Date();

        // Default is 100 requests per minute
        app.use(rateLimit({
            windowMs: process.env.RATE_LIMIT_WINDOW_MS,
            max: process.env.RATE_LIMIT_MAX,
        }));

        // Load swagger docs and display
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    };

    public generateStatsReport(): ServiceReportDto {
        Logger.log('stats report generated');
        const report: ServiceReportDto = new ServiceReportDto();
        report.serviceName = process.env.SERVICE_NAME;
        report.startedAt = AppService.startedAt.toDateString();
        report.currentTime = new Date().toDateString();
        report.versions = ['none'];

        return report;
    }
}
