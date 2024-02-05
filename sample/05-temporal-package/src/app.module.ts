import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemporalModule } from 'nestjs-temporal';
import * as activities from './temporal/activities';
import { TemporalWorkflowService } from '@samagra-x/stencil';

@Module({
  imports: [
    TemporalModule.registerWorker({
      workerOptions: {
        namespace: 'default',
        taskQueue: 'default',
        workflowsPath: require.resolve('./temporal/workflows/example.workflow'),
        activities: {
          activities,
        },
      },
    }),
    TemporalModule.registerClient(),
  ],
  controllers: [AppController],
  providers: [AppService, TemporalWorkflowService],
})
export class AppModule {}
