package blog

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/blog/controller/health"
	"golang.org/x/sync/errgroup"
)

type Server struct {
	health *health.Health
}

func NewServer(
	health *health.Health,
	logger *slog.Logger,
) *Server {
	slog.SetDefault(logger)
	return &Server{
		health: health,
	}
}

func (s *Server) Run(ctx context.Context) error {
	g, ctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		go func() {
			<-ctx.Done()
			if err := s.health.Shutdown(context.Background()); err != nil {
				slog.ErrorContext(ctx, "failed to shutdown health server", slog.Any("error", err))
			}
		}()
		if err := s.health.Run(); err != nil {
			return fmt.Errorf("failed to run health server: %w", err)
		}
		return nil
	})

	return g.Wait()
}
