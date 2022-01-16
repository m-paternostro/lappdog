package models

type ModelError struct {
  Message string   `json:"message"`
  Stack   []string `json:"stack,omitempty"`
}
