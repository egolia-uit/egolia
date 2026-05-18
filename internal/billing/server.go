package billing

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/billing/controller/health"
	"github.com/egolia-uit/egolia/internal/billing/controller/http"
	"golang.org/x/sync/errgroup"
)

type Server struct {
	http   *http.HTTP
	health *health.Health
	logger *slog.Logger
}

func NewServer(
	http *http.HTTP,
	health *health.Health,
	logger *slog.Logger,
) *Server {
	slog.SetDefault(logger)
	return &Server{
		http:   http,
		health: health,
		logger: logger,
	}
}

func (s *Server) Run(ctx context.Context) error {
	g, ctx := errgroup.WithContext(ctx)

	httpShutdownTimeout := 10 * time.Second
	healthShutdownTimeout := 5 * time.Second

	g.Go(func() error {
		go func() {
			<-ctx.Done()
			shutdownCtx, cancel := context.WithTimeout(context.Background(), httpShutdownTimeout)
			defer cancel()
			if err := s.http.Shutdown(shutdownCtx); err != nil {
				s.logger.ErrorContext(ctx, "failed to shutdown http server", slog.Any("error", err))
			}
		}()
		if err := s.http.Run(); err != nil {
			return fmt.Errorf("failed to run http server: %w", err)
		}
		return nil
	})

	g.Go(func() error {
		go func() {
			<-ctx.Done()
			shutdownCtx, cancel := context.WithTimeout(context.Background(), healthShutdownTimeout)
			defer cancel()
			if err := s.health.Shutdown(shutdownCtx); err != nil {
				s.logger.ErrorContext(ctx, "failed to shutdown health server", slog.Any("error", err))
			}
		}()
		if err := s.health.Run(); err != nil {
			return fmt.Errorf("failed to run health server: %w", err)
		}
		return nil
	})

	return g.Wait()
}
