package routes

import (
  "encoding/json"
  "io/ioutil"
  "net/http"

  "lappdog/models"
)

func GetLedgerSummary(w http.ResponseWriter, r *http.Request) {
  bd, err := getLedgerDB()
  if err != nil {
    sendError(w, err)
    return
  }

  var summary models.LedgerSummary
  row := bd.QueryRow("select count(*), IFNULL(sum(balance), 0) from users")
  err = row.Scan(&summary.Users, &summary.Balance)
  if err != nil {
    sendError(w, err)
    return
  }

  row = bd.QueryRow("select count(*) from transactions")
  err = row.Scan(&summary.Transactions)
  if err != nil {
    sendError(w, err)
    return
  }

  sendJSON(w, summary, http.StatusOK)
}

func GetLedgerUsers(w http.ResponseWriter, r *http.Request) {
  bd, err := getLedgerDB()
  if err != nil {
    sendError(w, err)
    return
  }

  users := []models.LedgerUser{}
  rows, err := bd.Query("select name, balance from users")
  if err != nil {
    sendError(w, err)
    return
  }
  defer rows.Close()

  for rows.Next() {
    var user models.LedgerUser
    err = rows.Scan(&user.Name, &user.Balance)
    if err != nil {
      sendError(w, err)
      return
    }

    users = append(users, user)
  }

  sendJSON(w, users, http.StatusOK)
}

func GetLedgerTransactions(w http.ResponseWriter, r *http.Request) {
  bd, err := getLedgerDB()
  if err != nil {
    sendError(w, err)
    return
  }

  transactions := []models.LedgerTransaction{}
  rows, err := bd.Query(`select u1.name, u2.name, t.amount
  from transactions t, users u1, users u2
  where u1.id = t.fromuser and u2.id = t.touser`)
  if err != nil {
    sendError(w, err)
    return
  }
  defer rows.Close()

  for rows.Next() {
    var transaction models.LedgerTransaction
    err = rows.Scan(&transaction.From, &transaction.To, &transaction.Amount)
    if err != nil {
      sendError(w, err)
      return
    }

    transactions = append(transactions, transaction)
  }

  sendJSON(w, transactions, http.StatusOK)
}

func RegisterLedgerUser(w http.ResponseWriter, r *http.Request) {
  reqBody, err := ioutil.ReadAll(r.Body)
  if err != nil {
    sendError(w, err)
    return
  }

  var user models.LedgerUser
  err = json.Unmarshal(reqBody, &user)
  if err != nil {
    sendError(w, err)
    return
  }

  bd, err := getLedgerDB()
  if err != nil {
    sendError(w, err)
    return
  }

  _, err = bd.Exec("insert into users (name, balance) values (?, ?)", user.Name, user.Balance)
  if err != nil {
    sendError(w, err)
    return
  }

  w.WriteHeader(http.StatusCreated)
}

func RecordLedgerTransaction(w http.ResponseWriter, r *http.Request) {
  reqBody, err := ioutil.ReadAll(r.Body)
  if err != nil {
    sendError(w, err)
    return
  }

  var transaction models.LedgerTransaction
  err = json.Unmarshal(reqBody, &transaction)
  if err != nil {
    sendError(w, err)
    return
  }

  bd, err := getLedgerDB()
  if err != nil {
    sendError(w, err)
    return
  }

  _, err = bd.Exec("select registerTransaction(?, ?, ?)", transaction.From, transaction.To, transaction.Amount)
  if err != nil {
    sendError(w, err)
    return
  }

  w.WriteHeader(http.StatusCreated)
}
