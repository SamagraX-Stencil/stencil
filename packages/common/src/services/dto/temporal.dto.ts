
export class StartWorkflowRequestDTO {
    workflow: string;
    taskQueue?: string;
    args?: string[];
    workflowId?: string;
  }