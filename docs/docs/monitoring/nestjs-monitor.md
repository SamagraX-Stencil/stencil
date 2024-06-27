---
title: NestJS-Monitor 
---

<head>
  <title>Stencil Features</title>
</head>
<p>

## Introduction

`stencil` offers seamless integration with NestJS to automate the creation of `Grafana dashboards`. By leveraging custom NestJS Interceptors, the platform can generate dashboard JSONs automatically, ensuring real-time monitoring and visualization of application performance metrics.

## Features
1. Automatic Grafana Panel Creation
stencil simplifies the process of creating Grafana panels. Each time a new instance of the ResponseTimeInterceptor is added to a NestJS application, stencil generates corresponding dashboard panels automatically. This feature eliminates the manual effort involved in setting up performance dashboards, allowing developers to focus on their core application logic.

2. Dynamic Panel Updates
Whenever a new ResponseTimeInterceptor instance is introduced, stencil dynamically updates the panel JSONs. This ensures that the dashboards always reflect the latest performance metrics and application changes. Each interceptor instance adds a new row to the response_times dashboard, providing granular insights into different parts of the application.

3. Detailed Performance Panels
Each row in the dashboard contains the following five panels:

- **Heatmap Response Times:** This panel visualizes the distribution of response times for requests captured by a particular ResponseTimeInterceptor instance. It provides a clear overview of performance patterns and helps identify outliers. The heatmap allows for quick identification of latency issues, and the color intensity indicates the frequency of specific response times. Additionally, it can highlight periods of high and low activity, aiding in performance tuning and resource allocation.

- **Gauge for Number of Requests:** This gauge displays the total number of requests received by each endpoint monitored by the interceptor. It offers a quick snapshot of traffic volume and endpoint activity. The gauge can indicate sudden spikes in traffic, helping in identifying potential DDoS attacks. Furthermore, it provides real-time feedback on the effectiveness of scaling policies. By monitoring the gauge, you can ensure that your endpoints handle the expected load efficiently.

- **Average Response Time Graph:** This graph tracks the average response times for requests processed by the interceptor. It helps in monitoring the overall performance and responsiveness of the application over time. Analyzing the trends in this graph can help pinpoint bottlenecks and inefficiencies in the application. The graph can also be used to measure the impact of performance optimizations. Additionally, it provides insights into how different endpoints perform under varying loads.

- **Total Number of Requests Graph:** This panel provides a timeline view of the total number of requests received at different points in time. It is useful for identifying traffic trends and peak usage periods. This information can be crucial for capacity planning and scaling decisions. The graph can also highlight seasonal or event-driven traffic patterns. Moreover, it helps in understanding user behavior and the application's usage patterns.

- **Number of Requests by Status Codes Graph:** This graph categorizes the requests based on their HTTP status codes. It offers insights into the success and failure rates of requests, helping in diagnosing issues and ensuring robust application performance. The graph can help in quickly identifying and addressing frequent errors or anomalies. It also provides a breakdown of client-side versus server-side errors. Additionally, the graph can be used to track the effectiveness of fixes and improvements over time.

To read more about how the interceptor can be used, refer [here](https://github.com/techsavvyash/nestjs-monitor#usage)

For additional information on NestJS interceptors, refer to the official NestJS documentation [here](https://docs.nestjs.com/interceptors) 

## Demo

A small demo showcasing these `interceptors` in action can be found [here](https://drive.google.com/file/d/1KSxZdQzUU8SJmpmLHPpUSrRpnsL4aQY2/view?usp=sharing). This demonstration provides a practical example of how the interceptors work and the kind of insights they can offer.

By integrating stencil with your NestJS application, you can achieve comprehensive, automated performance monitoring with minimal effort, ensuring your application runs smoothly and efficiently.

</p>

