package course

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/course/controller/grpc"
	"github.com/egolia-uit/egolia/internal/course/controller/health"
	"github.com/egolia-uit/egolia/internal/course/controller/http"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence"
	"github.com/egolia-uit/egolia/pkg/otel"
	"golang.org/x/sync/errgroup"
)

type Server struct {
	http   *http.HTTP
	grpc   *grpc.GRPC
	health *health.Health
	pg     *persistence.PG
	logger *slog.Logger
}

func NewServer(
	http *http.HTTP,
	grpc *grpc.GRPC,
	health *health.Health,
	pg *persistence.PG,
	globalOtel otel.Global,
	logger *slog.Logger,
) *Server {
	slog.SetDefault(logger)
	return &Server{
		http:   http,
		grpc:   grpc,
		health: health,
		pg:     pg,
		logger: logger,
	}
}

func (s *Server) Run(ctx context.Context) error {
	g, ctx := errgroup.WithContext(ctx)

	httpShutdownTimeout := 10 * time.Second
	grpcShutdownTimeout := 10 * time.Second
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
			done := make(chan struct{})
			go func() {
				s.grpc.GracefulStop()
				close(done)
			}()
			select {
			case <-done:
			case <-time.After(grpcShutdownTimeout):
				s.logger.WarnContext(ctx, "grpc shutdown timed out")
				s.grpc.Stop()
			}
		}()
		if err := s.grpc.Run(); err != nil {
			return fmt.Errorf("failed to run grpc server: %w", err)
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

	g.Go(func() error {
		if err := s.pg.RunMigrations(); err != nil {
			return fmt.Errorf("failed to run database migrations: %w", err)
		}
		return nil
	})

	return g.Wait()
}
