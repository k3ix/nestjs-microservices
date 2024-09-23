import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerNodule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerNodule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: { singleLine: true },
        },
      },
    }),
  ],
})
export class LoggerModule {}
