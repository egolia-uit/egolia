package model

import "github.com/google/uuid"

// VideoLesson is the extension table for video-type lessons.
// The base fields (SectionID, Title, SortOrder, LessonType) live in the lessons table.
type VideoLesson struct {
	LessonID uuid.UUID `gorm:"type:uuid;primaryKey"`
	VideoKey string    `gorm:"column:video_key;type:varchar(1024);not null;default:''"`
	Duration int64     `gorm:"column:duration_seconds;not null;default:0"`
}

func (VideoLesson) TableName() string { return "video_lessons" }
