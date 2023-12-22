import { Module } from '@nestjs/common';
import { TemporalWorkflowService } from '../services/temporal.service';

@Module({
  providers: [TemporalWorkflowService],
})
export class TemporalWorkflowModule {}
