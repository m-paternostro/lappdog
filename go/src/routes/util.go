package routes

import (
  "encoding/json"
  "log"
  "net/http"

  "lappdog/models"
)

func sendError(w http.ResponseWriter, err error) {
  var modelError models.ModelError
  modelError.Message = err.Error()

  w.WriteHeader(http.StatusInternalServerError)
  e := json.NewEncoder(w).Encode(modelError)
  if e != nil {
    log.Printf("Unable to send the error information to the client")
    log.Print(e)
  }
}

func sendJSON(w http.ResponseWriter, data interface{}, status int) {
  w.WriteHeader(status)
  err := json.NewEncoder(w).Encode(data)
  if err != nil {
    sendError(w, err)
    return
  }
}
