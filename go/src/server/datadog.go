package server

import (
  "fmt"
  "os"
  "strconv"

  "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
  "gopkg.in/DataDog/dd-trace-go.v1/profiler"
  "github.com/DataDog/datadog-go/v5/statsd"
)

func DatadogStart() ([]string, error) {
  if os.Getenv("LAPPDOG_DD_DISABLED") != "true" {
    agentHost := os.Getenv("DD_AGENT_HOST")
    if agentHost == "" {
      return nil, fmt.Errorf("The environment variable 'DD_AGENT_HOST' must be set.")
    }

    service := os.Getenv("DD_SERVICE")
    env := os.Getenv("DD_ENV")

    var traceOptions = []tracer.StartOption{
      tracer.WithService(service),
      tracer.WithEnv(env),
    }

    sampleRate := os.Getenv("DD_TRACE_SAMPLE_RATE")
    if rate, err := strconv.ParseFloat(sampleRate, 64); err == nil {
       rules := []tracer.SamplingRule{tracer.RateRule(rate)}
       traceOptions = append(traceOptions, tracer.WithSamplingRules(rules))
    }

    tracer.Start(traceOptions...)

    err := profiler.Start(
      profiler.WithService(service),
      profiler.WithEnv(env),
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

    statsdPort := os.Getenv("DD_DOGSTATSD_PORT")
    if statsdPort == "" {
      return nil, fmt.Errorf("The environment variable 'DD_DOGSTATSD_PORT' must be set.")
    }

    _, err = statsd.New(agentHost + ":" + statsdPort)
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
