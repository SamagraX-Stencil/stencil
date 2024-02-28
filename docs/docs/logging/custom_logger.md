---
title: Custom Logger
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

Stencil's Custom Logger, powered by the Winston logging library, offers a versatile and customizable solution for logging in your Stencil applications. This detailed guide is designed to help absolute beginners understand and effectively use the Custom Logger.

# Getting Started

## Import Custom Logger

Import the `Logger` class into your TypeScript files where you want to use logging. Update the path accordingly.

```typescript
import { Logger } from './path/to/Logger';
```

# Logging Messages

## What to Capture?

When logging, consider capturing the following information:

- **Error Context**: Include relevant details about the error, such as error codes, stack traces, or any specific error-related information.

- **User Actions**: Log user actions or events that are critical to understanding the application's flow.

- **Request and Response Data**: For web applications, log important details from incoming requests and the corresponding responses.

- **Performance Metrics**: Capture performance-related information, such as response times, database query durations, or any other metrics that help in performance analysis.

## Log Levels

The Custom Logger supports the following log levels:

- `error`: For critical errors.
- `warn`: For warning messages.
- `info`: For general informational messages.
- `verbose`: For more detailed logs.
- `debug`: For debugging information.

## Log Messages

Use the various log methods provided by the `Logger` class to log messages at different levels.

```typescript
import { Logger } from './path/to/Logger';

// Log messages at different levels
Logger.error('An error occurred', 'ExampleModule');
Logger.info('Informational message', 'ExampleModule');
Logger.debug('Debugging information', 'ExampleModule');
```
# Notes for Beginners

## Contexts

Always include a context parameter in your log messages to indicate where the log originates. It helps in tracing issues.

## Understanding Log Levels

Familiarize yourself with different log levels and use them appropriately based on the importance and type of information.

## Default Nest.js Logger

If you're using Nest.js, take advantage of the integration with the default Nest.js logger for seamless logging.

## Customization Tips

Feel free to adjust log levels, colors, and other configurations to match your preferences and application needs.

## Check Dependencies

Ensure that you have installed the required dependencies by running `npm install winston`.

The Stencil Custom Logger aims to provide a beginner-friendly yet powerful logging solution for your Stencil applications. Customize it according to your needs, and enjoy efficient logging across your project.

</p>
