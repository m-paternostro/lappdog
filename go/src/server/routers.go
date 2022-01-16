package server

import (
  "net/http"
  "strings"

  muxtrace "gopkg.in/DataDog/dd-trace-go.v1/contrib/gorilla/mux"

  rt "lappdog/routes"
)

type Route struct {
  Name        string
  Method      string
  Pattern     string
  HandlerFunc http.HandlerFunc
}

type Routes []Route

func NewRouter() *muxtrace.Router {
  router := muxtrace.NewRouter().StrictSlash(true)
  for _, route := range routes {
    var handler http.Handler
    handler = route.HandlerFunc
    handler = Logger(handler, route.Name)

    router.
      Methods(route.Method).
      Path(route.Pattern).
      Name(route.Name).
      Handler(handler)
  }

  return router
}

var routes = Routes{
  Route{
    "GetImplementation",
    strings.ToUpper("Get"),
    "/",
    rt.GetImplementation,
  },

  Route{
    "Calculate",
    strings.ToUpper("Post"),
    "/calculator",
    rt.Calculate,
  },

  Route{
    "ComputeLastElement",
    strings.ToUpper("Post"),
    "/fibonacci",
    rt.ComputeLastElement,
  },

  Route{
    "GetLedgerSummary",
    strings.ToUpper("Get"),
    "/ledger",
    rt.GetLedgerSummary,
  },

  Route{
    "GetLedgerTransactions",
    strings.ToUpper("Get"),
    "/ledger/transactions",
    rt.GetLedgerTransactions,
  },

  Route{
    "GetLedgerUsers",
    strings.ToUpper("Get"),
    "/ledger/users",
    rt.GetLedgerUsers,
  },

  Route{
    "RecordLedgerTransaction",
    strings.ToUpper("Post"),
    "/ledger/transactions",
    rt.RecordLedgerTransaction,
  },

  Route{
    "RegisterLedgerUser",
    strings.ToUpper("Post"),
    "/ledger/users",
    rt.RegisterLedgerUser,
  },

  Route{
    "PrankIt",
    strings.ToUpper("Post"),
    "/prankster",
    rt.PrankIt,
  },
}
