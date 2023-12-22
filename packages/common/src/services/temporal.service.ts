import { Injectable } from '@nestjs/common';
import { Connection, WorkflowClient } from '@temporalio/client';

@Injectable()
export class TemporalService {
  private workflowClient: WorkflowClient;

  constructor() {
    const connection = new Connection();
    this.workflowClient = new WorkflowClient(connection.service);
  }

  getClient(): WorkflowClient {
    return this.workflowClient;
  }
}
