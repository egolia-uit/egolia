package seedcourse

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func NewSeedForSQL() *Seed {
	return &Seed{db: nil}
}

func (s *Seed) PrintSQL(w io.Writer) {
	courses := s.createCourses()
	enrollments := s.createEnrollments()

	fmt.Fprintln(w, "BEGIN;") //nolint:errcheck
	fmt.Fprintln(w)           //nolint:errcheck

	for _, c := range courses {
		writeCourseSQL(w, c)
	}

	for _, e := range enrollments {
		writeEnrollmentSQL(w, e)
	}

	fmt.Fprintln(w, "COMMIT;") //nolint:errcheck
}

func writeCourseSQL(w io.Writer, c model.Course) {
	fmt.Fprintf(w, //nolint:errcheck
		"INSERT INTO courses (id, original_course_id, title, instructor_id, status, price, overview, hidden, introduction_video_key, created_at, updated_at, deleted_at)\n"+
			"VALUES ('%s', %s, %s, %s, %s, %d, %s, %v, %s, %s, %s, %s)\n"+
			"ON CONFLICT (id) DO UPDATE SET\n"+
			"  original_course_id = EXCLUDED.original_course_id,\n"+
			"  title = EXCLUDED.title,\n"+
			"  instructor_id = EXCLUDED.instructor_id,\n"+
			"  status = EXCLUDED.status,\n"+
			"  price = EXCLUDED.price,\n"+
			"  overview = EXCLUDED.overview,\n"+
			"  hidden = EXCLUDED.hidden,\n"+
			"  introduction_video_key = EXCLUDED.introduction_video_key,\n"+
			"  updated_at = EXCLUDED.updated_at,\n"+
			"  deleted_at = EXCLUDED.deleted_at;\n\n",
		c.ID,
		pgNullUUID(c.OriginalCourseID),
		pgStr(c.Title),
		pgStr(c.InstructorID),
		pgStr(string(c.Status)),
		c.Price,
		pgStr(c.Overview),
		c.Hidden,
		pgStr(c.IntroductionVideoKey),
		pgTimestamp(c.CreatedAt),
		pgTimestamp(c.UpdatedAt),
		pgDeletedAt(c.DeletedAt),
	)

	for _, sec := range c.Sections {
		writeSectionSQL(w, sec)
	}
}

func writeSectionSQL(w io.Writer, sec model.Section) {
	fmt.Fprintf(w, //nolint:errcheck
		"INSERT INTO sections (id, course_id, original_section_id, title, index, created_at, updated_at, deleted_at)\n"+
			"VALUES ('%s', '%s', %s, %s, %d, %s, %s, %s)\n"+
			"ON CONFLICT (id) DO UPDATE SET\n"+
			"  course_id = EXCLUDED.course_id,\n"+
			"  original_section_id = EXCLUDED.original_section_id,\n"+
			"  title = EXCLUDED.title,\n"+
			"  index = EXCLUDED.index,\n"+
			"  updated_at = EXCLUDED.updated_at,\n"+
			"  deleted_at = EXCLUDED.deleted_at;\n\n",
		sec.ID,
		sec.CourseID,
		pgNullUUID(sec.OriginalSectionID),
		pgStr(sec.Title),
		sec.Index,
		pgTimestamp(sec.CreatedAt),
		pgTimestamp(sec.UpdatedAt),
		pgDeletedAt(sec.DeletedAt),
	)

	for _, les := range sec.Lessons {
		writeLessonSQL(w, les)
	}
}

func writeLessonSQL(w io.Writer, les model.Lesson) {
	fmt.Fprintf(w, //nolint:errcheck
		"INSERT INTO lessons (id, section_id, original_lesson_id, title, index, lesson_type, created_at, updated_at, deleted_at)\n"+
			"VALUES ('%s', '%s', %s, %s, %d, %s, %s, %s, %s)\n"+
			"ON CONFLICT (id) DO UPDATE SET\n"+
			"  section_id = EXCLUDED.section_id,\n"+
			"  original_lesson_id = EXCLUDED.original_lesson_id,\n"+
			"  title = EXCLUDED.title,\n"+
			"  index = EXCLUDED.index,\n"+
			"  lesson_type = EXCLUDED.lesson_type,\n"+
			"  updated_at = EXCLUDED.updated_at,\n"+
			"  deleted_at = EXCLUDED.deleted_at;\n\n",
		les.ID,
		les.SectionID,
		pgNullUUID(les.OriginalLessonID),
		pgStr(les.Title),
		les.Index,
		pgStr(string(les.LessonType)),
		pgTimestamp(les.CreatedAt),
		pgTimestamp(les.UpdatedAt),
		pgDeletedAt(les.DeletedAt),
	)

	if les.VideoLesson != nil {
		fmt.Fprintf(w, //nolint:errcheck
			"INSERT INTO video_lessons (lesson_id, video_key, duration_seconds)\n"+
				"VALUES ('%s', %s, %d)\n"+
				"ON CONFLICT (lesson_id) DO UPDATE SET\n"+
				"  video_key = EXCLUDED.video_key,\n"+
				"  duration_seconds = EXCLUDED.duration_seconds;\n\n",
			les.VideoLesson.LessonID,
			pgStr(les.VideoLesson.VideoKey),
			les.VideoLesson.Duration,
		)
	}

	if les.TestLesson != nil {
		fmt.Fprintf(w, //nolint:errcheck
			"INSERT INTO test_lessons (lesson_id, question_type)\n"+
				"VALUES ('%s', %s)\n"+
				"ON CONFLICT (lesson_id) DO UPDATE SET\n"+
				"  question_type = EXCLUDED.question_type;\n\n",
			les.TestLesson.LessonID,
			pgStr(string(les.TestLesson.QuestionType)),
		)

		for _, q := range les.TestLesson.Questions {
			fmt.Fprintf(w, //nolint:errcheck
				"INSERT INTO test_questions (id, test_lesson_id, question)\n"+
					"VALUES ('%s', '%s', %s)\n"+
					"ON CONFLICT (id) DO UPDATE SET\n"+
					"  test_lesson_id = EXCLUDED.test_lesson_id,\n"+
					"  question = EXCLUDED.question;\n\n",
				q.ID,
				q.TestLessonID,
				pgStr(q.Question),
			)

			for _, a := range q.Answers {
				fmt.Fprintf(w, //nolint:errcheck
					"INSERT INTO test_answers (id, question_id, answer, is_correct)\n"+
						"VALUES ('%s', '%s', %s, %v)\n"+
						"ON CONFLICT (id) DO UPDATE SET\n"+
						"  question_id = EXCLUDED.question_id,\n"+
						"  answer = EXCLUDED.answer,\n"+
						"  is_correct = EXCLUDED.is_correct;\n\n",
					a.ID,
					a.QuestionID,
					pgStr(a.Answer),
					a.IsCorrect,
				)
			}
		}
	}
}

func writeEnrollmentSQL(w io.Writer, e model.Enrollment) {
	fmt.Fprintf(w, //nolint:errcheck
		"INSERT INTO enrollments (id, course_id, learner_id, enrolled_at, completed_at, expired_at, created_at, updated_at)\n"+
			"VALUES ('%s', '%s', %s, %s, %s, %s, %s, %s)\n"+
			"ON CONFLICT (id) DO UPDATE SET\n"+
			"  course_id = EXCLUDED.course_id,\n"+
			"  learner_id = EXCLUDED.learner_id,\n"+
			"  enrolled_at = EXCLUDED.enrolled_at,\n"+
			"  completed_at = EXCLUDED.completed_at,\n"+
			"  expired_at = EXCLUDED.expired_at,\n"+
			"  updated_at = EXCLUDED.updated_at;\n\n",
		e.ID,
		e.CourseID,
		pgStr(e.LearnerID),
		pgTimestamp(e.EnrollmentDate),
		pgNullTime(e.CompletedAt),
		pgNullTime(e.ExpiredAt),
		pgTimestamp(e.CreatedAt),
		pgTimestamp(e.UpdatedAt),
	)
}

func pgNullTime(t *time.Time) string {
	if t == nil {
		return "NULL"
	}
	return pgTimestamp(*t)
}

func pgStr(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

func pgTimestamp(t time.Time) string {
	if t.IsZero() {
		return "NOW()"
	}
	return "'" + t.UTC().Format("2006-01-02 15:04:05.999999Z07:00") + "'"
}

func pgNullUUID(u *uuid.UUID) string {
	if u == nil {
		return "NULL"
	}
	return "'" + u.String() + "'"
}

func pgDeletedAt(d gorm.DeletedAt) string {
	if !d.Valid {
		return "NULL"
	}
	return pgTimestamp(d.Time)
}
