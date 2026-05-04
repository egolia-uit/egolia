package domain

// 1. Ràng buộc: "Chỉ học viên đã ghi danh mới được đánh giá"
// Hệ thống EdTech thực tế không bao giờ cho phép một người lạ (chưa mua hoặc chưa học) vào đánh giá khóa học.
// Để biết người dùng (userID) đã ghi danh khóa học (courseID) hay chưa, bạn bắt buộc phải truy vấn qua EnrollmentRepo.
// Bản thân thực thể Review hay Course trên RAM không thể tự chạy xuống Database để check bảng enrollments. Do đó, ReviewDomainService phải đứng ra gọi EnrollmentRepo.ExistsByLearnerAndCourse() để phán xử quyền được phép đánh giá.
// 2. Ràng buộc: "Mỗi người chỉ được đánh giá 1 lần" (Chống spam)
// Tương tự như logic chống đăng ký trùng ở EnrollInCourse, hệ thống cần kiểm tra xem người dùng này đã từng viết Review cho khóa học này chưa.
// Nếu chưa: Khởi tạo thực thể Review mới.
// Nếu rồi: Tùy logic nghiệp vụ, hệ thống sẽ báo lỗi "Bạn đã đánh giá rồi", hoặc sẽ thực hiện hành động Cập nhật (Update) cái Review cũ đó. Quyết định này là logic của Tầng Domain.
// 3. Ràng buộc trạng thái khóa học
// Học viên chỉ có thể đánh giá những khóa học đang ở trạng thái published (đã xuất bản)
// . Không thể đánh giá một khóa học draft hoặc đã bị archived. ReviewDomainService sẽ đảm nhận việc check trạng thái này.

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type ReviewCourse struct {
	Course  *Course
	ActorID string
	Comment string
	Rating  int
}

type ReviewCourseSvc struct {
	enrollRepo EnrollmentRepo
	reviewRepo ReviewRepo
}

func NewReviewCourseSvc(enrollRepo EnrollmentRepo, reviewRepo ReviewRepo) *ReviewCourseSvc {
	return &ReviewCourseSvc{
		enrollRepo: enrollRepo,
		reviewRepo: reviewRepo,
	}
}

func (s *ReviewCourseSvc) Handle(ctx context.Context, review *ReviewCourse) (*Review, error) {
	hasEnrolled, err := s.enrollRepo.ExistsByCourseAndLearner(ctx, review.Course.ID(), review.ActorID)
	if err != nil {
		return nil, err
	}
	if !hasEnrolled {
		return nil, errs.NewInvalid("learner has not enrolled in this course")
	}

	hasReviewed, err := s.reviewRepo.ExistsByCourseAndLearner(ctx, review.Course.ID(), review.ActorID)
	if err != nil {
		return nil, err
	}
	if hasReviewed {
		return nil, errs.NewInvalid("learner has already reviewed this course")
	}

	if review.Course.Status() != CourseStatusApproved && review.Course.Hidden() != false {
		return nil, errs.NewInvalid("course is not approved")
	}

	reviewID := uuid.New()
	r := NewReview(reviewID, review.Course.ID(), review.ActorID, review.Rating, review.Comment)

	return r, nil
}
