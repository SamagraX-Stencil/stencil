---
title: What are we using?
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

Stencil utilizes the k6 benchmarking tool to conduct load tests and evaluate application performance. This page provides an overview of the key components involved in benchmarking with Stencil, with a specific focus on the boilerplate setup used for load testing.

### k6 Configuration

The core configuration for our benchmarking setup is defined in the `k6config.js` file. This file includes parameters essential for shaping the testing environment:

- **Virtual Users (VUs):** Specifies the number of virtual users simulated during the test. In our configuration, we set this to `5` (`vus: 5`).
  
- **Duration:** Sets the duration of the test. Here, we've configured it to run for 30 seconds (`duration: '30s'`).

- **Thresholds:** Defines performance thresholds to assess the success of the test. For example, we've set a criterion where the 95th percentile response time should be below 500 milliseconds (`thresholds: { http_req_duration: ['p(95)<500'] }`).

- **Tags:** Provides metadata to categorize and label the test, aiding in result analysis. In our case, we've tagged the test with the environment as 'staging' (`tags: { environment: 'staging' }`).

### Load Test Boilerplate

To facilitate the load testing process, Stencil employs a versatile boilerplate encapsulated in the `common.js` file. This boilerplate contains essential functions for conducting HTTP requests, checking responses and much more.

The subsequent documentation will provide further details on the configuration options in `k6config.js` and guide users on effectively utilizing the boilerplate for their specific performance testing needs with Stencil.
</p>
