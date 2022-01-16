package models

type LedgerSummary struct {
  Users        int32   `json:"users"`
  Transactions int32   `json:"transactions"`
  Balance      float64 `json:"balance"`
}

type LedgerUser struct {
  Name    string  `json:"name"`
  Balance float64 `json:"balance"`
}

type LedgerTransaction struct {
  From   string  `json:"from"`
  To     string  `json:"to"`
  Amount float64 `json:"amount"`
}
