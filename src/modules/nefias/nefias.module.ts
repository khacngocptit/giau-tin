import { Module } from '@nestjs/common';
import { NefiasController } from './nefias.controller';
import { NefiasService } from './nefias.service';

@Module({
  controllers: [NefiasController],
  providers: [NefiasService]
})
export class NefiasModule {}
