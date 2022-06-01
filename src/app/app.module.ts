import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, LoggingInterceptor, ProtocolLoggerModule } from 'protocol-common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { GatewayModule } from '../gateway/gateway.module.js';
// @ts-ignore: assertions are currently required when importing json
import data from '../config/env.json' assert { type: 'json'};

/**
 * The root `App` module
 * ----------------------
 *
 * Initializes the Nest application
 */
@Module({
    imports: [
        ConfigModule.init(data),
        GatewayModule,
        ProtocolLoggerModule
    ],
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
