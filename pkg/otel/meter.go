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
		ctx := context.Background()
		if timeoutCtx, err := context.WithTimeout(ctx, 5*time.Second); err == nil {
			slog.WarnContext(
				ctx,
				"cannot create timeout context for MeterProvider shutdown, using background context instead",
				slog.Any("error", err),
			)
			ctx = timeoutCtx
		}
		if err := mp.Shutdown(ctx); err != nil {
			slog.ErrorContext(
				ctx,
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
