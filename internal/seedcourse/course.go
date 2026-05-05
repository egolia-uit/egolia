// vim:tabstop=2 softtabstop=2 shiftwidth=2 expandtab
package seedcourse

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// type Course struct {
// 	ID                   uuid.UUID           `gorm:"type:uuid;primaryKey"`
// 	OriginalCourseID     uuid.UUID           `gorm:"type:uuid;not null"`
// 	Title                string              `gorm:"type:text;not null"`
// 	InstructorID         string              `gorm:"column:instructor_id;type:text;not null"`
// 	Status               domain.CourseStatus `gorm:"type:text;not null"`
// 	Price                float64             `gorm:"not null;default:0"`
// 	Overview             string              `gorm:"type:text;not null;default:''"`
// 	Hidden               bool                `gorm:"not null;default:false"`
// 	IntroductionVideoURL string              `gorm:"column:introduction_video_url;type:text;not null;default:''"`
// 	Sections             []Section           `gorm:"foreignKey:CourseID"`
// 	CreatedAt            time.Time           `gorm:"autoCreateTime"`
// 	UpdatedAt            time.Time           `gorm:"autoUpdateTime"`
// 	DeletedAt            gorm.DeletedAt      `gorm:"index"`
// }

// type Section struct {
// 	ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
// 	CourseID  uuid.UUID      `gorm:"type:uuid;not null"`
// 	Title     string         `gorm:"type:varchar(255);not null"`
// 	SortOrder string         `gorm:"column:sort_order;type:text;not null;default:''"`
// 	Lessons   []Lesson       `gorm:"foreignKey:SectionID"`
// 	CreatedAt time.Time      `gorm:"autoCreateTime"`
// 	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
// 	DeletedAt gorm.DeletedAt `gorm:"index"`
// }

// type Lesson struct {
// 	ID          uuid.UUID         `gorm:"type:uuid;primaryKey"`
// 	SectionID   uuid.UUID         `gorm:"type:uuid;not null"`
// 	Title       string            `gorm:"type:varchar(255);not null"`
// 	SortOrder   string            `gorm:"column:sort_order;type:text;not null;default:''"`
// 	LessonType  domain.LessonType `gorm:"column:lesson_type;type:varchar(50);not null"`
// 	VideoLesson *VideoLesson      `gorm:"foreignKey:LessonID"`
// 	TestLesson  *TestLesson       `gorm:"foreignKey:LessonID"`
// 	DeletedAt   gorm.DeletedAt    `gorm:"index"`
// 	CreatedAt   time.Time         `gorm:"autoCreateTime"`
// 	UpdatedAt   time.Time         `gorm:"autoUpdateTime"`
// }
//

// type VideoLesson struct {
// 	LessonID uuid.UUID `gorm:"type:uuid;primaryKey"`
// 	VideoKey string    `gorm:"column:video_key;type:varchar(1024);not null;default:''"`
// 	Duration int64     `gorm:"column:duration_seconds;not null;default:0"`
// }
//

// type TestLesson struct {
// 	LessonID  uuid.UUID             `gorm:"type:uuid;primaryKey"`
// 	Type      domain.TestLessonType `gorm:"column:test_type;type:varchar(50);not null"`
// 	Questions []TestQuestion        `gorm:"foreignKey:TestLessonID;references:LessonID"`
// }

// TODO: SortOrder to become int, later
func (s *Seed) createCourses() []model.Course {
	return []model.Course{
		{
			ID:                   uuid.MustParse("00000000-0000-0000-0000-000000000001"),
			OriginalCourseID:     uuid.MustParse("00000000-0000-0000-0000-000000000000"), // TODO: wtf?
			Title:                "FlowChart - Chuyên đề Lưu đồ Thuật toán",
			InstructorID:         "120",
			Status:               domain.CourseStatusApproved,
			Price:                120000,
			Overview:             "FlowChart - Chuyên đề Lưu đồ Thuật toán",
			Hidden:               false,
			IntroductionVideoKey: s.publicObjectStorageURL.JoinPath(s.objectStorageBucket, "flowchart_intro.mp4").String(),
			Sections: []model.Section{
				{
					ID:        uuid.MustParse("00000000-0000-0000-0000-000000000011"),
					CourseID:  uuid.MustParse("00000000-0000-0000-0000-000000000001"),
					Title:     "Intro",
					SortOrder: "1",
					Lessons: []model.Lesson{
						{
							ID:         uuid.MustParse("00000000-0000-0000-0000-000000000111"),
							SectionID:  uuid.MustParse("00000000-0000-0000-0000-000000000011"),
							Title:      "LĐTT Lý thuyết Lưu đồ Thuật toán",
							SortOrder:  "1",
							LessonType: domain.LessonTypeVideo,
							VideoLesson: &model.VideoLesson{
								LessonID: uuid.MustParse("00000000-0000-0000-0000-000000000111"),
								VideoKey: "",
								Duration: int64((7*time.Minute + 23*time.Second) / time.Second),
							},
							TestLesson: nil,
							CreatedAt:  time.Now(),
							UpdatedAt:  time.Now(),
							DeletedAt:  gorm.DeletedAt{},
						},
						{
							ID:          uuid.MustParse("00000000-0000-0000-0000-000000000112"),
							SectionID:   uuid.MustParse("00000000-0000-0000-0000-000000000011"),
							Title:       "Đay là cái gì",
							SortOrder:   "2",
							LessonType:  domain.LessonTypeTest,
							VideoLesson: nil,
							TestLesson: &model.TestLesson{
								LessonID: uuid.MustParse("00000000-0000-0000-0000-000000000112"),
								Type:     domain.SingleChoice,
								Questions: []model.TestQuestion{
									{
										ID:           uuid.MustParse("00000000-0000-0000-0000-000000001121"),
										TestLessonID: uuid.MustParse("00000000-0000-0000-0000-000000000112"),
										Question:     "FlowChart là gì?",
										Answers: []model.TestAnswer{
											{
												ID:         uuid.MustParse("00000000-0000-0000-0000-000000011211"),
												QuestionID: uuid.MustParse("00000000-0000-0000-0000-000000001121"),
												Answer:     "Biểu đồ thể hiện luồng điều khiển của thuật toán",
												IsCorrect:  true,
											},
											{
												ID:         uuid.MustParse("00000000-0000-0000-0000-000000011212"),
												QuestionID: uuid.MustParse("00000000-0000-0000-0000-000000001121"),
												Answer:     "Một loại sơ đồ dùng để thiết kế giao diện người dùng",
												IsCorrect:  false,
											},
										},
									},
								},
							},
							CreatedAt: time.Now(),
							UpdatedAt: time.Now(),
							DeletedAt: gorm.DeletedAt{},
						},
					},
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					DeletedAt: gorm.DeletedAt{},
				},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			DeletedAt: gorm.DeletedAt{},
		},
	}
}
