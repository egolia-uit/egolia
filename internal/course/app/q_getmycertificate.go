package app

import (
	"context"
	"log/slog"
)

type GetMyCertificates struct {
	UserID   string
	Paginate PaginationParams
	Order    *SearchCoursesOrder
}

type GetMyCertificatesQuery Query[GetMyCertificates, *Paginated[Certificate]]

type GetMyCertificatesHandler struct {
	readModel GetMyCertificatesReadModel
}

func NewGetMyCertificatesHandler(readModel GetMyCertificatesReadModel, logger *slog.Logger, tracer Tracer) GetMyCertificatesQuery {
	handler := &GetMyCertificatesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetMyCertificates, *Paginated[Certificate]] = (*GetMyCertificatesHandler)(nil)

func (h *GetMyCertificatesHandler) Handle(ctx context.Context, params *GetMyCertificates) (*Paginated[Certificate], error) {
	certs, err := h.readModel.GetMyCertificates(ctx, params.UserID, params.Paginate, params.Order)
	if err != nil {
		return nil, err
	}
	return certs, nil
}
