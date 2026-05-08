package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/egolia-uit/egolia/pkg/logging"
)

func main() {
	if err := logging.FirstStart("EGOLIA_COURSE_LOG_LEVEL"); err != nil {
		slog.Error("failed to set up logger", slog.Any("error", err))
		return
	}
	ctx := context.Background()
	seed, cleanup, err := InitializeSeed(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "failed to initialize seed", slog.Any("error", err))
		if cleanup != nil {
			cleanup()
		}
		os.Exit(1)
		return
	}
	defer cleanup()
	if err := seed.Run(ctx); err != nil {
		slog.ErrorContext(ctx, "failed to run seed", slog.Any("error", err))
		os.Exit(2)
	}
}
