package http

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
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
		LessonType: course.LessonTypeVideo,
		CourseId:   new(vl.GetCourseID()),
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
		CourseId:   new(t.GetCourseID()),
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
