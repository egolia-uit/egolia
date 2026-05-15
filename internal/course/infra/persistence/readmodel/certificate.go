package readmodel

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
)

type CertificateReadRepo struct {
	db *gorm.DB
}

func NewCertificateReadRepo(db *gorm.DB) *CertificateReadRepo {
	return &CertificateReadRepo{db: db}
}

var _ app.GetMyCertificatesReadModel = (*CertificateReadRepo)(nil)

func (r *CertificateReadRepo) GetMyCertificates(ctx context.Context, userID string, paginate app.PaginationParams, order *app.SearchCoursesOrder) (*app.Paginated[app.Certificate], error) {
	q := r.db.WithContext(ctx).Model(new(model.Certificate)).
		Where("user_id = ?", userID)

	if order != nil && *order == app.SearchCoursesOrderDesc {
		q = q.Order("created_at DESC")
	} else {
		q = q.Order("created_at ASC")
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	offset := (paginate.Page - 1) * paginate.Limit
	var ms []model.Certificate
	if err := q.Offset(offset).Limit(paginate.Limit).Find(&ms).Error; err != nil {
		return nil, err
	}

	certs := make([]app.Certificate, 0, len(ms))
	for i := range ms {
		certs = append(certs, app.Certificate{
			ID:        ms[i].ID,
			CourseID:  ms[i].CourseID,
			UserID:    ms[i].UserID,
			CreatedAt: ms[i].CreatedAt,
		})
	}
	return &app.Paginated[app.Certificate]{
		Data:       certs,
		Pagination: buildPagination(paginate.Page, paginate.Limit, int(total)),
	}, nil
}
