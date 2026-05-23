package persistence

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/billing/config"
	slogGorm "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
	"gorm.io/plugin/opentelemetry/tracing"
)

func NewDB(
	ctx context.Context,
	cfg *config.Config,
	logger *slog.Logger,
) (*gorm.DB, func(), error) {
	gormLogger := slogGorm.New(
		slogGorm.WithHandler(logger.Handler()),
		slogGorm.WithTraceAll(),
	)
	db, err := gorm.Open(
		postgres.Open(cfg.Database.GetDSN()),
		&gorm.Config{
			Logger: gormLogger,
			NamingStrategy: schema.NamingStrategy{
				SingularTable: true,
			},
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
		if err := sqlDB.Close(); err != nil {
			slog.ErrorContext(ctx, "failed to close database connection", slog.Any("error", err))
		}
	}
	return db, cleanup, nil
}
