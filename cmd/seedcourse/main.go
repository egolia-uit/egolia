package main

import (
	"context"
	"flag"
	"log/slog"
	"os"

	"github.com/egolia-uit/egolia/internal/seedcourse"
	"github.com/egolia-uit/egolia/pkg/logging"
)

func main() {
	printSQL := flag.Bool("print-sql", false, "print SQL to stdout instead of seeding the database")
	flag.Parse()

	if err := logging.FirstStart("EGOLIA_COURSE_LOG_LEVEL"); err != nil {
		slog.Error("failed to set up logger", slog.Any("error", err))
		return
	}

	if *printSQL {
		seedcourse.NewSeedForSQL().PrintSQL(os.Stdout)
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
