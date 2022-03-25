# EWL

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/ewl.svg)](https://www.npmjs.com/package/ewl)
[![npm](https://img.shields.io/npm/dw/ewl.svg)](https://www.npmjs.com/package/ewl)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

EWL (express-winston-logger) provides common defaults for logging in an express application using
winston. It is pre-configured with request tracing enabled and extends some of the features provided
by express-winston, e.g. body blacklisting.

## Installation

```sh
yarn add ewl
```

## Usage

```typescript
import { Ewl } from 'ewl';

const ewl = new Ewl();
ewl.debug('This logs to console by default.');
```

### Basic Express Example

`index.ts`:

```typescript
import { Application } from 'express';

import { ewl, initEwl } from './logger';

const app = express() as Application;
loggerInit(app);

const port = 3000;
app.listen(port, () => {
  ewl.debug(`App: Listening on port ${port}!`);
});
```

`logger/index.ts`:

```typescript
import { Application } from 'express';

import { Ewl } from 'ewl';

export let ewl: Ewl;

export function initEwl(app: Application): void {
  this.ewl = new Ewl({ attachRequestId: true, label: 'app' });
  // Use express-http-context for context injection (request id)
  app.use(this.ewl.httpContextMiddleware);
  app.use(this.ewl.getRequestIdHandler());
  // Use express-winston for logging request information
  app.use(
    this.ewl.createHandler({
      bodyBlacklist: ['accessToken', 'password', 'refreshToken'],
      colorize: true,
      expressFormat: true,
      headerBlacklist: ['cookie', 'token'],
      ignoreRoute: () => false,
      meta: true,
      metaField: 'express',
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
      requestWhitelist: [
        'headers',
        'method',
        'httpVersion',
        'originalUrl',
        'query',
        'params',
        'url',
      ],
      responseWhitelist: ['headers', 'statusCode'],
      statusLevels: true,
    }),
  );
}
```

`/middleware/logger.middleware.ts`:

```typescript
import { NextFunction, Request, Response } from 'express';

import { ewl } from '../logger';

export function loggerMiddleware(req: Request, _: Response, next: NextFunction): void {
  ewl.debug(`${req.method} ${req.path}`);
  next();
}
```

### Basic NestJS Example

`index.ts` / `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';

import { Ewl } from 'ewl';

import { AppModule } from './app.module';

async function bootstrap() {
  const ewl = new Ewl({ attachRequestId: true, label: 'app' });
  // Set the default NestJS logger, allowing EWL to be the proxy.
  const app = await NestFactory.create(AppModule, { logger: ewl });

  // Use express-winston for logging request information
  app.use(
    ewl.createHandler({
      bodyBlacklist: ['accessToken', 'password', 'refreshToken'],
      colorize: true,
      expressFormat: true,
      headerBlacklist: ['cookie', 'token'],
      ignoreRoute: () => false,
      meta: true,
      metaField: 'express',
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
      requestWhitelist: [
        'headers',
        'method',
        'httpVersion',
        'originalUrl',
        'query',
        'params',
        'url',
      ],
      responseWhitelist: ['headers', 'statusCode'],
      statusLevels: true,
    }),
  );

  // Use express-http-context for context injection (request id)
  app.use(ewl.httpContextMiddleware);
  app.use(ewl.getRequestIdHandler());

  ewl.debug('Starting application on localhost:3000');

  await app.listen(3000, 'localhost');
}
bootstrap();
```

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
