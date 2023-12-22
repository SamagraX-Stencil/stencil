import { Injectable } from '@nestjs/common';
import { WorkflowClient } from '@temporalio/client';

@Injectable()
export class TemporalWorkflowService {
  private workflowClient: any;

  constructor() {
    this.workflowClient = new WorkflowClient();
  }

  public async startWorkflow(
    workflow: any,
    taskQueue?: any,
    args?: any,
    workflowId?: string,
  ) {
    // const workflowClient = new WorkflowClient();
    const flow = await this.workflowClient.start(workflow, {
      taskQueue: 'default',
      // type inference works! args: [name: string]
      args: args || ['Temporal'],
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: workflowId || 'workflow-' + new Date().valueOf(),
    });
    const handle = this.workflowClient.getHandle(flow.workflowId);
    const result = await handle.result();
    return result;
  }
}
