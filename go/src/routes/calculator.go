package routes

import (
  "encoding/json"
  "fmt"
  "io"
  "io/ioutil"
  "net/http"
  "strconv"

  "lappdog/models"
)

func Calculate(w http.ResponseWriter, r *http.Request) {
  reqBody, err := ioutil.ReadAll(r.Body)
  if err != nil {
    sendError(w, err)
    return
  }

  var input models.CalculatorInput
  if (len(reqBody) > 0) {
    err = json.Unmarshal(reqBody, &input)
    if err == io.EOF {
    } else if err != nil {
      sendError(w, err)
      return
    }
  } else {
    input.Number1, err = strconv.ParseFloat(r.URL.Query().Get("number1"), 64)
    if err != nil {
      sendError(w, err)
      return
    }

    input.Number2, err = strconv.ParseFloat(r.URL.Query().Get("number2"), 64)
    if err != nil {
      sendError(w, err)
      return
    }

    input.Operator = r.URL.Query().Get("operator")
  }

  var result float64
  if input.Operator == "multiply" {
    result = input.Number1 * input.Number2
  } else if input.Operator == "divide" {
    result = input.Number1 / input.Number2
  } else {
    sendError(w, fmt.Errorf("The value of 'operator' must be either 'multiply' or 'divide' and is '%s'.", input.Operator))
    return
  }

  w.Header().Set("Content-Type", "text/plain; charset=UTF-8")
  fmt.Fprintf(w, "%f", result)
  w.WriteHeader(http.StatusOK)
}
