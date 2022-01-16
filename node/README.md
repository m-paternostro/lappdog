# Node LappDog

## Highlights

* This module implements a [Node](https://nodejs.org) + [Express](https://expressjs.com) application.
* The `type` of the application set on [package.json](./package.json) is `module` so we can use the `import` syntax.
* The source code is lint using a custom [ESLint](https://eslint.org) configuration, that extends the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
* The production container is built following the guidelines recommended by [Synk](https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/).

## Dependencies

Handling dependencies is a no-brainer when developing only on the host: simply run `npm install` (or the equivalent `yarn` command) and be done.

Things are a bit more "interesting" when the goal is to also support developing using containers. The issue here is that while we need to expose the source code to the container, we must not allow the container to read from or write to the local `node_modules` directory. There are a few reasons for this, including the fact that the container may be running a different OS, which may require different (often conflicting) versions of the dependencies.

The approach we've adopted for the Node LappDog involves the following steps:

* The "[dependencies](./Containerfile)" image copies the `package*.json` files to its `/work/` directory and runs `npm install`.
  * This causes the dependencies to be installed into `/work/node_modules`.
* The "dependencies" image declares a volume pointing to `/work/app/node_modules`.
  * This volume is not mapped when running the image.
* The "development" image (that depends on the "dependency" image) deletes the `/work/package*.json` files and creates the symbolic links `/work/package.json` and `/work/package-lock.json` pointing to `/work/app/package.json` and `/work/app/package-lock.json` respectively.
  * The above target files don't exist yet.
* When running the "development" image, the project's `node` directory (the one containing this document) is mapped to `/work/app`.
  * Because we do NOT map the `/work/app/node_modules` volume from the "dependencies" image, the host's `node_modules` directory is ignored. In fact, if you investigate the container, you will notice that `/work/app/node_modules` is empty - or at least different from the host's version.
  * The symbolic links we've created above now point to the actual package files.
* The `dev.install` [command](../README.md#commands) runs `npm install` on `/work` (not on `/work/app`), which ensures that the dependencies are written to (`/work/node_modules`).

This approach ultimately works because Node's behavior is to first search for the dependencies on the current directory (`/work/app/node_modules`) and then, if needed, to continue searching on parent directories (`/work/node_modules`).

There are some great resources on this topic on the internet. Search for "node_modules docker".

Notes:

* The extra work to keep all dependencies in `/work/node_modules` (i.e., the symbolic links and `dev.install`) is not really required. We've done to avoid splitting the dependencies between `/work/node_modules` and `/work/app/node_modules`.
* Because the dependencies are initially handled with *copies of the package.json and package-lock.json files*, it's important to remember to run either the `dev.install` or the `dev.update` commands if there is any change to `package.json`.
* We noticed some great improvement on the overall development experience by breaking the development image into two images (dependencies + development), specially because our dependencies don't change too often.
  * The different images benefit from the awesome caching strategies the container technology offers.

## License

Everything we produced here is licensed under the [MIT License](../LICENSE).
