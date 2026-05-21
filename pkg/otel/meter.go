package otel

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.opentelemetry.io/contrib/exporters/autoexport"
	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel/metric"
	sdk "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
)

func NewMeterProvider(
	ctx context.Context,
	res *resource.Resource,
) (metric.MeterProvider, func(), error) {
	reader, err := autoexport.NewMetricReader(ctx)
	if err != nil {
		return nil, nil, err
	}
	mp := sdk.NewMeterProvider(
		sdk.WithResource(res),
		sdk.WithReader(reader),
	)

	cleanup := func() {
		timeoutCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := mp.Shutdown(timeoutCtx); err != nil {
			slog.ErrorContext(
				timeoutCtx,
				"Error shutting down MeterProvider",
				slog.Any("error", err),
			)
		}
	}

	if err := runtime.Start(runtime.WithMeterProvider(mp)); err != nil {
		cleanup()
		return nil, nil, fmt.Errorf("failed to start runtime instrumentation: %w", err)
	}

	return mp, cleanup, nil
}

var ProvideMeterProvider = NewMeterProvider
