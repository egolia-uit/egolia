package http

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
	"github.com/oapi-codegen/runtime/types"
)

func lessonDetailToDTO(l app.Lesson) (*course.LessonDetail, error) {
	detail := course.LessonDetail{}
	var err error

	switch v := l.(type) {
	case *app.VideoLesson:
		err = detail.FromVideoLesson(videoLessonToDTO(v))
	case *app.TestLesson:
		err = detail.FromTestLesson(testLessonToDTO(v))
	}

	if err != nil {
		return nil, errs.NewInternalErr("failed to convert lesson detail to dto", err)
	}

	return &detail, nil
}

func videoLessonToDTO(vl *app.VideoLesson) course.VideoLesson {
	return course.VideoLesson{
		Id:         new(vl.GetID()),
		Title:      vl.GetTitle(),
		Order:      new(vl.GetOrder()),
		LessonType: course.LessonTypeVideo,
		SectionId:  new(vl.GetSectionID()),
		VideoUrl:   &vl.VideoURL,
		Duration:   int64(vl.Duration.Seconds()),
		VideoKey:   nil,
	}
}

func testLessonToDTO(t *app.TestLesson) course.TestLesson {
	questions := make([]course.TestQuestion, 0, len(t.Questions))
	for _, q := range t.Questions {
		questions = append(questions, testQuestionToDTO(&q))
	}
	return course.TestLesson{
		Id:         new(t.GetID()),
		Title:      t.GetTitle(),
		LessonType: course.LessonTypeTest,
		Type:       testLessonTypeToDTO(t.TestLessonType),
		SectionId:  new(t.GetSectionID()),
		Order:      new(t.GetOrder()),
		Questions:  questions,
	}
}

func testQuestionToDTO(q *app.TestQuestion) course.TestQuestion {
	answers := make([]course.TestAnswer, 0, len(q.Answers))
	for _, a := range q.Answers {
		answers = append(answers, testAnswerToDTO(&a))
	}
	return course.TestQuestion{
		Id:       &q.ID,
		Question: q.Question,
		Answers:  answers,
	}
}

func testAnswerToDTO(a *app.TestAnswer) course.TestAnswer {
	return course.TestAnswer{
		Id:        &a.ID,
		Content:   a.Content,
		IsCorrect: a.IsCorrect,
	}
}

func lessonTypeToDTO(lt app.LessonType) course.LessonType {
	switch lt {
	case app.LessonTypeVideo:
		return course.LessonTypeVideo
	case app.LessonTypeTest:
		return course.LessonTypeTest
	}
	panic("invalid lesson type")
}

func testLessonTypeToDTO(lt app.TestLessonType) course.TestLessonType {
	switch lt {
	case app.TestLessonTypeMultipleChoice:
		return course.TestLessonTypeMultipleChoice
	case app.TestLessonTypeSingleChoice:
		return course.TestLessonTypeSingleChoice
	}
	panic("invalid test lesson type")
}

func courseDetailToDTO(result *app.CourseDetail) *course.CourseDetail {
	return &course.CourseDetail{
		Id:               (*types.UUID)(&result.Course.ID),
		Title:            result.Course.Title,
		InstructorId:     &result.Course.InstructorID,
		OriginalCourseId: (*types.UUID)(&result.Course.OriginalCourseID),
		Price:            result.Course.Price,
		Overview:         &result.Course.Overview,
		Hidden:           &result.Course.Hidden,
		Status:           (*course.CourseStatus)(&result.Course.Status),
		Introduction: &course.CourseLandingPageIntroduction{
			VideoUrl: result.Course.Introduction.VideoUrl,
		},
		Sections: func() []course.CourseDetailSectionItem {
			items := make([]course.CourseDetailSectionItem, 0, len(result.Sections))
			for _, s := range result.Sections {
				items = append(items, course.CourseDetailSectionItem{
					Id:       (*types.UUID)(&s.ID),
					CourseId: (*types.UUID)(&s.CourseID),
					Title:    s.Title,
					Order:    &s.Order,
					Lessons: func() []course.Lesson {
						lessons := make([]course.Lesson, 0, len(s.Lessons))
						for _, l := range s.Lessons {
							lessons = append(lessons, course.Lesson{
								Id:         new(l.GetID()),
								Title:      l.GetTitle(),
								Order:      new(l.GetOrder()),
								LessonType: lessonTypeToDTO(l.GetLessonType()),
								SectionId:  new(l.GetSectionID()),
							})
						}
						return lessons
					}(),
				})
			}
			return items
		}(),
	}
}

func courseToDTO(c *app.Course) *course.Course {
	dto := &course.Course{
		Id:               (*types.UUID)(&c.ID),
		Title:            c.Title,
		InstructorId:     &c.InstructorID,
		OriginalCourseId: (*types.UUID)(&c.OriginalCourseID),
		Price:            c.Price,
		Overview:         &c.Overview,
		Hidden:           &c.Hidden,
		Status:           (*course.CourseStatus)(&c.Status),
		Introduction: &course.CourseLandingPageIntroduction{
			VideoUrl: c.Introduction.VideoUrl,
		},
	}
	return dto
}
