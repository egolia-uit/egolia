package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/errs"
)

type GetMyCourses struct {
	Hidden             *bool
	Status             *CourseStatus
	HaveOriginalCourse *bool
	UserID             string
	Paginate           PaginationParams
	Order              *SearchCoursesOrder
	Deleted            *bool
}

type GetMyCoursesQuery Query[GetMyCourses, *Paginated[Course]]

type GetMyCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyCoursesHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetMyCoursesQuery {
	handler := &GetMyCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetMyCourses, *Paginated[Course]] = (*GetMyCoursesHandler)(nil)

func (h *GetMyCoursesHandler) Handle(ctx context.Context, params *GetMyCourses) (*Paginated[Course], error) {
	CourseStatusApproved := CourseStatusApproved
	Deleted := false
	myApprovedCourses, err := h.readModel.GetCourses(ctx, &GetCourses{
		Query:              nil,
		Hidden:             params.Hidden,
		Status:             &CourseStatusApproved,
		InstructorID:       &params.UserID,
		Paginate:           params.Paginate,
		Order:              params.Order,
		HaveOriginalCourse: nil,
		Deleted:            &Deleted,
	})
	if err != nil {
		return nil, errs.NewInternalErr("failed to get approved courses", err)
	}

	haveOriginalCourse := false
	CourseStatusDraft := CourseStatusDraft
	myNewCourses, err := h.readModel.GetCourses(ctx, &GetCourses{
		Query:              nil,
		Hidden:             params.Hidden,
		Status:             &CourseStatusDraft,
		InstructorID:       &params.UserID,
		Paginate:           params.Paginate,
		Order:              params.Order,
		HaveOriginalCourse: &haveOriginalCourse,
		Deleted:            &Deleted,
	})
	if err != nil {
		return nil, errs.NewInternalErr("failed to get new courses", err)
	}

	myApprovedCourses.Data = append(myApprovedCourses.Data, myNewCourses.Data...)

	return myApprovedCourses, nil
}
