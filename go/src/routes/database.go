package routes

import (
  "fmt"
  "os"

  "database/sql"
  _ "github.com/go-sql-driver/mysql"
)

var connectionString string

func getLedgerDB() (*sql.DB, error) {
  if connectionString == "" {
    port := os.Getenv("LAPPDOG_DB_PORT")
    if port != "" {
      port = ":" + port
    }

    connectionString = fmt.Sprintf(
      "%s:%s@tcp(%s%s)",
      os.Getenv("LAPPDOG_DB_USER"),
      os.Getenv("LAPPDOG_DB_PASSWORD"),
      os.Getenv("LAPPDOG_DB_HOST"),
      port,
    )
  }
  return sql.Open("mysql", connectionString + "/ledger")
}
