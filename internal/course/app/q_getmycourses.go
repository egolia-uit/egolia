package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/errs"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetMyCourses struct {
	Hidden             *bool
	Status             *CourseStatus
	HaveOriginalCourse *bool
	UserID             string
	Paginate           PaginationParams
	Order              *SearchCoursesOrder
}

type GetMyCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyCoursesHandler(readModel GetCoursesReadModel) *GetMyCoursesHandler {
	return &GetMyCoursesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetMyCourses, *Paginated[Course]] = (*GetMyCoursesHandler)(nil)

func (h *GetMyCoursesHandler) Handle(ctx context.Context, params *GetMyCourses) (*Paginated[Course], error) {
	CourseStatusApproved := CourseStatusApproved
	myApprovedCourses, err := h.readModel.GetCourses(ctx, &GetCourses{
		Query:              nil,
		Hidden:             params.Hidden,
		Status:             &CourseStatusApproved,
		InstructorID:       &params.UserID,
		Paginate:           params.Paginate,
		Order:              params.Order,
		HaveOriginalCourse: nil,
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
	})
	if err != nil {
		return nil, errs.NewInternalErr("failed to get new courses", err)
	}

	myApprovedCourses.Data = append(myApprovedCourses.Data, myNewCourses.Data...)

	return myApprovedCourses, nil
}
