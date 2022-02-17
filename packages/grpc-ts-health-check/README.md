# gRPC Health Check

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/grpc-ts-health-check.svg)](https://www.npmjs.com/package/grpc-ts-health-check)
[![npm](https://img.shields.io/npm/dw/grpc-ts-health-check.svg)](https://www.npmjs.com/package/grpc-ts-health-check)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

An implementation of `gRPC` health checks, written in typescript.

It is assumed that you are using the `@grpc/grpc-js` library.

## Installation

```sh
yarn add grpc-ts-health-check
```

Install the `@grpc/grpc-js` library:

```sh
yarn add @grpc/grpc-js
```

## Dependencies

- [Google Protobuf](https://www.npmjs.com/package/google-protobuf): Protocol Buffers - Google's data
  interchange format.
- [gRPC Boom](https://www.npmjs.com/package/grpc-boom): A zero dependency library to help create
  `gRPC`-friendly error objects.

## Usage

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

import { HealthClient } from '../dist/proto/grpc/health/v1/Health';
import { HealthCheckResponse__Output } from '../dist/proto/grpc/health/v1/HealthCheckResponse';
import { ProtoGrpcType } from '../dist/proto/health';

export class HealthGrpcClient {
  private readonly client: HealthClient;

  constructor({ host, port }: { host: string; port: number }) {
    const packageDefinition = protoLoader.loadSync(path.resolve('../dist/proto/health.proto'), {
      arrays: true,
      keepCase: true,
      longs: String,
      enums: String,
      objects: true,
      defaults: true,
    });
    const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
    this.client = new proto.grpc.health.v1.Health(
      `${host}:${port}`,
      grpc.ChannelCredentials.createInsecure(),
    );
  }

  checkStatus(): Promise<HealthCheckResponse__Output> {
    return new Promise((resolve, reject) => {
      this.client.check(
        { service: 'example' },
        (error?: grpc.ServiceError | null, result?: HealthCheckResponse__Output): void => {
          if (error) {
            reject(error);
          }
          resolve(result || ({} as HealthCheckResponse__Output));
        },
      );
    });
  }

  watchStatus(): grpc.ClientReadableStream<HealthCheckResponse__Output> {
    return this.client.watch({ service: 'example' });
  }
}
```

### Methods

Below is a list of available methods:

#### `check(request, callback)`

Checks the status of the service once.

- `request` - the `HealthCheckRequest` object.
- `callback` (optional) - the callback method.

#### `watch(request)`

Set the initial status of the service and continues to watch for any changes.

- `request` - the `HealthCheckRequest` object.

## License

MIT License

## Contributing

Contributions are encouraged, please see further details below:

### Pull Requests

Here are some basic rules to follow to ensure timely addition of your request:

1. Match coding style (braces, spacing, etc.).
2. If it is a feature, bugfix, or anything please only change the minimum amount of code required to
   satisfy the change.
3. Please keep PR titles easy to read and descriptive of changes, this will make them easier to
   merge.
4. Pull requests _must_ be made against the `main` branch. Any other branch (unless specified by the
   maintainers) will get rejected.
5. Check for existing issues first, before filing a new issue.
