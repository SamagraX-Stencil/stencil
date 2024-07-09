---
title: Configuration Guide
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

Configuring K6 effectively is crucial for obtaining accurate and meaningful performance test results. This guide provides detailed explanations of each configuration option in the `k6config.js` file, offers guidance on selecting appropriate values for key parameters, and explains the impact of different configurations on test outcomes.

### k6 Configuration Options

#### Virtual Users (VUs)

The `vus` option in `k6config.js` specifies the number of virtual users to simulate during the test. Virtual users represent concurrent users interacting with your application. Consider the following factors when setting the number of virtual users:

- **Traffic Simulation:** Aim to mimic real-world usage patterns by setting a realistic number of virtual users.
  
- **System Capacity:** Ensure that the chosen number of virtual users aligns with your application's capacity and infrastructure.

Example:
```javascript
export const options = {
  vus: 10, // Adjust based on your testing scenario
  // Other configuration options...
};
```

#### Duration

The `duration` option in your `k6config.js` file defines how long the test should run. This parameter is critical for understanding how your application performs over an extended period. When setting the test duration, consider the following factors:

- **Realistic Scenarios:** Choose a duration that reflects typical user engagement periods. This ensures that your performance test aligns with how users interact with your application in real-world scenarios.

- **Stability:** Longer durations help identify issues related to sustained load and resource usage. By running your test for an extended period, you can uncover potential stability issues, resource leaks, and gain insights into the long-term performance characteristics of your application.

Example:

```javascript
export const options = {
  duration: '5m', // Adjust based on your testing needs (e.g., '1m' for 1 minute)
  // Other configuration options...
};
```
#### Thresholds

The `duration` option in your `k6config.js` file defines how long the test should run. This parameter is critical for understanding how your application performs over an extended period. When setting the test duration, consider the following factors:

- **Realistic Scenarios:** Choose a duration that reflects typical user engagement periods. This ensures that your performance test aligns with how users interact with your application in real-world scenarios.

- **Stability:** Longer durations help identify issues related to sustained load and resource usage. By running your test for an extended period, you can uncover potential stability issues, resource leaks, and gain insights into the long-term performance characteristics of your application.

Example:

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95th percentile response time should be below 500 ms
    // Other threshold definitions...
  },
  // Other configuration options...
};
```

### Additional Configuration Options

In addition to the highlighted options, the `k6config.js` file offers various other configuration parameters. For a comprehensive list and detailed explanations, refer to the [official k6 documentation](https://k6.io/docs/using-k6/k6-options/reference/).

### Impact of Configurations on Test Results

Understanding the impact of different configurations on test results is crucial for accurate performance assessments. Consider the following considerations:

- **VUs and Throughput:** Higher virtual user counts may impact throughput, affecting response times and error rates. Carefully choose virtual user counts based on your application's capacity and expected user load.

- **Duration and Stability:** Longer test durations reveal insights into application stability, resource leaks, and long-term performance characteristics. Extend your test duration to uncover issues related to sustained load.

- **Thresholds and Pass/Fail Criteria:** Define thresholds that align with user expectations and the critical functions of your application. Clearly articulate pass/fail criteria based on these thresholds for meaningful performance assessments.


</p>
