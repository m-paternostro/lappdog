package routes

import (
  "net/http"
  "strconv"
  "time"

  "lappdog/models"
)

type valueComputer func(int) uint64
type resultSetter func(*models.FibonacciResult)

func timeIt(compute valueComputer, size int) (uint64, int64) {
  timer := time.Since(time.Now())
  last := compute(size)
  duration := timer.Nanoseconds()

  return last, duration
}

func buildResult(compute valueComputer, size int) *models.FibonacciResult {
  last, duration := timeIt(compute, size)

  first := 0
  var result models.FibonacciResult
  result.First = &first
  result.Last = &last
  result.Duration = &duration

  return &result
}

func run(tasks chan bool, set resultSetter, compute valueComputer, size int) {
  task := make(chan *models.FibonacciResult, 1)
  go func() {
    task <- buildResult(compute, size)
  }()
  select {
    case result := <- task:
      set(result)

    case <- time.After(2 * time.Second):
      var messageResult models.FibonacciResult
      messageResult.Message = "Interrupted after 2s"
      set(&messageResult)
  }
  tasks <- true
}

func basic(size int) uint64 {
  var value uint64
  value = 0
  if size >= 2 {
    previous := value
    value = 1
    for i := 2; i < size; i++ {
      current := previous + value
      previous =  value
      value = current
    }
  }
  return value
}

func recursive(size int) uint64 {
  if size == 1 {
    return 0
  }

  if size == 2 {
    return 1
  }

  return recursive(size - 1) + recursive(size - 2)
}

func memoized(size int) uint64 {
  memo := make(map[int]uint64)
  var doit func(input int) uint64
  doit = func(input int) uint64 {
    if value, found := memo[input]; found {
      return value
    }

    if input == 1 {
      return 0
    }

    if input == 2 {
      return 1
    }

    result := doit(input - 1) + doit(input - 2)
    memo[input] = result
    return result
  }
  return doit(size)
}

func ComputeLastElement(w http.ResponseWriter, r *http.Request) {
  size, err := strconv.Atoi(r.URL.Query().Get("size"))
  if err != nil {
    sendError(w, err)
    return
  }
  if (size < 1) {
    size = 1
  }

  done := make(chan bool)
  tasks := make(chan bool, 3)
  go func() {
    counter := 0
    for {
      <- tasks
      counter++
      if counter == 3 {
        done <- true
        return
      }
    }
  }()

  var response models.FibonacciResponse
  run(tasks, func(r *models.FibonacciResult) { response.Basic = r }, basic, size)
  run(tasks, func(r *models.FibonacciResult) { response.Recursive = r }, recursive, size)
  run(tasks, func(r *models.FibonacciResult) { response.Memoized = r }, memoized, size)
  <- done

  sendJSON(w, response, http.StatusOK)
}
