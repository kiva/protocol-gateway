import { Injectable, INestApplication } from '@nestjs/common';
import { ProtocolExceptionFilter } from 'protocol-common/protocol.exception.filter';
import { Logger } from 'protocol-common/logger';
import { LoggingInterceptor } from 'protocol-common/logging.interceptor';
import { DatadogLogger } from 'protocol-common/datadog.logger';
import helmet from 'helmet';
import { traceware } from 'protocol-common/tracer';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.json';

/**
 * The Root Application Service
 */
@Injectable()
export class AppService {

    /**
     * Sets up app in a way that can be used by main.ts and e2e tests
     */
    public static async setup(app: INestApplication) {

        // Setting request-id middleware which assigns a unique requestid per incomming requests if not sent by client.
        const requestId = require('express-request-id')();
        app.use(requestId);

        const logger = new Logger(DatadogLogger.getLogger());
        app.useLogger(logger);

        app.use(helmet());

        const corsWhitelist = process.env.CORS_WHITELIST;
        if (corsWhitelist === null || corsWhitelist === '') {
            app.enableCors();
        } else {
            app.enableCors({origin: corsWhitelist.split(',')});
        }
        app.useGlobalFilters(new ProtocolExceptionFilter());
        app.useGlobalInterceptors(new LoggingInterceptor());

        app.use(traceware('gateway'));

        // Default is 100 requests per minute
        app.use(rateLimit({
            windowMs: process.env.RATE_LIMIT_WINDOW_MS,
            max: process.env.RATE_LIMIT_MAX,
        }));

        // Load swagger docs and display
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
}
