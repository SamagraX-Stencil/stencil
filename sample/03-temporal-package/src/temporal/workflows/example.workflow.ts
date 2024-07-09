import { proxyActivities, sleep } from '@temporalio/workflow';

// Your activities interface here
interface Activities {
  // Define activity function signatures here
  exampleActivity(name: string): Promise<string>;
}

const activities = proxyActivities<Activities>({
  startToCloseTimeout: '1 minute',
});

export async function exampleWorkflow(name: string): Promise<string> {
  await sleep(100000);
  return await activities.exampleActivity(name);
}
