package health

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/alexliesenfeld/health"
	"github.com/egolia-uit/egolia/internal/blog/config"
	commonconfig "github.com/egolia-uit/egolia/pkg/common/config"
	httpCheck "github.com/hellofresh/health-go/v5/checks/http"
)

type Health struct {
	*http.Server
}

func New(
	serverCfg *config.Server,
	authentikCfg *commonconfig.Authentik,
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

	httpPing := fmt.Sprintf("http://%s/blog/ping", serverCfg.Health.Address())

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
				Name: "authentik",
				Check: httpCheck.New(httpCheck.Config{
					URL: authentikCfg.HealthLiveURL(),
				}),
			},
		),
	)

	liveCheck := health.NewChecker()

	mux := http.NewServeMux()
	mux.Handle("/blog/health/startup", health.NewHandler(startupChecker))
	mux.Handle("/blog/health/ready", health.NewHandler(readyChecker))
	mux.Handle("/blog/health/live", health.NewHandler(liveCheck))
	return &Health{
		&http.Server{
			Handler: mux,
			Addr:    serverCfg.Health.Address(),
		},
	}
}

func (h *Health) Run() error {
	return h.ListenAndServe()
}
