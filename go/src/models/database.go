package models

import (
  "fmt"
  "os"

  sqltrace "gopkg.in/DataDog/dd-trace-go.v1/contrib/database/sql"
  "database/sql"
  "github.com/go-sql-driver/mysql"
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

  sqltrace.Register("mysql", &mysql.MySQLDriver{}, sqltrace.WithServiceName(os.Getenv("LAPPDOG_SERVICE_MYSQL")))
  return sqltrace.Open("mysql", connectionString + "/ledger")
}

func GetLedgerSummary() (*LedgerSummary, error) {
  bd, err := getLedgerDB()
  if err != nil {
    return nil, err
  }

  var summary LedgerSummary
  row := bd.QueryRow("select count(*), IFNULL(sum(balance), 0) from users")
  err = row.Scan(&summary.Users, &summary.Balance)
  if err != nil {
    return nil, err
  }

  row = bd.QueryRow("select count(*) from transactions")
  err = row.Scan(&summary.Transactions)
  if err != nil {
    return nil, err
  }

  return &summary, nil
}

func GetLedgerUsers() (*[]LedgerUser, error) {
  bd, err := getLedgerDB()
  if err != nil {
    return nil, err
  }

  users := []LedgerUser{}
  rows, err := bd.Query("select name, balance from users")
  if err != nil {
    return nil, err
  }
  defer rows.Close()

  for rows.Next() {
    var user LedgerUser
    err = rows.Scan(&user.Name, &user.Balance)
    if err != nil {
      return nil, err
    }

    users = append(users, user)
  }

  return &users, nil;
}

func GetLedgerTransactions() (*[]LedgerTransaction, error) {
  bd, err := getLedgerDB()
  if err != nil {
    return nil, err
  }

  transactions := []LedgerTransaction{}
  rows, err := bd.Query(`select u1.name, u2.name, t.amount
  from transactions t, users u1, users u2
  where u1.id = t.fromuser and u2.id = t.touser`)
  if err != nil {
    return nil, err
  }
  defer rows.Close()

  for rows.Next() {
    var transaction LedgerTransaction
    err = rows.Scan(&transaction.From, &transaction.To, &transaction.Amount)
    if err != nil {
      return nil, err
    }

    transactions = append(transactions, transaction)
  }

  return &transactions, nil
}

func RegisterLedgerUser(user LedgerUser) error {
  bd, err := getLedgerDB()
  if err != nil {
    return err
  }

  _, err = bd.Exec("insert into users (name, balance) values (?, ?)", user.Name, user.Balance)
  return err
}

func RecordLedgerTransaction(transaction LedgerTransaction) error {
  bd, err := getLedgerDB()
  if err != nil {
    return err
  }

  _, err = bd.Exec("select registerTransaction(?, ?, ?)", transaction.From, transaction.To, transaction.Amount)
  return err
}
