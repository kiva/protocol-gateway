import { Module } from '@nestjs/common';
import { ConfigModule } from 'protocol-common/config.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GatewayModule } from '../gateway/gateway.module';
import data from '../config/env.json';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from 'protocol-common/logging.interceptor';

/**
 * The root `App` module
 * ----------------------
 *
 * Initializes the Nest application
 */
@Module({
    imports: [ConfigModule.init(data), GatewayModule],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor
        }
    ],
})
export class AppModule {}
