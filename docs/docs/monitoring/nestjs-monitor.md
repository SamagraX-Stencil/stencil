---
title: NestJS-Monitor 
---

<head>
  <title>Stencil Features</title>
</head>
<p>

## Introduction

`stencil` comes with out of the box support for creating `grafana dashboards` automatically using custom made `NestJS Interceptors` which generate the dashboard JSONs automatically.

## Features

1. Automatic creation of `grafana` panels.
2. Automatic updation of panel JSONs upon addition of new instances of `ResponseTimeInterceptor` in the NestJS app.
3. Each instance of `ResponseTimeInterceptor` corresponds to a new `row` in the response_times `dashboard`.
4. Each row has the following 5 panels.
- **Heatmap response times:** This is a heatmap of all the response times for a particular instance of the `ResponseTimeInterceptor`.
- **Guage for number of requests**: This gauage tells the number of requests that have arrived at each endpoint being captured by a particular instance of `ResponseTimeInterceptor`.
- **Average response time graph**: This graph gives out information about the average response time for the requests coming through the interceptor.
- **Total number of requests graph**: This graph tells the total number of requests being received at a particular point of time.
- **Number of requests by status codes graph**: This graph gives out information about the number of requests grouped by the response HTTP status codes.

To read more about how the interceptor can be used, refer [here](https://github.com/techsavvyash/nestjs-monitor#usage)
To learn more about NestJS interceptor you can refer official NestJS documentation [here](https://docs.nestjs.com/interceptors)
A small demo showcasing these `interceptors` in action can be found [here](https://drive.google.com/file/d/1KSxZdQzUU8SJmpmLHPpUSrRpnsL4aQY2/view?usp=sharing)
</p>