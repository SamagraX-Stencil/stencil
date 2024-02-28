---
title: Results Analysis and Interpretation
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

Effectively interpreting k6 test results is essential for gaining insights into your application's performance. This guide aims to help users understand key metrics such as response time distributions, error rates, and throughput. Additionally, it provides insights on identifying performance bottlenecks and areas for improvement.

### Interpreting Key Metrics

#### Response Time Distributions

Response time distributions reveal how the application performs across various percentiles. Common percentiles include the median (50th percentile) and the 95th percentile. Here's how to interpret them:

- **Median (p(50)):** Represents the point at which half of the requests are faster and half are slower. It provides an overall sense of the central tendency of response times.

- **95th Percentile (p(95)):** Reflects the response time below which 95% of requests fall. This is crucial for identifying performance outliers and ensuring that the majority of users experience acceptable response times.

#### Error Rates

Understanding error rates is vital for evaluating the reliability of your application under load. Two primary error metrics are often considered:

- **HTTP Errors:** Check the percentage of HTTP requests that resulted in errors. Identify specific error codes to pinpoint issues, such as 404 for not found or 500 for server errors.

- **Custom Errors:** Define and track custom errors within your application to capture domain-specific issues.

#### Throughput

Throughput measures the number of requests processed per unit of time. It provides insights into the application's capacity to handle concurrent requests. Analyze throughput metrics to identify performance limits and potential bottlenecks.

### Identifying Performance Bottlenecks

#### Analyzing Response Times

- **High Response Times:** Identify requests with consistently high response times. These may indicate performance bottlenecks, such as database queries or external API calls.

- **Response Time Spikes:** Look for sudden spikes in response times, as they may indicate issues under specific load conditions.

#### Error Analysis

- **Error Concentration:** Examine if errors are concentrated in specific transactions or components. This helps pinpoint areas for improvement.

- **Error Rate Trends:** Track error rates over time to identify patterns, especially during high load scenarios.

### Areas for Improvement

#### Scaling Considerations

- **Infrastructure Scaling:** Assess whether scaling infrastructure (e.g., adding more servers) improves performance under load.

- **Code Optimization:** Identify code segments with high response times and optimize them for efficiency.

- **Caching Strategies:** Implement caching mechanisms to reduce load on critical components.

#### Test Iteration

- **Iterative Testing:** Perform iterative testing with different configurations to identify optimal settings.

- **Scenario Variations:** Test variations of user scenarios to uncover performance characteristics under diverse conditions.

</p>
