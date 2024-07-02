import { Injectable } from '@nestjs/common';
import { WorkflowClient } from '@temporalio/client';
import { StartWorkFLowDTo } from './dto/temporal.dto';

@Injectable()
export class TemporalWorkflowService {
  private workflowClient: any;

  constructor() {
    this.workflowClient = new WorkflowClient();
  }

  public async startWorkflow(startWorkFlowDto: StartWorkFLowDTo) {
    // const workflowClient = new WorkflowClient();
    const flow = await this.workflowClient.start(startWorkFlowDto.workflow, {
      taskQueue: 'default',
      // type inference works! args: [name: string]
      args: startWorkFlowDto.args || ['Temporal'],
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: startWorkFlowDto.workflowId || 'workflow-' + new Date().valueOf(),
    });
    const handle = this.workflowClient.getHandle(flow.workflowId);
    const result = await handle.result();
    return result;
  }
}
