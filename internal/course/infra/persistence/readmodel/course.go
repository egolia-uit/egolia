package readmodel

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseReadRepo struct {
	db *gorm.DB
}

func NewCourseReadRepo(db *gorm.DB) *CourseReadRepo {
	return &CourseReadRepo{db: db}
}

var _ app.GetCourseReadModel = (*CourseReadRepo)(nil)
var _ app.SearchCoursesReadModel = (*CourseReadRepo)(nil)
var _ app.GetCourseDetailReadModel = (*CourseReadRepo)(nil)

func (r *CourseReadRepo) GetCourse(ctx context.Context, courseID string) (*app.Course, error) {
	id, err := uuid.Parse(courseID)
	if err != nil {
		return nil, errs.NewCourseNotFound(uuid.Nil, err)
	}

	var m model.ReadCourse
	if err := r.db.WithContext(ctx).First(&m, "course_id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(id, err)
		}
		return nil, err
	}

	return toAppCourse(&m), nil
}

func (r *CourseReadRepo) SearchCourses(ctx context.Context, params *app.SearchCourses) (*app.Paginated[app.Course], error) {
	q := r.db.WithContext(ctx).Model(&model.ReadCourse{})

	if params.Query != "" {
		q = q.Where("title ILIKE ?", "%"+params.Query+"%")
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	offset := (params.Paginate.Page - 1) * params.Paginate.Limit
	var ms []model.ReadCourse
	if err := q.Offset(offset).Limit(params.Paginate.Limit).Find(&ms).Error; err != nil {
		return nil, err
	}

	courses := make([]app.Course, 0, len(ms))
	for i := range ms {
		courses = append(courses, *toAppCourse(&ms[i]))
	}

	totalPages := int(total) / params.Paginate.Limit
	if params.Paginate.Limit > 0 && int(total)%params.Paginate.Limit > 0 {
		totalPages++
	}

	return &app.Paginated[app.Course]{
		Data: courses,
		Pagination: app.Pagination{
			Page:       params.Paginate.Page,
			Limit:      params.Paginate.Limit,
			Total:      int(total),
			TotalPages: totalPages,
		},
	}, nil
}

func (r *CourseReadRepo) GetCourseDetail(ctx context.Context, courseID string) (*app.CourseDetail, error) {
	id, err := uuid.Parse(courseID)
	if err != nil {
		return nil, errs.NewCourseNotFound(uuid.Nil, err)
	}

	var m model.ReadCourse
	if err := r.db.WithContext(ctx).First(&m, "course_id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(id, err)
		}
		return nil, err
	}

	return toAppCourseDetail(&m), nil
}

func toAppCourse(m *model.ReadCourse) *app.Course {
	return &app.Course{
		ID:           m.CourseID,
		Title:        m.FullCourseContent.Title,
		InstructorID: m.FullCourseContent.InstructorID,
		Status:       app.CourseStatus(m.FullCourseContent.Status),
		Price:        int64(m.Price),
		Overview:     m.FullCourseContent.Overview,
		Introduction: app.CourseLandingPageIntroduction{
			VideoUrl: m.FullCourseContent.IntroVideoURL,
		},
	}
}

func toAppCourseDetail(m *model.ReadCourse) *app.CourseDetail {
	sections := make([]app.CourseDetailSectionItem, 0, len(m.FullCourseContent.Sections))
	for _, s := range m.FullCourseContent.Sections {
		sections = append(sections, toAppSectionItem(s))
	}
	return &app.CourseDetail{
		Course:   *toAppCourse(m),
		Sections: sections,
	}
}

func toAppSectionItem(s model.ReadCourseSectionContent) app.CourseDetailSectionItem {
	return app.CourseDetailSectionItem{
		LessonBase: app.LessonBase{
			ID:    s.ID,
			Title: s.Title,
			Order: s.SortOrder,
		},
	}
}
