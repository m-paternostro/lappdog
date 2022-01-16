# LappDog Viewer

## Site ([src](./src) folder)

* The site files (HTML, CSS, and Javascript) are built with [Webpack](https://webpack.js.org).
  * Almost all HTML content is generated via Javascript.
* Webpack is configured and handled as a [Node](https://nodejs.org) application.
  * The files are built with commands declared on [package.json](./package.json).
* During development...
  * The `dev.run` [command](../README.md#commands) runs an instance of the Webpack's [server](https://webpack.js.org/configuration/dev-server/).
  * The built files include a complete [source-map](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map) artifact to facilitate using the browser's development tools.
* For production, the site files are minified and not bundled with generated the source-map file.
* All features of the [Node LappDog](./node) container development environment are also available here, including the linter and dependency management.

## Server ([src.go](./src.go) folder)

* The application that servers the site files is implemented using [Go](https://go.dev).
* All features of the [Go LappDog](./go) container development environment are also available here, including the linter and dependency management.

## Production

* The site files are created by a container during the build process. Another container builds the Go application.
* The site files and the server application are copied into a [scratch image](https://hub.docker.com/_/scratch) resulting in a small and light production container.
  * To be clear, the production container does not use node ;-)

## License

Everything we produced here is licensed under the [MIT License](../LICENSE).
