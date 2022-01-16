# Go LappDog

## Highlights

* This module implements a [Go](https://go.dev) + [Mux](https://github.com/gorilla/mux) application.
* The source code is lint with [golangci-lint](https://github.com/golangci/golangci-lint), using the default configuration.

## Dependencies

Handling dependencies is a no-brainer when developing only on the host: simply run `go mod download` (or the equivalent command) and be done.

Things are a bit more "interesting" when the goal is to also support development using containers. The issue here is that while we need to expose the source code to the container, we must not allow the container to read from or write to the local dependencies directory. There are a few reasons for this, including the fact that the container may be running a different OS, which may require different (often conflicting) versions of the dependencies.

The approach we've adopted for the Go LappDog involves the following steps:

* The "[dependencies](./Containerfile)" image copies the `go.*` files to its `/work/app/src` directory and runs `go mod download`.
  * This causes the dependencies to be installed into `/work/dependencies`, which is the value of the `GOPATH` environment variable.
* When running the "development" image (that depends on the "dependency" image), the project's `go/src` directory (the 'src' directory sibling to this document) is mapped to `/work/app/src`.
  * Because we do not map the container's `/work/dependencies` directory, the dependencies never show up on the host.
* The `dev.tidy` [command](../README.md#commands) runs [go mod tidy](https://go.dev/ref/mod#go-mod-tidy) on the source code.

This approach ultimately works because Go allows specifying the dependency directory via an environment variable.

Notes:

* Because the dependencies are initially handled with *copies of the go.mod and go.sum files*, it's important to remember to run the `dev.tidy` command if there is any change on the dependencies used by the code.
* We noticed some great improvement on the overall development experience by breaking the development image into two images (dependencies + development), specially because our dependencies don't change too often.
  * The different images benefit from the awesome caching strategies the container technology offers.

## License

Everything we produced here is licensed under the [MIT License](../LICENSE).
