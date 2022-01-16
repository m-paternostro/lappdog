package routes

import (
  "encoding/json"
  "fmt"
  "io/ioutil"
  "net/http"
  "time"

  "lappdog/models"
)

func PrankIt(w http.ResponseWriter, r *http.Request) {
  reqBody, err := ioutil.ReadAll(r.Body)
  if err != nil {
    sendError(w, err)
    return
  }

  var input models.PranksterInput
  err = json.Unmarshal(reqBody, &input)
  if err != nil {
    sendError(w, err)
    return
  }

  if input.ExceptionMessage != "" {
    if input.Delay > 0 {
      time.Sleep(time.Duration(input.Delay) * time.Millisecond)
    }

    sendError(w, fmt.Errorf(input.ExceptionMessage))
    return
  }

  if input.StatusCode != nil {
    code := *input.StatusCode
    if code < 100 {
      sendError(w, fmt.Errorf("The value of 'statusCode' must be a number greater or equal to 100 and is '%d'.", code))
      return
    }

    if input.Delay > 0 {
      time.Sleep(time.Duration(input.Delay) * time.Millisecond)
    }

    w.WriteHeader(code)
    return
  }

  sendError(w, fmt.Errorf("Either 'statusCode' or 'exceptionMessage' must be informed."))
}
