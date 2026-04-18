package config

import (
	"fmt"
	"log/slog"
	"strings"

	commonconfig "github.com/egolia-uit/egolia/pkg/common/config"
	"github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

type Server struct {
	URL    string                     `json:"url"    mapstructure:"url"    validate:"required,url" yaml:"url"`
	HTTP   commonconfig.ServerAddress `json:"http"   mapstructure:"http"   validate:"required"     yaml:"http"`
	GRPC   commonconfig.ServerAddress `json:"grpc"   mapstructure:"grpc"   validate:"required"     yaml:"grpc"`
	Health commonconfig.ServerAddress `json:"health" mapstructure:"health" validate:"required"     yaml:"health"`
}

type Services struct{}

type Config struct {
	General   commonconfig.General   `json:"general"   mapstructure:"general"   validate:"omitempty" yaml:"general"`
	Log       commonconfig.Log       `json:"log"       mapstructure:"log"       validate:"omitempty" yaml:"log"`
	Server    Server                 `json:"server"    mapstructure:"server"    validate:"required"  yaml:"server"`
	Database  commonconfig.SQL       `json:"database"  mapstructure:"database"  validate:"required"  yaml:"database"`
	Authentik commonconfig.Authentik `json:"authentik" mapstructure:"authentik" validate:"required"  yaml:"authentik"`
	S3        commonconfig.S3        `json:"s3"        mapstructure:"s3"        validate:"required"  yaml:"s3"`
	Services  Services               `json:"services"  mapstructure:"services"  validate:"required"  yaml:"services"`
}

func New(
	validate *validator.Validate,
	viper *viper.Viper,
) (*Config, error) {
	viper.SetEnvPrefix("egolia_course")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	viper.SetConfigName("course.egolia.config")
	viper.AddConfigPath(".")

	commonconfig.ServerAddressViperSetDefault(viper, "server.http", 8081)
	commonconfig.ServerAddressViperSetDefault(viper, "server.grpc", 18081)
	commonconfig.ServerAddressViperSetDefault(viper, "server.health", 28081)
	commonconfig.LogViperSetDefault(viper, "log")
	commonconfig.SQLViperSetDefault(viper, "database")
	commonconfig.GeneralViperSetDefault(viper, "general")
	commonconfig.AuthentikViperSetDefault(viper, "authentik")

	viper.AutomaticEnv()
	if err := viper.ReadInConfig(); err == nil {
		slog.Info("configuration loaded", slog.String("file", viper.ConfigFileUsed()))
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("cannot unmarshal config from env or config file: %w", err)
	}

	if err := cfg.Authentik.Init(); err != nil {
		return nil, fmt.Errorf("failed to initialize Authentik config: %w", err)
	}

	slog.Info("configuration", slog.Any("config", cfg))

	if err := validate.Struct(&cfg); err != nil {
		return nil, fmt.Errorf("Config validation failed: %w", err)
	}

	return &cfg, nil
}

var Provide = New
