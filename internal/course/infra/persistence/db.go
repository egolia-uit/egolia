package persistence

import (
	"context"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/course/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
	gormSlog "gorm.io/plugin/opentelemetry/logging/slog"
	"gorm.io/plugin/opentelemetry/tracing"
)

func NewDB(
	ctx context.Context,
	cfg *config.Config,
	logger *slog.Logger,
) (*gorm.DB, func(), error) {
	gormLgr := gormLogger.New(
		gormSlog.NewWriter(gormSlog.WithRecordStackTraceInSpan(true)),
		gormLogger.Config{
			SlowThreshold:        time.Millisecond,
			LogLevel:             gormLogger.Info,
			Colorful:             false,
			ParameterizedQueries: true,
		},
	)
	db, err := gorm.Open(
		postgres.Open(cfg.Database.GetDSN()),
		&gorm.Config{
			Logger: gormLgr,
		},
	)
	if err != nil {
		return nil, nil, err
	}
	if err := db.Use(tracing.NewPlugin()); err != nil {
		return nil, nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		err := sqlDB.Close()
		if err != nil {
			slog.ErrorContext(ctx, "failed to close database connection", slog.Any("error", err))
		}
	}

	return db, cleanup, nil
}
