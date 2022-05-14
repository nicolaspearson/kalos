# Nest Typed Config Extended

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/ewl.svg)](https://www.npmjs.com/package/nest-typed-config-extended)
[![npm](https://img.shields.io/npm/dw/ewl.svg)](https://www.npmjs.com/package/nest-typed-config-extended)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

Extends the default `dotenv-loader` and `module` provided by
[`nest-typed-config`](https://www.npmjs.com/package/nest-typed-config).

## Installation

```sh
yarn add nest-typed-config-extended
```

## Usage

```typescript
import { TypedConfigModuleExtended, dotenvLoaderExtended } from 'nest-typed-config-extended';

import { Config } from './common/config';

@Module({
  imports: [
    TypedConfigModuleExtended.forRoot({
      isGlobal: true,
      load: dotenvLoaderExtended({
        envFilePath: ['.env'],
        ignoreEnvFile: true,
        ignoreEnvVars: false,
        separator: '__',
        transformFromUpperSnakeCase: true,
      }),
      schema: Config,
    }),
  ],
})
export class MainModule {}
```

## Options

### `transformFromUpperSnakeCase`

If set to to `true` an `.env` file that contains `UPPER_SNAKE_CASE` variables, e.g. `NODE_ENV`, will
be transformed to the camelCase equivalent, e.g. `nodeEnv`. This works for shallow and deeply nested
objects.

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
