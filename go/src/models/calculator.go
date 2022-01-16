package models

type CalculatorInput struct {
  Number1  float64 `json:"number1"`
  Number2  float64 `json:"number2"`
  Operator string  `json:"operator"`
}
