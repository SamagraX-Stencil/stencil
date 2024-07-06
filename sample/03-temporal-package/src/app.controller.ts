import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { TemporalWorkflowService } from './temporal.service';
import { TemporalWorkflowService } from '@samagra-x/stencil';
import { exampleWorkflow } from './temporal/workflows';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly temporalWorkflowService: TemporalWorkflowService,
  ) {}

  @Get()
  async getHello() {
    try {
      const result = await this.temporalWorkflowService.startWorkflow(
        exampleWorkflow,
        'default',
        ['temporal-package-test-controller'],
        'temporal-package-test-workflow-id' + Date.now(),
      );
      return `Workflow started, result: ${result}`;
    } catch (error) {
      console.error('Error starting workflow', error);
      throw error;
    }
  }
}
