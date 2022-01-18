package server

import (
  "os"

  "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
  "gopkg.in/DataDog/dd-trace-go.v1/profiler"
  "github.com/DataDog/datadog-go/v5/statsd"
)

func DatadogStart() ([]string, error) {
  if os.Getenv("LAPPDOG_DEV") != "true" {
    tracer.Start(tracer.WithRuntimeMetrics())

    err := profiler.Start(
      profiler.WithProfileTypes(
        profiler.CPUProfile,
        profiler.HeapProfile,
        profiler.BlockProfile,
        profiler.MutexProfile,
        profiler.GoroutineProfile,
      ),
    )
    if err != nil {
      return nil, err;
    }

    _, err = statsd.New("")
    if err != nil {
      return nil, err
    }

    headers := [5]string{
      "x-datadog-trace-id",
      "x-datadog-parent-id",
      "x-datadog-origin",
      "x-datadog-sampling-priority",
      "x-datadog-sampled",
    }
    return headers[0:], nil
  }

  return make([]string, 0), nil
}

func DatadogStop() {
  tracer.Stop()
  profiler.Stop()
}
