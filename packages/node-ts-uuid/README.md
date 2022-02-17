# Node UUID

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/node-ts-uuid.svg)](https://www.npmjs.com/package/node-ts-uuid)
[![npm](https://img.shields.io/npm/dw/node-ts-uuid.svg)](https://www.npmjs.com/package/node-ts-uuid)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

A simple uuid generator. The generator uses the MAC address / IPv6 address + the process id + the
current time to ensure a unique id is generated. The length of the uuid can be specified, this will
either increase or decrease the number of characters in the uuid. If the uuid needs to be padded to
create a longer uuid, a bitwise operation is used to generate the unique characters. A prefix may
also specified.

## Installation

`yarn add node-ts-uuid`

## Usage

```typescript
import { Uuid, UuidOptions } from 'node-ts-uuid';

const options: UuidOptions = {
  length: 50,
  prefix: 'test-',
};

export function getUuid() {
  const uuid: string = Uuid.generate(options);
  console.log(uuid);
  return uuid;
}
```

Will generate a uuid similar to: `test-6xke0ccwg0k00emrjrz81gu8a63657918908addf9942c`

### Methods

#### `generate(options?: UuidOptions)`

Generates a UUID using the IPv6 / Mac Address, the process id, and the current time. Optionally add
a prefix, and limit / pad the uuid to be a specific length.

#### `getPid()`

Returns the running process id or a randomly generated 5 digit number.

#### `getAddress()`

Returns the MAC Address or IPv6 Address, if neither are available a randomly generated 8 digit
number is returned.

#### `getNow()`

Returns the current epoch time or the previously returned epoch time incremented by 1.

#### `postProcessUuid(uuid: string, length?: number)`

Pads / limits the length of the provided uuid if the length is shorter than desired a bitwise
operation provides the randomly generated characters.

### Options

```typescript
UuidOptions {
  length?: number;
  prefix?: string;
}
```

- `length`: Pad / Limit the length of the uuid.
- `prefix`: Add a prefix to the uuid.

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
