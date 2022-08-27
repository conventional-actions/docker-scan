# docker-scan

A GitHub Action for running docker scan.

## Usage

To use the GitHub Action, add the following to your job:

```yaml
- uses: conventional-actions/docker-scan@v1
```

### Inputs

| Name           | Default      | Description                                                                                                   |
|----------------|--------------|---------------------------------------------------------------------------------------------------------------|
| `scan-version` | `latest`     | the version of docker scan to install                                                                         |
| `image`        | required     | name of image to scan                                                                                         |
| `tag`          | `latest`     | tag of image to scan                                                                                          |
| `severity`     | `medium`     | only report vulnerabilities of provided level or higher (low, medium, high)                                   |
| `token`        | required     | use the authentication token to log into the third-party scanning provider                                    |
| `file`         | `Dockerfile` | specify the location of the Dockerfile associated with the image. This option displays a detailed scan result |
| `exclude-base` | `false`      | exclude the base image during scanning                                                                        |

### Outputs

No outputs

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
          token: ${{ secrets.SNYK_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
