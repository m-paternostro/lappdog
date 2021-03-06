#! /bin/sh

COMMAND="
CREATE USER '$LAPPDOG_DB_USER'@'%' IDENTIFIED BY '$LAPPDOG_DB_PASSWORD';
GRANT INSERT, SELECT ON users TO '$LAPPDOG_DB_USER'@'%';
GRANT INSERT, SELECT ON transactions TO '$LAPPDOG_DB_USER'@'%';
GRANT EXECUTE ON FUNCTION registerTransaction TO '$LAPPDOG_DB_USER'@'%';
"

mysql -u root -p$MYSQL_ROOT_PASSWORD -Dledger --execute "$COMMAND"
