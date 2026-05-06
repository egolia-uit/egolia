package app

import (
	"context"
	"fmt"
	"log/slog"

	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

type Tracer trace.Tracer

func NewTracer(tp trace.TracerProvider) Tracer {
	return tp.Tracer("course/app")
}

var ProvideTracer = NewTracer

type Cmd[C any] interface {
	Handle(ctx context.Context, cmd *C) error
}

type Query[Q any, R any] interface {
	Handle(ctx context.Context, query *Q) (R, error)
}

type CmdLog[C any] struct {
	logger      *slog.Logger
	handler     Cmd[C]
	handlerName string
}

func NewCmdLog[C any](
	handler Cmd[C],
	logger *slog.Logger,
) CmdLog[C] {
	return CmdLog[C]{
		logger:      logger,
		handler:     handler,
		handlerName: fmt.Sprintf("%T", handler),
	}
}

var _ Cmd[any] = (*CmdLog[any])(nil)

func (l CmdLog[C]) Handle(ctx context.Context, cmd *C) error {
	l.logger.InfoContext(
		ctx, "handling command",
		slog.String("handler", l.handlerName),
		slog.Any("command", cmd),
	)
	err := l.handler.Handle(ctx, cmd)
	if err != nil {
		l.logger.WarnContext(
			ctx, "failed to handle command",
			slog.String("handler", l.handlerName),
			slog.Any("error", err),
		)
		return err
	} else {
		l.logger.InfoContext(
			ctx, "handled command",
			slog.String("handler", l.handlerName),
		)
	}
	return nil
}

type QLog[Q any, R any] struct {
	logger      *slog.Logger
	handler     Query[Q, R]
	handlerName string
}

func NewQLog[Q any, R any](
	handler Query[Q, R],
	logger *slog.Logger,
) QLog[Q, R] {
	return QLog[Q, R]{
		logger:      logger,
		handler:     handler,
		handlerName: fmt.Sprintf("%T", handler),
	}
}

var _ Query[any, any] = (*QLog[any, any])(nil)

func (l QLog[Q, R]) Handle(ctx context.Context, query *Q) (R, error) {
	l.logger.InfoContext(
		ctx, "handling query",
		slog.String("handler", l.handlerName),
		slog.Any("query", query),
	)
	res, err := l.handler.Handle(ctx, query)
	if err != nil {
		l.logger.WarnContext(
			ctx, "failed to handle query",
			slog.String("handler", l.handlerName),
			slog.Any("error", err),
		)
		return res, err
	} else {
		l.logger.InfoContext(
			ctx, "handled query",
			slog.String("handler", l.handlerName),
			slog.Any("result", res),
		)
	}
	return res, nil
}

type CmdSpan[C any] struct {
	tracer      Tracer
	handler     Cmd[C]
	handlerName string
}

func NewCmdSpan[C any](
	handler Cmd[C],
	tracer Tracer,
) CmdSpan[C] {
	return CmdSpan[C]{
		handler:     handler,
		tracer:      tracer,
		handlerName: fmt.Sprintf("%T", handler),
	}
}

var _ Cmd[any] = (*CmdSpan[any])(nil)

func (s CmdSpan[Cmd]) Handle(ctx context.Context, cmd *Cmd) error {
	ctx, span := s.tracer.Start(ctx, s.handlerName)
	defer span.End()
	err := s.handler.Handle(ctx, cmd)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}
	return err
}

type QSpan[Q any, R any] struct {
	tracer      Tracer
	handler     Query[Q, R]
	handlerName string
}

func NewQSpan[Q any, R any](
	handler Query[Q, R],
	tracer Tracer,
) QSpan[Q, R] {
	return QSpan[Q, R]{
		handler:     handler,
		tracer:      tracer,
		handlerName: fmt.Sprintf("%T", handler),
	}
}

var _ Query[any, any] = (*QSpan[any, any])(nil)

func (s QSpan[Q, R]) Handle(ctx context.Context, query *Q) (R, error) {
	ctx, span := s.tracer.Start(ctx, s.handlerName)
	defer span.End()
	result, err := s.handler.Handle(ctx, query)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}
	return result, err
}
