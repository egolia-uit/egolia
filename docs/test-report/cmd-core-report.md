# App Command Handlers (Core) Test Report

This report documents the planned unit test cases for the 9 core command handlers in `internal/course/app/`. Each handler gets one **Meta** + **Sheet** section following the transposed matrix layout.

---

## 1. CreateCourseHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.CreateCourseHandler                           |     |     | Function Name      |     |     |     |     |     | CreateCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 49                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course creation with title, price validation and persistence via CourseRepo.Save |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | Title                                        |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | valid ("Golang 101") |     | O                   |                     |                     |
| 3   |           |                                              |     | empty ("")           |     |                     | O                   |                     |
| 4   |           | Price                                        |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | >= 0 (e.g. 99000)    |     | O                   |                     |                     |
| 6   |           |                                              |     | < 0 (e.g. -1)        |     |                     |                     | O                   |
| 7   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 8   |           |                                              |     | nil                  |     | O                   |                     |                     |
| 9   |           |                                              |     | errs.Invalid("title is required") |     |       | O                   |                     |
| 10  |           |                                              |     | errs.Invalid("price must be greater than or equal to 0") |     |  |                     |                     | O                   |
| 11  |           | Side effect: CourseRepo.Save called          |     |                       |     |                     |                     |                     |
| 12  |           |                                              |     | true                 |     | O                   |                     |                     |
| 13  |           |                                              |     | false                |     |                     | O                   | O                   |
| 14  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 15  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  |
| 16  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 17  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 2. UpdateCourseHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.UpdateCourseHandler                           |     |     | Function Name      |     |     |     |     |     | UpdateCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 62                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course update: set title/price/overview, handle not-found and invalid price |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | CourseRepo.GetFull return                    |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | course                |     | O                   |                     | O                   |
| 3   |           |                                              |     | gorm.ErrRecordNotFound |     |                    | O                   |                     |
| 4   |           | Title                                        |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | valid new title       |     | O                   |                     |                     |
| 6   |           | Price                                        |     |                       |     |                     |                     |                     |
| 7   |           |                                              |     | >= 0 (e.g. 49000)     |     | O                   |                     |                     |
| 8   |           |                                              |     | < 0 (e.g. -5000)      |     |                     |                     | O                   |
| 9   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 10  |           |                                              |     | nil                   |     | O                   |                     |                     |
| 11  |           |                                              |     | errs.CourseNotFound   |     |                     | O                   |                     |
| 12  |           |                                              |     | errs.Invalid("price must be greater than or equal to 0") |     |  |                     |                     | O                   |
| 13  |           | Side effect: CourseRepo.Save called          |     |                       |     |                     |                     |                     |
| 14  |           |                                              |     | true                  |     | O                   |                     |                     |
| 15  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 16  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 17  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  |
| 18  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 19  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 3. DeleteCourseHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.DeleteCourseHandler                           |     |     | Function Name      |     |     |     |     |     | DeleteCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 53                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course deletion through DeleteCourseSvc; block if enrollments exist, fail if not found |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | CourseRepo.GetFull return                    |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | course                |     | O                   | O                   |                     |
| 3   |           |                                              |     | gorm.ErrRecordNotFound |     |                    |                     | O                   |
| 4   |           | DeleteCourseSvc.Handle result                |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | nil (no enrollments)  |     | O                   |                     |                     |
| 6   |           |                                              |     | errs.CourseHasEnrollment |     |                   | O                   |                     |
| 7   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 8   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 9   |           |                                              |     | errs.CourseHasEnrollment |     |                   | O                   |                     |
| 10  |           |                                              |     | errs.CourseNotFound   |     |                     |                     | O                   |
| 11  |           | Side effect: CourseRepo.Save called          |     |                       |     |                     |                     |                     |
| 12  |           |                                              |     | true                  |     | O                   |                     |                     |
| 13  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 14  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 15  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  |
| 16  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 17  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 4. ApproveCourseHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.ApproveCourseHandler                          |     |     | Function Name      |     |     |     |     |     | ApproveCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 81                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course approval: approve original directly, or merge draft then approve, propagate merge error |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 1   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | course.OriginalCourseID()                    |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | nil (original course) |     | O                   |                     |                     |
| 3   |           |                                              |     | not nil (has draft)   |     |                     | O                   | O                   |
| 4   |           | originalCourse.Merge(draft) return           |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | nil (success)         |     |                     | O                   |                     |
| 6   |           |                                              |     | error (merge fails)   |     |                     |                     | O                   |
| 7   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 8   |           |                                              |     | nil                   |     | O                   | O                   |                     |
| 9   |           |                                              |     | propagated merge error |     |                    |                     | O                   |
| 10  |           | Side effect: CourseRepo.Save called          |     |                       |     |                     |                     |                     |
| 11  |           |                                              |     | once (original only)  |     | O                   |                     |                     |
| 12  |           |                                              |     | twice (original+draft)|     |                     | O                   |                     |
| 13  |           |                                              |     | not called            |     |                     |                     | O                   |
| 14  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   | A                   |
| 15  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  |
| 16  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 17  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 5. CreateSectionHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.CreateSectionHandler                          |     |     | Function Name      |     |     |     |     |     | CreateSectionHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 59                                                       |     |     | Lack of test cases |     |     |     |     |     | 4          |     |     |                  |
| Test requirement |     | Verify section creation: add section, check duplicate title, course existence, instructor edit permission |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 4                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 3   | 0   | 4                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             | UTCID04             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | CourseRepo.GetFull return                    |     |                       |     |                     |                     |                     |                     |
| 2   |           |                                              |     | course                |     | O                   | O                   |                     | O                   |
| 3   |           |                                              |     | gorm.ErrRecordNotFound |     |                    |                     | O                   |                     |
| 4   |           | course.CanInstructorEdit()                   |     |                       |     |                     |                     |                     |                     |
| 5   |           |                                              |     | true                  |     | O                   | O                   |                     |                     |
| 6   |           |                                              |     | false                 |     |                     |                     |                     | O                   |
| 7   |           | course.ExistsSectionWithTitle(title)         |     |                       |     |                     |                     |                     |                     |
| 8   |           |                                              |     | false                 |     | O                   |                     |                     |                     |
| 9   |           |                                              |     | true                  |     |                     | O                   |                     |                     |
| 10  | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |                     |
| 11  |           |                                              |     | nil                   |     | O                   |                     |                     |                     |
| 12  |           |                                              |     | errs.SectionTitleAlreadyExists |     |            | O                   |                     |                     |
| 13  |           |                                              |     | errs.CourseNotFound   |     |                     |                     | O                   |                     |
| 14  |           |                                              |     | errs.Unauthorized     |     |                     |                     |                     | O                   |
| 15  |           | Side effect: CourseRepo.Save called          |     |                       |     |                     |                     |                     |                     |
| 16  |           |                                              |     | true                  |     | O                   |                     |                     |                     |
| 17  |           |                                              |     | false                 |     |                     | O                   | O                   | O                   |
| 18  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   | A                   |
| 19  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  | P                  |
| 20  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 21  |           | Defect ID                                   |     |                       |     |                     |                     |                     |                     |

---

## 6. UpdateSectionTitleHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.UpdateSectionTitleHandler                     |     |     | Function Name      |     |     |     |     |     | UpdateSectionTitleHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 54                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify section title update: update title, reject duplicate title, handle missing section |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | course.CanInstructorEdit()                   |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   | O                   | O                   |
| 3   |           | course.ExistsSectionWithTitle(newTitle)      |     |                       |     |                     |                     |                     |
| 4   |           |                                              |     | false                 |     | O                   |                     | O                   |
| 5   |           |                                              |     | true                  |     |                     | O                   |                     |
| 6   |           | course.GetSection(sectionID)                 |     |                       |     |                     |                     |                     |
| 7   |           |                                              |     | section (not nil)     |     | O                   |                     |                     |
| 8   |           |                                              |     | nil (not found)       |     |                     |                     | O                   |
| 9   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 10  |           |                                              |     | nil                   |     | O                   |                     |                     |
| 11  |           |                                              |     | errs.SectionTitleAlreadyExists |     |            | O                   |                     |
| 12  |           |                                              |     | errs.SectionNotFound  |     |                     |                     | O                   |
| 13  |           | Side effect: CourseRepo.Save called          |     |                       |     |                     |                     |                     |
| 14  |           |                                              |     | true                  |     | O                   |                     |                     |
| 15  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 16  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 17  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  |
| 18  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 19  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 7. CommentOnLessonHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.CommentOnLessonHandler                        |     |     | Function Name      |     |     |     |     |     | CommentOnLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 36                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify lesson comment creation with content validation   |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | Content                                      |     |                       |     |                     |                     |
| 2   |           |                                              |     | valid non-empty       |     | O                   |                     |
| 3   |           |                                              |     | empty ("")            |     |                     | O                   |
| 4   | Confirm   | Return error                                 |     |                       |     |                     |                     |
| 5   |           |                                              |     | nil                   |     | O                   |                     |
| 6   |           |                                              |     | errs.Invalid("content is required") |     |  |                     | O                   |
| 7   |           | Side effect: LessonCommentRepo.Save called   |     |                       |     |                     |                     |
| 8   |           |                                              |     | true                  |     | O                   |                     |
| 9   |           |                                              |     | false                 |     |                     | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 11  |           | Passed/Failed                               |     |                       |     | P                  | P                  |
| 12  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         |
| 13  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 8. ReplyOnLessonCommentHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.ReplyOnLessonCommentHandler                   |     |     | Function Name      |     |     |     |     |     | ReplyOnLessonCommentHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 46                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify reply creation on existing comment; reject if origin comment not found |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | LessonCommentRepo.Get return                 |     |                       |     |                     |                     |
| 2   |           |                                              |     | found (not nil)       |     | O                   |                     |
| 3   |           |                                              |     | nil (not found)       |     |                     | O                   |
| 4   | Confirm   | Return error                                 |     |                       |     |                     |                     |
| 5   |           |                                              |     | nil                   |     | O                   |                     |
| 6   |           |                                              |     | errs.LessonCommentNotFound |     |                 | O                   |
| 7   |           | Side effect: LessonCommentRepo.Save called   |     |                       |     |                     |                     |
| 8   |           |                                              |     | true                  |     | O                   |                     |
| 9   |           |                                              |     | false                 |     |                     | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 11  |           | Passed/Failed                               |     |                       |     | P                  | P                  |
| 12  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         |
| 13  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 9. DeleteLessonCommentHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.DeleteLessonCommentHandler                    |     |     | Function Name      |     |     |     |     |     | DeleteLessonCommentHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 54                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify comment deletion: soft-delete comment and its replies; reject if not found or reply-to-reply |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | LessonCommentRepo.Get return                 |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | comment (not nil)     |     | O                   |                     | O                   |
| 3   |           |                                              |     | nil (not found)       |     |                     | O                   |                     |
| 4   |           | Comment is a reply (ParentCommentID != nil)  |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | false (top-level)     |     | O                   |                     |                     |
| 6   |           |                                              |     | true (is a reply)     |     |                     |                     | O                   |
| 7   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 8   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 9   |           |                                              |     | errs.LessonCommentNotFound |     |                 | O                   |                     |
| 10  |           |                                              |     | errs.Forbidden / invalid     |     |               |                     |                     | O                   |
| 11  |           | Side effect: DeleteReplies + Save called     |     |                       |     |                     |                     |                     |
| 12  |           |                                              |     | true                  |     | O                   |                     |                     |
| 13  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 14  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 15  |           | Passed/Failed                               |     |                       |     | P                  | P                  | P                  |
| 16  |           | Executed Date                               |     |                       |     | 2026-05-30         | 2026-05-30         | 2026-05-30         |
| 17  |           | Defect ID                                   |     |                       |     |                     |                     |                     |
