package http

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
)

func lessonDetailToDTO(appLesson app.Lesson) (*course.LessonDetail, error) {
	detail := course.LessonDetail{}
	var err error

	switch v := appLesson.(type) {
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

func videoLessonToDTO(appLesson *app.VideoLesson) course.VideoLesson {
	return course.VideoLesson{
		Id:         new(appLesson.GetID()),
		Title:      appLesson.GetTitle(),
		LessonType: course.VideoLessonLessonTypeVideo,
		CourseId:   new(appLesson.GetCourseID()),
		VideoUrl:   &appLesson.VideoURL,
		Duration:   int64(appLesson.Duration.Seconds()),
		VideoKey:   nil,
	}
}

func testLessonToDTO(appTest *app.TestLesson) course.TestLesson {
	questions := make([]course.TestQuestion, 0, len(appTest.Questions))
	for _, q := range appTest.Questions {
		questions = append(questions, testQuestionToDTO(&q))
	}
	return course.TestLesson{
		Id:         new(appTest.GetID()),
		Title:      appTest.GetTitle(),
		LessonType: course.TestLessonLessonTypeTest,
		Type:       testLessonTypeToDTO(appTest.TestLessonType),
		CourseId:   new(appTest.GetCourseID()),
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

func testAnswerToDTO(a *app.TestAnwser) course.TestAnswer {
	return course.TestAnswer{
		Id:        &a.ID,
		Content:   a.Content,
		IsCorrect: a.IsCorrect,
	}
}

func lessonTypeToDTO(lessonType app.LessonType) course.LessonLessonType {
	switch lessonType {
	case app.LessonTypeVideo:
		return course.LessonLessonTypeVideo
	case app.LessonTypeTest:
		return course.LessonLessonTypeTest
	}
	panic("invalid lesson type")
}

func testLessonTypeToDTO(lessonType app.TestLessonType) course.TestLessonType {
	switch lessonType {
	case app.TestLessonTypeMultipleChoice:
		return course.TestLessonTypeMultipleChoice
	case app.TestLessonTypeSingleChoice:
		return course.TestLessonTypeSingleChoice
	}
	panic("invalid test lesson type")
}
