package routes

import (
  "encoding/json"
  "io/ioutil"
  "net/http"

  "lappdog/models"
)

func GetLedgerSummary(w http.ResponseWriter, r *http.Request) {
  summary, err := models.GetLedgerSummary();
  if err != nil {
    sendError(w, err)
  } else {
    sendJSON(w, summary, http.StatusOK)
  }
}

func GetLedgerUsers(w http.ResponseWriter, r *http.Request) {
  users, err := models.GetLedgerUsers();
  if err != nil {
    sendError(w, err)
  } else {
    sendJSON(w, users, http.StatusOK)
  }
}

func GetLedgerTransactions(w http.ResponseWriter, r *http.Request) {
  transactions, err := models.GetLedgerTransactions();
  if err != nil {
    sendError(w, err)
  } else {
    sendJSON(w, transactions, http.StatusOK)
  }
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

  err = models.RegisterLedgerUser(user)
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

  err = models.RecordLedgerTransaction(transaction)
  if err != nil {
    sendError(w, err)
    return
  }

  w.WriteHeader(http.StatusCreated)
}
