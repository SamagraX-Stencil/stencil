---
title: Stencil Boilerplate Setup
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Features</title>
</head>
<p>

Stencil provides a powerful boilerplate setup to streamline the process of load testing using the k6 benchmarking tool. This tutorial will guide you through the details of the Stencil boilerplate, covering essential functions and best practices for creating effective performance tests.

### Understanding the Boilerplate

The Stencil boilerplate, encapsulated in the `common.js` file, is designed to handle common HTTP request patterns, allowing for modular and reusable load test scripts. Let's explore the key components and functions within the boilerplate.

#### Default Function

The default function serves as the foundation for many load tests. It initiates an HTTP GET request, checks the response status, and introduces a controlled pause between iterations using the `sleep` function. Here's a simplified representation:

```javascript
import http from 'k6/http';

export default function () {
  const res = http.get('http://localhost:3000');
  check(res, { 'Status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

In this example, the default function sends an HTTP GET request to http://localhost:3000, checks if the response status is 200, and then introduces a 1-second pause.

#### uploadFile Function

The 'uploadFile' function facilitates the uploading of files to a specified destination. It accepts parameters such as the URL, file path, destination, and filename. Below is a basic representation:

```javascript
import http from 'k6/http';

export function uploadFile(url, filePath, destination, filename) {
  const payload = {
    files: {
      file: '@' + filePath,
    },
    destination: destination,
    filename: filename,
  };
  const response = http.post(url, payload);
  return response;
}
```

This function uses the `http.post` method to upload a file to the specified URL. The file path, destination, and filename are parameters that you can customize based on your test requirements.

#### downloadFile Function

The 'downloadFile' function manages the downloading of files from a specified location. It constructs the download URL and performs an HTTP GET request to retrieve the file. Here's a simplified version:

```javascript
import http from 'k6/http';

export function downloadFile(url, destination) {
  const downloadUrl = `${url}/${destination}`;
  const response = http.get(downloadUrl);
  return response;
}
```

This function constructs the download URL by appending the destination to the base URL. It then performs an HTTP GET request to retrieve the file.

#### Using the Boilerplate in Your Tests

Now that we've covered the core functions of the Stencil boilerplate, let's see how you can integrate it into your load tests. Follow these steps:

1. Import the Functions

In your test file, import the necessary functions from the `common.js` file.

```javascript
import { default as defaultFunction, uploadFile, downloadFile } from './common.js';
```

2. Configure Test Scenarios

Leverage the imported functions within your test scenarios. Customize parameters based on your specific use case.

```javascript
export default function () {
  // Use defaultFunction for basic HTTP GET requests
  defaultFunction();

  // Example of using uploadFile
  const uploadResponse = uploadFile(
    'http://localhost:3000/api/upload',
    '/path/to/upload/file.txt',
    'uploads',
    'uploaded_file.txt'
  );
  console.log(`Upload Response: ${uploadResponse.status}`);

  // Example of using downloadFile
  const downloadResponse = downloadFile('http://localhost:3000/api/files', 'downloaded_file.txt');
  console.log(`Download Response: ${downloadResponse.status}`);
}
```

3. Run Your Test

Execute your load test using the k6 tool. Adjust the virtual user count, test duration, and other parameters in your k6config.js file as needed.

```javascript
k6 run your_test_file.js
```




</p>
