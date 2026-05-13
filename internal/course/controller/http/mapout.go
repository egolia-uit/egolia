package http

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
	"github.com/google/uuid"
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
	id := (types.UUID)(vl.GetID())
	return course.VideoLesson{
		Id:               &id,
		Title:            vl.GetTitle(),
		LessonType:       course.VideoLessonLessonTypeVideo,
		VideoUrl:         &vl.VideoURL,
		Duration:         int64(vl.Duration.Seconds()),
		VideoKey:         nil,
		OriginalLessonID: nil,
	}
}

func testLessonToDTO(t *app.TestLesson) course.TestLesson {
	id := (types.UUID)(t.GetID())
	questions := make([]course.TestQuestion, 0, len(t.Questions))
	for _, q := range t.Questions {
		questions = append(questions, testQuestionToDTO(&q))
	}
	return course.TestLesson{
		Id:               &id,
		Title:            t.GetTitle(),
		LessonType:       course.TestLessonLessonTypeTest,
		QuestionType:     questionTypeToDTO(t.QuestionType),
		Questions:        questions,
		OriginalLessonID: nil,
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

func questionTypeToDTO(qt app.QuestionType) course.QuestionType {
	switch qt {
	case app.QuestionTypeMultipleChoice:
		return course.QuestionTypeMultipleChoice
	case app.QuestionTypeSingleChoice:
		return course.QuestionTypeSingleChoice
	}
	panic("invalid question type")
}

func courseDetailToDTO(result *app.CourseDetail) *course.CourseDetail {
	return &course.CourseDetail{
		Id:                   (*types.UUID)(&result.Course.ID),
		Title:                result.Course.Title,
		InstructorId:         &result.Course.InstructorID,
		OriginalCourseId:     (*types.UUID)(&result.Course.OriginalCourseID),
		Price:                result.Course.Price,
		Overview:             &result.Course.Overview,
		Hidden:               &result.Course.Hidden,
		Status:               (*course.CourseStatus)(&result.Course.Status),
		IntroductionVideoUrl: result.Course.IntroductionVideoURL,
		IntroductionVideoKey: nil,
		Sections:             sectionItemsToDTO(result.Sections),
	}
}

func sectionItemsToDTO(sections []app.CourseDetailSectionItem) []course.CourseDetailSectionItem {
	items := make([]course.CourseDetailSectionItem, 0, len(sections))
	for _, s := range sections {
		items = append(items, course.CourseDetailSectionItem{
			Id:                (*types.UUID)(&s.ID),
			Title:             s.Title,
			Lessons:           lessonsToDTO(s.Lessons),
			OriginalSectionID: nil,
		})
	}
	return items
}

func lessonsToDTO(lessons []app.Lesson) []course.Lesson {
	out := make([]course.Lesson, 0, len(lessons))
	for _, l := range lessons {
		id := (types.UUID)(l.GetID())
		out = append(out, course.Lesson{
			Id:               &id,
			Title:            l.GetTitle(),
			OriginalLessonID: nil,
		})
	}
	return out
}

func courseToDTO(c *app.Course) *course.Course {
	dto := &course.Course{
		Id:                   (*types.UUID)(&c.ID),
		Title:                c.Title,
		InstructorId:         &c.InstructorID,
		OriginalCourseId:     (*types.UUID)(&c.OriginalCourseID),
		Price:                c.Price,
		Overview:             &c.Overview,
		Hidden:               &c.Hidden,
		Status:               (*course.CourseStatus)(&c.Status),
		IntroductionVideoUrl: c.IntroductionVideoURL,
		IntroductionVideoKey: nil,
	}
	if c.OriginalCourseID != uuid.Nil {
		dto.OriginalCourseId = &c.OriginalCourseID
	}
	return dto
}
