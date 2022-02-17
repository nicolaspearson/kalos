# Heart Ping

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/heart-ping.svg)](https://www.npmjs.com/package/heart-ping)
[![npm](https://img.shields.io/npm/dw/heart-ping.svg)](https://www.npmjs.com/package/heart-ping)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

A simple light-weight Typescript module for pinging HTTP services at set intervals to provide a
heartbeat.

## Installation

```sh
yarn add heart-ping
```

## Usage

```typescript
import HeartPing from 'heart-ping';

const heartPing = new HeartPing();
heartPing.setBeatInterval(10_000);
heartPing.setBeatTimeout(30_000);
heartPing.setOnTimeout(() => {
  console.log('The ping request to www.google.com has timed out!');
});
heartPing.start(
  'www.google.com', // or using https, e.g.: 'https://www.google.com'
  80,
  (time) => {
    console.log(`Successfully pinged www.google.com! It took ${time} milliseconds.`);
  },
  () => {
    console.log('Failed to ping www.google.com!');
  },
);
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
