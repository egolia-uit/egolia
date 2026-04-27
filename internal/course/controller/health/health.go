package health

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/alexliesenfeld/health"
	"github.com/egolia-uit/egolia/internal/course/config"
	httpCheck "github.com/hellofresh/health-go/v5/checks/http"
)

type Health struct {
	*http.Server
}

func New(
	serverCfg *config.Server,
) *Health {
	startupChecker := health.NewChecker(
		health.WithCheck(
			health.Check{
				Name: "databaseMigration",
				Check: func(ctx context.Context) error {
					return nil
				},
			},
		),
	)

	httpPing := fmt.Sprintf("http://%s/course/ping", serverCfg.Health.Address())
	grpcAddr := serverCfg.GRPC.Address()

	readyChecker := health.NewChecker(
		health.WithPeriodicCheck(
			15*time.Second,
			3*time.Second,
			health.Check{
				Name: "databaseConnection",
				Check: func(ctx context.Context) error {
					return nil
				},
			},
		),

		health.WithPeriodicCheck(
			15*time.Second,
			3*time.Second,
			health.Check{
				Name: "http",
				Check: httpCheck.New(httpCheck.Config{
					URL: httpPing,
				}),
			},
		),

		health.WithPeriodicCheck(
			15*time.Second,
			3*time.Second,
			health.Check{
				Name: "grpc",
				Check: func(ctx context.Context) error {
					conn, err := net.DialTimeout("tcp", grpcAddr, 5*time.Second)
					if err != nil {
						return fmt.Errorf("failed to connect to gRPC server: %w", err)
					}
					if err := conn.Close(); err != nil {
						return fmt.Errorf("failed to close gRPC connection: %w", err)
					}
					return nil
				},
			},
		),
	)

	liveCheck := health.NewChecker()

	mux := http.NewServeMux()
	mux.Handle("/course/health/startup", health.NewHandler(startupChecker))
	mux.Handle("/course/health/ready", health.NewHandler(readyChecker))
	mux.Handle("/course/health/live", health.NewHandler(liveCheck))
	return &Health{
		&http.Server{
			Handler: mux,
			Addr:    serverCfg.Health.Address(),
		},
	}
}

var Provide = New

func (h *Health) Run() error {
	return h.ListenAndServe()
}
