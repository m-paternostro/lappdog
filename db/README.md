# LappDog DB

## Highlights

* This module configures a [MySQL](https://www.mysql.com/) relational database that LappDogs can use.
* At the moment it provides the [schema for the Ledger](./init/01-ledger.sql) section:
  * This schema creates tables with referential integrity and value constraints, as well as a trigger and stored function.
  * The user is configured via a [shell script](./init/users.sh) to easily reuse the environment variables.

## Details

The [init](./init) directory is copied into to the `docker-entrypoint-initdb.d` of the [MySQL Image](https://hub.docker.com/_/mysql). When a container is started, the content of this directory is executed in alphabetical order, be it a `.sql` file or an executable script.

## License

Everything we produced here is licensed under the [MIT License](../LICENSE).
