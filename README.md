# docker-scan

A GitHub Action for running docker scan.

## Usage

To use the GitHub Action, add the following to your job:

```yaml
- uses: conventional-actions/docker-scan@v1
```

### Inputs

| Name       | Default      | Description                                                                                                   |
|------------|--------------|---------------------------------------------------------------------------------------------------------------|
| `image`    | required     | name of image to scan                                                                                         |
| `tag`      | `latest`     | tag of image to scan                                                                                          |
| `file`     | `Dockerfile` | specify the location of the Dockerfile associated with the image. This option displays a detailed scan result |
| `severity` | `medium`     | only report vulnerabilities of provided level or higher (low, medium, high)                                   |
| `args`     | N/A          | Additional arguments to pass to Snyk                                                                          |
| `fail-on`  | `all`        | Fail only when there are vulnerabilities that can be fixed.                                                   |

### Outputs

No outputs

### Environment variables

The `SNYK_TOKEN` environment variable should be set.

### Example

```yaml
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: conventional-actions/docker-scan@v1
        with:
          image: octo/kit
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
