package blog

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/blog/controller/health"
	"golang.org/x/sync/errgroup"
)

type Server struct {
	health *health.Health
	logger *slog.Logger
}

func NewServer(
	health *health.Health,
	logger *slog.Logger,
) *Server {
	slog.SetDefault(logger)
	return &Server{
		health: health,
		logger: logger,
	}
}

func (s *Server) Run(ctx context.Context) error {
	g, ctx := errgroup.WithContext(ctx)
	healthShutdownTimeout := 5 * time.Second

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
