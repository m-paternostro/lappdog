# LappDog: Test

## Notes

At this moment we are not validating the outcome of the tests, so it's necessary to comb through the generated output to look for errors.

The tests use several environment variables defined on [env files](../.env), which are automatically loaded by the scripts mentioned here.

## Test Suite

```bash
# Runs all tests
./suite.sh
```

## Database Tests

```bash
# Runs the tests using the database container.
./db/local.sh
```

## Implementation Tests

The [implementation tests](./implementations) require the database module.

```bash
# Starts the database container.
../compose.sh up -d --build db
```

The tests are flexible regarding where the LappDog implementation is running - its location can be specified using three different approaches:

* Passing an address that starts with http.

```bash
./implementations/curl/node.sh http://192.168.2.20:1234
./implementations/curl/go.sh https://example.com:8321
```

* Passing a value that is taken as a port for `http://$LAPPDOG_LOCAL_*_PORT` (`http://localhost` by default).

```bash
./implementations/curl/node.sh 3001
./implementations/curl/go.sh 3002
```

* Using the host and port defined by the environment variables `LAPPDOG_LOCAL_*_HOST` and `LAPPDOG_LOCAL_*_PORT`.

```bash
# LAPPDOG_LOCAL_NODE_HOST and LAPPDOG_LOCAL_NODE_PORT
./implementations/curl/node.sh

# LAPPDOG_LOCAL_GO_HOST and LAPPDOG_LOCAL_GO_PORT
./implementations/curl/go.sh
```

The implementation test also has [http files](./implementations/http) that are meant to be used with the [VSCode](https://code.visualstudio.com) extension [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

## Viewer Tests

As with the implementation tests, there are three ways to specify the viewer's location:

```bash
./viewer/fetch.sh http://192.168.3.50
./viewer/fetch.sh 3003
./viewer/fetch.sh

./viewer/env.sh http://192.168.3.50
./viewer/env.sh 3003
./viewer/env.sh
```

## License

Everything we produced here is licensed under the [MIT License](../LICENSE).
