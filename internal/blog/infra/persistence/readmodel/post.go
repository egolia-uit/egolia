package readmodel

import (
	"context"
	"math"

	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostReadRepo struct {
	db *gorm.DB
}

func NewPostReadRepo(db *gorm.DB) *PostReadRepo {
	return &PostReadRepo{db: db}
}

var (
	_ app.SearchPostsReadModel = (*PostReadRepo)(nil)
	_ app.GetPostByIdReadModel = (*PostReadRepo)(nil)
)

func (r *PostReadRepo) SearchPosts(ctx context.Context, params *app.SearchPostsParams) (*app.Paginated[app.Post], error) {
	db := r.db.WithContext(ctx).Model(new(model.Post))

	if params.Query != nil && *params.Query != "" {
		db = db.Where("title ILIKE ? OR content ILIKE ?", "%"+*params.Query+"%", "%"+*params.Query+"%")
	}
	if params.Tag != nil && *params.Tag != "" {
		db = db.Where("? = ANY(tags)", *params.Tag)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	if params.Order != nil && *params.Order == app.SearchPostsOrderAsc {
		db = db.Order("created_at ASC")
	} else {
		db = db.Order("created_at DESC")
	}

	limit := params.Paginate.Limit
	if limit <= 0 {
		limit = 20
	}
	page := params.Paginate.Page
	if page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit
	db = db.Offset(offset).Limit(limit)

	var ms []model.Post
	if err := db.Find(&ms).Error; err != nil {
		return nil, err
	}

	data := make([]app.Post, len(ms))
	for i, m := range ms {
		data[i] = app.Post{
			ID:           m.ID,
			AuthorID:     m.AuthorID,
			Title:        m.Title,
			Content:      m.Content,
			Tags:         []string(m.Tags),
			CommentCount: m.CommentCount,
			CreatedAt:    m.CreatedAt,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &app.Paginated[app.Post]{
		Data: data,
		Pagination: app.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      int(total),
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}, nil
}

func (r *PostReadRepo) GetPostById(ctx context.Context, id uuid.UUID) (*app.Post, error) {
	var m model.Post
	if err := r.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &app.Post{
		ID:           m.ID,
		AuthorID:     m.AuthorID,
		Title:        m.Title,
		Content:      m.Content,
		Tags:         []string(m.Tags),
		CommentCount: m.CommentCount,
		CreatedAt:    m.CreatedAt,
	}, nil
}
