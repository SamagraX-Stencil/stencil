---
title: Development Setup
sidebar_label: Development Setup
slug: /
hide_table_of_contents: true
---

import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Docs</title>
</head>
<p>

This guide will walk you through the process of setting up the Stencil microservice for development on your local machine.

### Step 1: Clone the Repository

Clone the Stencil repository to your local machine using the following command:

```typescript
git clone --depth 1 https://github.com/ChakshuGautam/stencil.git my-app
```

### Step 2: Navigate to the Project Directory

Move into the newly created project directory:

```typescript
cd my-app/
```

### Step 3: Copy Environment Configuration

Copy the example environment file to create your local configuration:

```typescript
cp env-example .env
```

### Step 4: Run Setup Containers

Start the setup container using Docker Compose:

```typescript
docker compose up setup
```    

### Step 5: Start Stencil Containers

Launch the Stencil containers in detached mode:

```typescript
docker compose up -d
```

### Step 6: Install Dependencies

Install project dependencies using npm:


```typescript
npm install
```

### Step 7: Generate Prisma Client

Generate the Prisma client by running the following command:

```typescript
npx prisma generate
```

### Step 8: Start the Development Server

Start the Stencil microservice in development mode:

```typescript
npm run start:dev
```

Congratulations! You have successfully set up Stencil for development. The microservice is now running, and you can start building and testing your features. Access the API documentation at [http://localhost:3000/docs](http://localhost:3000/docs) to explore the available endpoints.


</p>