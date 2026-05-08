package domain

import "github.com/goforj/wire"

var ProviderSet = wire.NewSet(
	NewDeleteCourseSvc,
	NewMoveLessonSvc,
	NewEnrollInCourseSvc,
	NewFinishCourseSvc,
	NewReviewCourseSvc,
)
