package routes

import (
  "encoding/json"
  "net/http"
  "runtime"

  "lappdog/models"
)

func GetImplementation(w http.ResponseWriter, r *http.Request) {
  var Implementation = models.Implementation{
    Id:    "go-" + runtime.Version(),
    Name:  "Go (" + runtime.Version() + ")",
    Image: "https://go.dev/blog/go-brand/Go-Logo/PNG/Go-Logo_White.png",
    Color: "94, 177, 205",
  }

  err := json.NewEncoder(w).Encode(Implementation)
  if err != nil {
    sendError(w, err)
    return
  }

  w.WriteHeader(http.StatusOK)
}
