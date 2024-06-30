import { WorkflowClient } from '@temporalio/client';

declare class TemporalWorkflowService {
    private workflowClient: WorkflowClient;
  
    startWorkflow(
      workflow: string,
      taskQueue?: string,
      args?: string[],
      workflowId?: string,
    ): Promise<string>; 
  }

  export default TemporalWorkflowService;
