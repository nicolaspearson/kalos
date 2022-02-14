# Kalos

This yarn monorepo contains a variety of packages that are published to npm.

## Packages

- [grpc-boom](./packages/grpc-boom/README.md)
- [heart-ping](./packages/heart-ping/README.md)

### Working With Packages

The is a yarn monorepo, therefore scripts in packages can be executed by pre-pending the command
with `yarn workspace` and specifying the name of the package, e.g.

- Build **grpc-boom**: `yarn workspace grpc-boom build`
- Lint **grpc-boom**: `yarn workspace grpc-boom lint`
- Test **grpc-boom**: `yarn workspace grpc-boom test:unit`

> Tip: add `yarn workspace` as an alias to your .bashrc / .zshrc, e.g.
>
> ```sh
> alias yw='yarn workspace'
> ```

### Creating Package Scoped Commits

In order to assist with changelog generation, this repository uses
[conventional commit](https://www.conventionalcommits.org/en/v1.0.0/#specification), changes to a
package should adhere to this style and include the name of the package, e.g.

- `chore(grpc-boom): set package.json version 3.0.9`
- `docs(heart-ping): add contribution guidelines`

## Release Workflow

Each package in this repository has a **base** workflow, e.g. `.github/workflows/grpc-boom.yaml`.
The **base** workflow is triggered on each `pull-request` or `push` to the **main** branch based on
specific paths, e.g.

```yaml
on:
  push:
    branches:
      - main
    paths:
      - .github/workflows/grpc-boom.yaml
      - packages/grpc-boom/**
      - package.json
      - tsconfig.json
      - types/**/*.ts
      - '!**.md'
      - '!**/.gitignore'
  pull_request:
    paths:
      - .github/workflows/grpc-boom.yaml
      - packages/grpc-boom/**
      - package.json
      - tsconfig.json
      - types/**/*.ts
      - '!**.md'
      - '!**/.gitignore'
```

When the workflow is triggered, the first step usually executes `build`, `lint` and `test`
operations, if this step succeeds it triggers the next step: `draft-release` which creates a draft
release in [kalos](https://github.com/nicolaspearson/kalos/releases).

### Publishing

To publish a package to npm one of the draft releases needs to be published:

1. Navigate to the [releases](https://github.com/nicolaspearson/kalos/releases) page.
2. Edit one of the draft releases.
3. Fill-in the release notes.
4. Click on the green `Publish release` button.

This will trigger the the `.github/workflows/publish.grpc-boom.yaml` workflow by pushing a new tag
to the repository. The publish workflow updates the version of the package in the `package.json`
file, and pushes the new version to npm.

### TODO

- Do not trigger the **base** workflow when the version in the `package.json` file is bumped.
- Attempt to make the `publish.*` workflow generic.

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
