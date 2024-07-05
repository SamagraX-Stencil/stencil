import { Injectable } from '@nestjs/common';
import { WorkflowClient } from '@temporalio/client';
import { StartWorkflowRequestDTO } from './dto/temporal.dto';

@Injectable()
export class TemporalWorkflowService {
  private workflowClient: any;

  constructor() {
    this.workflowClient = new WorkflowClient();
  }

  public async startWorkflow(startWorkFlowRequestDto : StartWorkflowRequestDTO) {
    // const workflowClient = new WorkflowClient();
    const flow = await this.workflowClient.start(startWorkFlowRequestDto.workflow, {
      taskQueue: 'default',
      // type inference works! args: [name: string]
      args: startWorkFlowRequestDto.args || ['Temporal'],
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: startWorkFlowRequestDto.workflowId || 'workflow-' + new Date().valueOf(),
    });
    const handle = this.workflowClient.getHandle(flow.workflowId);
    const result = await handle.result();
    return result;
  }
}
