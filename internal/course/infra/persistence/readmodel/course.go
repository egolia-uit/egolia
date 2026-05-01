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
	db *gorm.DB
}

func NewCourseReadRepo(db *gorm.DB) *CourseReadRepo {
	return &CourseReadRepo{db: db}
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a356e13a4 (feat: read model golang lint fix)
var (
	_ app.GetCourseReadModel       = (*CourseReadRepo)(nil)
	_ app.SearchCoursesReadModel   = (*CourseReadRepo)(nil)
	_ app.GetCourseDetailReadModel = (*CourseReadRepo)(nil)
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 97d60f7c3 (feat: check backend)
	_ app.GetCoursesReadModel      = (*CourseReadRepo)(nil)
)
=======
var _ app.GetCourseReadModel = (*CourseReadRepo)(nil)
var _ app.SearchCoursesReadModel = (*CourseReadRepo)(nil)
var _ app.GetCourseDetailReadModel = (*CourseReadRepo)(nil)
>>>>>>> 65e45e788 (feat: read model in)
=======
)
>>>>>>> a356e13a4 (feat: read model golang lint fix)

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
<<<<<<< HEAD
<<<<<<< HEAD
	q := r.db.WithContext(ctx).Model(&model.ReadCourse{}) //nolint:exhaustruct
=======
	q := r.db.WithContext(ctx).Model(&model.ReadCourse{})
>>>>>>> 65e45e788 (feat: read model in)
=======
	q := r.db.WithContext(ctx).Model(&model.ReadCourse{}) //nolint:exhaustruct
>>>>>>> a356e13a4 (feat: read model golang lint fix)

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

	return &app.Paginated[app.Course]{
<<<<<<< HEAD
		Data: courses,
		Pagination: app.Pagination{
			Page:       params.Paginate.Page,
			Limit:      params.Paginate.Limit,
			Total:      int(total),
			TotalPages: totalPages,
<<<<<<< HEAD
			HasNext:    true,
			HasPrev:    true,
=======
>>>>>>> 65e45e788 (feat: read model in)
		},
=======
		Data:       courses,
		Pagination: buildPagination(params.Paginate.Page, params.Paginate.Limit, int(total)),
>>>>>>> 35b9526cd (chore:  lint for course)
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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 97d60f7c3 (feat: check backend)
// TODO: Recheck @bighousevn
=======
>>>>>>> 35b9526cd (chore:  lint for course)
func (r *CourseReadRepo) GetCourses(ctx context.Context, params *app.GetCourses) (*app.Paginated[app.Course], error) {
	q := r.db.WithContext(ctx).Model(&model.ReadCourse{}) //nolint:exhaustruct

	if params.Status != "" {
		q = q.Where("full_course_content->>'status' = ?", string(params.Status))
	}
	if params.Hidden {
		q = q.Where("(full_course_content->>'hidden')::boolean = true")
	}

	if params.Order == app.SearchCoursesOrderDesc {
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
		courses = append(courses, *toAppCourse(&ms[i]))
	}

	return &app.Paginated[app.Course]{
<<<<<<< HEAD
		Data: courses,
		Pagination: app.Pagination{
			Page:       params.Paginate.Page,
			Limit:      params.Paginate.Limit,
			Total:      int(total),
			TotalPages: totalPages,
<<<<<<< HEAD
			HasNext:    true,
			HasPrev:    true,
=======
>>>>>>> 97d60f7c3 (feat: check backend)
		},
=======
		Data:       courses,
		Pagination: buildPagination(params.Paginate.Page, params.Paginate.Limit, int(total)),
>>>>>>> 35b9526cd (chore:  lint for course)
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

func toAppCourse(m *model.ReadCourse) *app.Course {
	return &app.Course{
		ID:               m.CourseID,
		OriginalCourseID: uuid.Nil,
		Hidden:           false,
		Title:            m.FullCourseContent.Title,
		InstructorID:     m.FullCourseContent.InstructorID,
		Status:           app.CourseStatus(m.FullCourseContent.Status),
		Price:            int64(m.Price),
		Overview:         m.FullCourseContent.Overview,
=======
func toAppCourse(m *model.ReadCourse) *app.Course {
	return &app.Course{
<<<<<<< HEAD
		ID:           m.CourseID,
		Title:        m.FullCourseContent.Title,
		InstructorID: m.FullCourseContent.InstructorID,
		Status:       app.CourseStatus(m.FullCourseContent.Status),
		Price:        int64(m.Price),
		Overview:     m.FullCourseContent.Overview,
>>>>>>> 65e45e788 (feat: read model in)
=======
		ID:               m.CourseID,
		OriginalCourseID: uuid.Nil,
		Hidden:           false,
		Title:            m.FullCourseContent.Title,
		InstructorID:     m.FullCourseContent.InstructorID,
		Status:           app.CourseStatus(m.FullCourseContent.Status),
		Price:            int64(m.Price),
		Overview:         m.FullCourseContent.Overview,
>>>>>>> a356e13a4 (feat: read model golang lint fix)
		Introduction: app.CourseLandingPageIntroduction{
			VideoUrl: m.FullCourseContent.IntroVideoURL,
		},
	}
}

func toAppCourseDetail(m *model.ReadCourse) *app.CourseDetail {
	sections := make([]app.CourseDetailSectionItem, 0, len(m.FullCourseContent.Sections))
	for _, s := range m.FullCourseContent.Sections {
		sections = append(sections, toAppSectionItem(m.CourseID, s))
	}
	return &app.CourseDetail{
		Course:   *toAppCourse(m),
		Sections: sections,
	}
}

<<<<<<< HEAD
func toAppSectionItem(s model.ReadCourseSectionContent) app.CourseDetailSectionItem {
<<<<<<< HEAD
	return app.CourseDetailSectionItem{
<<<<<<< HEAD
		ID:       s.ID,
		CourseID: s.ID,
		Title:    s.Title,
		Order:    s.SortOrder,
		Lessons:  nil, // TODO: Get lessons of section
	}
	//		    ID       uuid.UUID
	//	    CourseID uuid.UUID
	//	    Title    string
	//	    Order    string
	//	    Lessons  []Lesson
	//
	//	return app.CourseDetailSectionItem{
	//		LessonBase: app.LessonBase{
	//			ID:         s.ID,
	//			SectionID:  uuid.Nil,
	//			Title:      s.Title,
	//			LessonType: "",
	//			Order:      s.SortOrder,
	//		},
	//		Sections: nil,
	//	}
=======
		LessonBase: app.LessonBase{
			ID:         s.ID,
			SectionID:  uuid.Nil,
			Title:      s.Title,
			LessonType: "",
			Order:      s.SortOrder,
		},
		Sections: nil,
	}
>>>>>>> 65e45e788 (feat: read model in)
=======
	return app.CourseDetailSectionItem{}
	// return app.CourseDetailSectionItem{
	// 	LessonBase: app.LessonBase{
	// 		ID:         s.ID,
	// 		SectionID:  uuid.Nil,
	// 		Title:      s.Title,
	// 		LessonType: "",
	// 		Order:      s.SortOrder,
	// 	},
	// 	Sections: nil,
	// }
>>>>>>> 97d60f7c3 (feat: check backend)
=======
func toAppSectionItem(courseID uuid.UUID, s model.ReadCourseSectionContent) app.CourseDetailSectionItem {
	lessons := make([]app.Lesson, 0, len(s.Lessons))
	for _, l := range s.Lessons {
		lessons = append(lessons, toAppLesson(s.ID, l))
	}
	return app.CourseDetailSectionItem{
		ID:       s.ID,
		CourseID: courseID,
		Title:    s.Title,
		Order:    s.SortOrder,
		Lessons:  lessons,
	}
}

func toAppLesson(sectionID uuid.UUID, l model.ReadCourseLessonContent) app.Lesson {
	base := app.LessonBase{
		ID:         l.ID,
		SectionID:  sectionID,
		Title:      l.Title,
		LessonType: app.LessonType(l.LessonType),
		Order:      l.SortOrder,
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
		testType := app.TestLessonType("")
		if l.TestType != nil {
			testType = app.TestLessonType(*l.TestType)
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
			LessonBase:     base,
			TestLessonType: testType,
			Questions:      questions,
		}
	}
	return nil
>>>>>>> 35b9526cd (chore:  lint for course)
}
