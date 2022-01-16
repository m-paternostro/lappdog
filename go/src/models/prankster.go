package models

type PranksterInput struct {
  ExceptionMessage  string `json:"exceptionMessage,omitempty"`
  StatusCode  *int `json:"statusCode"`
  Delay int  `json:"delay,omitempty"`
}
