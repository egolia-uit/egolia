package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetMyCertificates struct {
	UserID   string
	Paginate PaginationParams
	Order    *SearchCoursesOrder
}

type GetMyCertificatesHandler struct {
	readModel GetMyCertificatesReadModel
}

func NewGetMyCertificatesHandler(readModel GetMyCertificatesReadModel) *GetMyCertificatesHandler {
	return &GetMyCertificatesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetMyCertificates, *Paginated[Certificate]] = (*GetMyCertificatesHandler)(nil)

func (h *GetMyCertificatesHandler) Handle(ctx context.Context, params *GetMyCertificates) (*Paginated[Certificate], error) {
	certs, err := h.readModel.GetMyCertificates(ctx, params.UserID, params.Paginate, params.Order)
	if err != nil {
		return nil, err
	}
	return certs, nil
}
