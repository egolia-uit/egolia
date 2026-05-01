package course

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/controller/grpc"
	"github.com/egolia-uit/egolia/internal/course/controller/health"
	"github.com/egolia-uit/egolia/internal/course/controller/http"
<<<<<<< HEAD
<<<<<<< HEAD
	"github.com/egolia-uit/egolia/internal/course/infra/persistence"
=======
>>>>>>> 97d60f7c3 (feat: check backend)
=======
	"github.com/egolia-uit/egolia/internal/course/infra/persistence"
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
	"github.com/egolia-uit/egolia/pkg/otel"
	"golang.org/x/sync/errgroup"
)

type Server struct {
	http   *http.HTTP
	grpc   *grpc.GRPC
	health *health.Health
<<<<<<< HEAD
<<<<<<< HEAD
	pg     *persistence.PG
=======
>>>>>>> 97d60f7c3 (feat: check backend)
=======
	pg     *persistence.PG
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
}

func NewServer(
	http *http.HTTP,
	grpc *grpc.GRPC,
	health *health.Health,
<<<<<<< HEAD
<<<<<<< HEAD
	pg *persistence.PG,
=======
>>>>>>> 97d60f7c3 (feat: check backend)
=======
	pg *persistence.PG,
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
	globalOtel otel.Global,
	logger *slog.Logger,
) *Server {
	slog.SetDefault(logger)
	return &Server{
		http:   http,
		grpc:   grpc,
		health: health,
<<<<<<< HEAD
<<<<<<< HEAD
		pg:     pg,
=======
>>>>>>> 97d60f7c3 (feat: check backend)
=======
		pg:     pg,
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
	}
}

func (s *Server) Run(ctx context.Context) error {
<<<<<<< HEAD
<<<<<<< HEAD
=======
	// if err := s.persistence.RunMigrations(ctx); err != nil {
	// 	return fmt.Errorf("failed to run migrations: %w", err)
	// }

>>>>>>> 97d60f7c3 (feat: check backend)
=======
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
	g.Go(func() error {
		if err := s.pg.RunMigrations(); err != nil {
			return fmt.Errorf("failed to run database migrations: %w", err)
		}
		return nil
	})

<<<<<<< HEAD
=======
>>>>>>> 97d60f7c3 (feat: check backend)
=======
>>>>>>> 292ce1154 (feat(course): gorm slog, and auto migrate)
	return g.Wait()
}
