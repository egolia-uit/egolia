package course

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/controller/grpc"
	"github.com/egolia-uit/egolia/internal/course/controller/health"
	"github.com/egolia-uit/egolia/internal/course/controller/http"
	"github.com/egolia-uit/egolia/pkg/otel"
	"golang.org/x/sync/errgroup"
)

type Server struct {
	http   *http.HTTP
	grpc   *grpc.GRPC
	health *health.Health
}

func NewServer(
	http *http.HTTP,
	grpc *grpc.GRPC,
	health *health.Health,
	globalOtel otel.Global,
	logger *slog.Logger,
) *Server {
	slog.SetDefault(logger)
	return &Server{
		http:   http,
		grpc:   grpc,
		health: health,
	}
}

func (s *Server) Run(ctx context.Context) error {
	// if err := s.persistence.RunMigrations(ctx); err != nil {
	// 	return fmt.Errorf("failed to run migrations: %w", err)
	// }

	g, ctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		go func() {
			<-ctx.Done()
			if err := s.http.Shutdown(context.Background()); err != nil {
				slog.ErrorContext(ctx, "failed to shutdown http server", slog.Any("error", err))
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
			s.grpc.Stop()
		}()
		if err := s.grpc.Run(); err != nil {
			return fmt.Errorf("failed to run grpc server: %w", err)
		}
		return nil
	})

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
