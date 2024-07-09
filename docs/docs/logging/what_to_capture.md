---
title: What to capture?
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

In this comprehensive doc, we'll explore what to capture, when to use different log levels, and best practices for effective logging.

## Logging Levels

The Custom Logger supports the following log levels, each serving a specific purpose:

### 1. Error Level

- **When to Use**: For critical errors that require immediate attention.
- **What to Capture**: Exception details, error codes, and any relevant context.

### 2. Warn Level

- **When to Use**: For warning messages indicating potential issues.
- **What to Capture**: Warning-specific details, unexpected conditions, and potential risks.

### 3. Info Level

- **When to Use**: For general informational messages about the application's state.
- **What to Capture**: High-level overviews, successful transactions, or key application events.

### 4. Verbose Level

- **When to Use**: For more detailed logs useful for understanding the flow of operations.
- **What to Capture**: Additional information, intermediate steps, or significant transitions.

### 5. Debug Level

- **When to Use**: For detailed debugging information during development.
- **What to Capture**: In-depth details, variable values, and step-by-step execution flow.

## Best Practices

### 1. Include Context

Always include a context parameter in your log messages. It helps in tracing issues back to their source, making debugging more efficient.

```typescript
CustomLogger.error('An error occurred', 'YourModule');
```

## 2. Log User Actions

Capture user actions or events that are crucial for understanding how users interact with your application.

```typescript
CustomLogger.info('User logged in', 'AuthenticationModule');
```

## 3. Request and Response Data

For web applications, log important details from incoming requests and the corresponding responses.

```typescript
CustomLogger.debug('Request received', 'APIController');
```

## 4. Gradual Log Level Escalation

Start with higher-level logs and escalate to more detailed levels if needed. For instance, begin with Info and escalate to Debug if troubleshooting is required.

```typescript
CustomLogger.info('Task completed successfully', 'TaskModule');
CustomLogger.debug('Task details', 'TaskModule');
```

## Integration with Default Nest.js Logger

If you're using Nest.js, leverage the integration with the default Nest.js logger for seamless logging across the application.

```typescript
CustomLogger.log('Info message', 'YourContext');
CustomLogger.verboseDefault('Verbose message', 'YourContext');
```

</p>
