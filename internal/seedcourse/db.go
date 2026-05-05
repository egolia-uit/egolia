package seedcourse

import (
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB(
	cfg *config.Config,
) (*gorm.DB, func(), error) {
	db, err := gorm.Open(postgres.Open(cfg.Database.GetDSN()))
	if err != nil {
		return nil, nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		err := sqlDB.Close()
		if err != nil {
			slog.Error("failed to close database connection", slog.Any("error", err))
		}
	}

	return db, cleanup, nil
}
