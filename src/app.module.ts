import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpExceptionFilter } from "./common/exception/http-exception.filter";
import { TransformResponseInterceptor } from "./common/pipe/transform-response.intercepter";
import configuration from "./config/configuration";
import { MongooseConfigService } from "./config/mongodb-config.service";
import { NefiasModule } from './modules/nefias/nefias.module';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        MongooseModule.forRootAsync({
            useClass: MongooseConfigService,
            inject: [ConfigService],
        }),
        NefiasModule,
        
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformResponseInterceptor,
        },
    ],
})
export class AppModule {}
