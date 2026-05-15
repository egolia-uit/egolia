package readmodel

import (
	"context"
	"errors"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseReadRepo struct {
	db               *gorm.DB
	objectStorageSvc app.ObjectStorageSvc
}

func NewCourseReadRepo(db *gorm.DB, objectStorageSvc app.ObjectStorageSvc) *CourseReadRepo {
	return &CourseReadRepo{db: db, objectStorageSvc: objectStorageSvc}
}

var (
	_ app.GetCourseDetailReadModel = (*CourseReadRepo)(nil)
	_ app.GetCoursesReadModel      = (*CourseReadRepo)(nil)
)

// GetCourseByID implements [app.GetCoursesReadModel].
func (r *CourseReadRepo) GetCourseByID(ctx context.Context, query *app.GetCourseLandingPage) (*app.Course, error) {
	q := r.db.WithContext(ctx).Where("course_id = ?", query.CourseID)

	if query.Status != nil && *query.Status != "" {
		q = q.Where("full_course_content->>'status' = ?", string(*query.Status))
	}
	if query.Hidden != nil {
		q = q.Where("hidden = ?", *query.Hidden)
	}

	var m model.ReadCourse
	if err := q.First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(query.CourseID, err)
		}
		return nil, err
	}
	return r.toAppCourse(ctx, &m)
}

// GetMyBookmarkedCourses implements [app.GetCoursesReadModel].
func (r *CourseReadRepo) GetMyBookmarkedCourses(ctx context.Context, params *app.GetMyBookmarkedCourses) (*app.Paginated[app.Course], error) {
	q := r.db.WithContext(ctx).Model(new(model.ReadCourse)).
		Joins("INNER JOIN bookmarks ON bookmarks.course_id = read_courses.course_id").
		Where("bookmarks.user_id = ?", params.UserID)

	if params.Status != nil && *params.Status != "" {
		q = q.Where("full_course_content->>'status' = ?", string(*params.Status))
	}
	if params.Hidden != nil {
		q = q.Where("hidden = ?", *params.Hidden)
	}
	if params.Order != nil && *params.Order == app.SearchCoursesOrderDesc {
		q = q.Order("read_courses.published_at DESC")
	} else {
		q = q.Order("read_courses.published_at ASC")
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
		c, err := r.toAppCourse(ctx, &ms[i])
		if err != nil {
			return nil, err
		}
		courses = append(courses, *c)
	}
	return &app.Paginated[app.Course]{
		Data:       courses,
		Pagination: buildPagination(params.Paginate.Page, params.Paginate.Limit, int(total)),
	}, nil
}

// GetMyEnrolledCourses implements [app.GetCoursesReadModel].
func (r *CourseReadRepo) GetMyEnrolledCourses(ctx context.Context, params *app.GetMyEnrolledCourses) (*app.Paginated[app.Course], error) {
	q := r.db.WithContext(ctx).Model(new(model.ReadCourse)).
		Joins("INNER JOIN enrollments ON enrollments.course_id = read_courses.course_id").
		Where("enrollments.learner_id = ?", params.LearnerID)

	if params.Status != nil && *params.Status != "" {
		q = q.Where("full_course_content->>'status' = ?", string(*params.Status))
	}
	if params.Hidden != nil {
		q = q.Where("hidden = ?", *params.Hidden)
	}
	if params.Order != nil && *params.Order == app.SearchCoursesOrderDesc {
		q = q.Order("read_courses.published_at DESC")
	} else {
		q = q.Order("read_courses.published_at ASC")
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
		c, err := r.toAppCourse(ctx, &ms[i])
		if err != nil {
			return nil, err
		}
		courses = append(courses, *c)
	}
	return &app.Paginated[app.Course]{
		Data:       courses,
		Pagination: buildPagination(params.Paginate.Page, params.Paginate.Limit, int(total)),
	}, nil
}

func (r *CourseReadRepo) GetCourse(ctx context.Context, courseID uuid.UUID) (*app.Course, error) {
	id := courseID

	var m model.ReadCourse
	if err := r.db.WithContext(ctx).First(&m, "course_id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(id, err)
		}
		return nil, err
	}

	return r.toAppCourse(ctx, &m)
}

func (r *CourseReadRepo) GetCourseDetail(ctx context.Context, courseID uuid.UUID, deleted *bool) (*app.CourseDetail, error) {
	id := courseID

	var m model.ReadCourse
	if err := r.db.WithContext(ctx).First(&m, "course_id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(id, err)
		}
		return nil, err
	}

	return r.toAppCourseDetail(ctx, &m)
}

func (r *CourseReadRepo) GetCourseDetailForUpdate(ctx context.Context, originalCourseID uuid.UUID, _ *bool, status *app.CourseStatus) (*app.CourseDetail, error) {
	q := r.db.WithContext(ctx).Where("original_course_id = ?", originalCourseID)

	if status != nil && *status != "" {
		q = q.Where("full_course_content->>'status' = ?", string(*status))
	}

	var m model.ReadCourse
	if err := q.First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(originalCourseID, err)
		}
		return nil, err
	}
	return r.toAppCourseDetail(ctx, &m)
}

func (r *CourseReadRepo) GetCourses(ctx context.Context, params *app.GetCourses) (*app.Paginated[app.Course], error) {
	q := r.db.WithContext(ctx).Model(&model.ReadCourse{}) //nolint:exhaustruct

	if params.Status != nil && *params.Status != "" {
		q = q.Where("full_course_content->>'status' = ?", string(*params.Status))
	}
	if params.Hidden != nil {
		q = q.Where("hidden = ?", *params.Hidden)
	}
	if params.InstructorID != nil && *params.InstructorID != "" {
		q = q.Where("full_course_content->>'instructor_id' = ?", *params.InstructorID)
	}
	if params.Query != nil && *params.Query != "" {
		q = q.Where("title ILIKE ?", "%"+*params.Query+"%")
	}
	if params.HaveOriginalCourse != nil {
		if *params.HaveOriginalCourse {
			q = q.Where("original_course_id IS NOT NULL")
		} else {
			q = q.Where("original_course_id IS NULL")
		}
	}

	if params.Order != nil && *params.Order == app.SearchCoursesOrderDesc {
		q = q.Order("published_at DESC")
	} else {
		q = q.Order("published_at ASC")
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
		c, err := r.toAppCourse(ctx, &ms[i])
		if err != nil {
			return nil, err
		}
		courses = append(courses, *c)
	}

	return &app.Paginated[app.Course]{
		Data:       courses,
		Pagination: buildPagination(params.Paginate.Page, params.Paginate.Limit, int(total)),
	}, nil
}

func buildPagination(page, limit, total int) app.Pagination {
	totalPages := 0
	if limit > 0 {
		totalPages = total / limit
		if total%limit > 0 {
			totalPages++
		}
	}
	return app.Pagination{ //nolint:exhaustruct
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}

func (r *CourseReadRepo) toAppCourse(_ context.Context, m *model.ReadCourse) (*app.Course, error) {
	// NOTE: Will uncomment out?
	// var introVideoURL string
	// if key := m.FullCourseContent.IntroVideoURL; key != "" {
	// 	url, err := r.objectStorageSvc.VideoKeyToURL(ctx, key)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	introVideoURL = url
	// }
	var originalCourseID uuid.UUID
	if m.OriginalCourseID != nil {
		originalCourseID = *m.OriginalCourseID
	}
	return &app.Course{
		ID:               m.CourseID,
		OriginalCourseID: originalCourseID,
		Hidden:           m.Hidden,
		Title:            m.FullCourseContent.Title,
		InstructorID:     m.FullCourseContent.InstructorID,
		Status:           app.CourseStatus(m.FullCourseContent.Status),
		Price:            int64(m.Price),
		Overview:         m.FullCourseContent.Overview,
		// TODO: Deal with key and URL
		IntroductionVideoKey: new(""),
		IntroductionVideoURL: new(""),
		// Introduction: app.CourseLandingPageIntroduction{
		// 	VideoUrl: introVideoURL,
		// },
	}, nil
}

func (r *CourseReadRepo) toAppCourseDetail(ctx context.Context, m *model.ReadCourse) (*app.CourseDetail, error) {
	c, err := r.toAppCourse(ctx, m)
	if err != nil {
		return nil, err
	}
	sections := make([]app.CourseDetailSectionItem, 0, len(m.FullCourseContent.Sections))
	for i := range m.FullCourseContent.Sections {
		sections = append(sections, toAppSectionItem(m.CourseID, &m.FullCourseContent.Sections[i]))
	}
	return &app.CourseDetail{
		Course:   *c,
		Sections: sections,
	}, nil
}

func toAppSectionItem(courseID uuid.UUID, s *model.ReadCourseSectionContent) app.CourseDetailSectionItem {
	lessons := make([]app.Lesson, 0, len(s.Lessons))
	for i := range s.Lessons {
		lessons = append(lessons, toAppLesson(&s.Lessons[i]))
	}
	return app.CourseDetailSectionItem{
		ID:       s.ID,
		CourseID: courseID,
		Title:    s.Title,
		Lessons:  lessons,
	}
}

func toAppLesson(l *model.ReadCourseLessonContent) app.Lesson {
	base := app.LessonBase{
		ID:         l.ID,
		Title:      l.Title,
		LessonType: app.LessonType(l.LessonType),
	}
	switch app.LessonType(l.LessonType) {
	case app.LessonTypeVideo:
		videoURL := ""
		if l.VideoKey != nil {
			videoURL = *l.VideoKey
		}
		dur := time.Duration(0)
		if l.Duration != nil {
			dur = time.Duration(*l.Duration) * time.Second
		}
		return &app.VideoLesson{
			LessonBase: base,
			VideoURL:   videoURL,
			Duration:   dur,
		}
	case app.LessonTypeTest:
		var questionType app.QuestionType
		if l.QuestionType != nil {
			questionType = app.QuestionType(*l.QuestionType)
		}
		questions := make([]app.TestQuestion, 0, len(l.Questions))
		for _, q := range l.Questions {
			answers := make([]app.TestAnswer, 0, len(q.Answers))
			for _, a := range q.Answers {
				answers = append(answers, app.TestAnswer{
					ID:        a.ID,
					Content:   a.Answer,
					IsCorrect: a.IsCorrect,
				})
			}
			questions = append(questions, app.TestQuestion{
				ID:       q.ID,
				Question: q.QuestionText,
				Answers:  answers,
			})
		}
		return &app.TestLesson{
			LessonBase:   base,
			QuestionType: questionType,
			Questions:    questions,
		}
	}
	return nil
}

func (r *CourseReadRepo) GetMyCourses(ctx context.Context, params *app.GetMyCourses) (*app.Paginated[app.Course], error) {
	instructorID := params.UserID
	status := app.CourseStatusApproved
	return r.GetCourses(ctx, &app.GetCourses{
		InstructorID:       &instructorID,
		Status:             &status,
		Hidden:             params.Hidden,
		Paginate:           params.Paginate,
		Order:              params.Order,
		Query:              nil,
		HaveOriginalCourse: nil,
	})
}
