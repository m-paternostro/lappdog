package server

import (
  "encoding/json"
  "fmt"
  "log"
  "net/http"
  "os"
)

func getEnvironmentVariables(w http.ResponseWriter, r *http.Request) {
  names, present := r.URL.Query()["name"]
  if present {
    length := len(names)
    if length > 0 {
      variableMap := make(map[string]string)
      for _, name := range names {
        value := os.Getenv(name);
        if value != "" {
          variableMap[name] = value
        }
      }

      if len(variableMap) > 0 {
        w.WriteHeader(http.StatusOK)
        err := json.NewEncoder(w).Encode(variableMap)
        if err != nil {
          w.WriteHeader(http.StatusInternalServerError)
          w.Header().Set("Content-Type", "text/plain; charset=UTF-8")
          fmt.Print(w, err.Error())
        }
        return
      }
    }
  }
  w.WriteHeader(http.StatusNoContent)
}

func Run() {
  var directory string
  if len(os.Args) >= 2 {
    directory = os.Args[1]
  } else {
    log.Fatal("The directory with the static files must be provided as the first argument.")
  }

  var port string
  if len(os.Args) >= 3 {
    port = os.Args[2]
  } else {
    log.Fatal("The server port must be provided as the second argument.")
  }

  fs := http.FileServer(http.Dir(directory))
  http.Handle("/", fs)
  http.HandleFunc("/env", getEnvironmentVariables)

  log.Printf("Server started on port '%s'", port)
  log.Fatal(http.ListenAndServe(":"+port, nil))
}
