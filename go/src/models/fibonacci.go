package models

type FibonacciResult struct {
  First *int  `json:"first,omitempty"`
  Last *uint64  `json:"last,omitempty"`
  Duration  *int64 `json:"duration,omitempty"`
  Message  string `json:"message,omitempty"`
}

type FibonacciResponse struct {
  Size int `json:"size"`
  Basic *FibonacciResult `json:"basic"`
  Recursive *FibonacciResult `json:"recursive"`
  Memoized *FibonacciResult `json:"memoized"`
}
