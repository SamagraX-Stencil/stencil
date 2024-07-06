import { TemporalWorkflowService } from '../../src/services/temporal.service';
import { WorkflowClient } from '@temporalio/client';

jest.mock('@temporalio/client');

describe('TemporalWorkflowService', () => {
  let service: TemporalWorkflowService;
  let mockWorkflowClient: jest.Mocked<WorkflowClient>;

  beforeEach(() => {
    mockWorkflowClient = new WorkflowClient() as jest.Mocked<WorkflowClient>;

    (mockWorkflowClient.start as jest.Mock).mockResolvedValue({
      workflowId: 'workflow-id',
    });
    (mockWorkflowClient.getHandle as jest.Mock).mockReturnValue({
      result: jest.fn().mockResolvedValue('workflow-result'),
    });

    service = new TemporalWorkflowService();
    service['workflowClient'] = mockWorkflowClient; // inject the mocked client
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startWorkflow', () => {
    it('should start a workflow and return the result', async () => {
      const workflow = 'testWorkflow';
      const args = ['testArg'];
      const taskQueue = 'default';
      const workflowId = 'test-workflow-id';

      const result = await service.startWorkflow(workflow, taskQueue, args, workflowId);

      expect(mockWorkflowClient.start).toHaveBeenCalledWith(workflow, {
        taskQueue,
        args,
        workflowId,
      });
      expect(mockWorkflowClient.getHandle).toHaveBeenCalledWith('workflow-id');
      expect(result).toBe('workflow-result');
    });

    it('should use default values if optional parameters are not provided', async () => {
      const workflow = 'testWorkflow';

      const result = await service.startWorkflow(workflow);

      expect(mockWorkflowClient.start).toHaveBeenCalledWith(workflow, {
        taskQueue: 'default',
        args: ['Temporal'],
        workflowId: expect.stringMatching(/^workflow-\d+$/),
      });
      expect(mockWorkflowClient.getHandle).toHaveBeenCalledWith('workflow-id');
      expect(result).toBe('workflow-result');
    });

    it('should handle workflow client errors', async () => {
      (mockWorkflowClient.start as jest.Mock).mockRejectedValue(new Error('Workflow start error'));

      await expect(service.startWorkflow('testWorkflow')).rejects.toThrow('Workflow start error');
    });
  });
});
