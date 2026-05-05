package seedcourse

import (
	"fmt"
	"log/slog"
	"strings"

	commonconfig "github.com/egolia-uit/egolia/pkg/common/config"
	"github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

type Config struct {
	Database               commonconfig.SQL `json:"database"                  mapstructure:"database"                  validate:"required"     yaml:"database"`
	PublicObjectStorageURL string           `json:"public_object_storage_url" mapstructure:"public_object_storage_url" validate:"required,url" yaml:"public_object_storage_url"`
	ObjectStorageBucket    string           `json:"object_storage_bucket"     mapstructure:"object_storage_bucket"     validate:"required"     yaml:"object_storage_bucket"`
}

func NewConfig(
	validate *validator.Validate,
	viper *viper.Viper,
) (*Config, error) {
	viper.SetEnvPrefix("egolia_seed_course")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	commonconfig.SQLViperSetDefault(viper, "database")

	viper.AutomaticEnv()

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("cannot unmarshal config from env or config file: %w", err)
	}

	slog.Info("configuration", slog.Any("config", cfg))

	if err := validate.Struct(&cfg); err != nil {
		return nil, fmt.Errorf("Config validation failed: %w", err)
	}

	return &cfg, nil
}
