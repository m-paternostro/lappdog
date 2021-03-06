package server

import (
  "log"
  "net/http"
  "os"

  "github.com/gorilla/handlers"
)

func Run() {
  router := NewRouter()

  headersOk := handlers.AllowedHeaders([]string{"Content-Type"})
  originsOk := handlers.AllowedOrigins([]string{"*"})
  methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"})

  var port string
  if len(os.Args) == 2 {
    port = os.Args[1]
  } else {
    log.Fatal("The server port must be provided as the first argument.")
  }

  log.Printf("Server started on port '%s'", port)
  log.Fatal(http.ListenAndServe(":"+port, handlers.CORS(originsOk, headersOk, methodsOk)(router)))
}
