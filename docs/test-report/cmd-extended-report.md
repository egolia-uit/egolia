# Extended Command Handlers Test Report

This report documents the planned unit test cases for extended command handlers in `internal/course/app/`. Each handler gets one **Meta** and one **Sheet** section following the transposed matrix layout.

---

## 1. `course.app.CreateVideoLessonHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.CreateVideoLessonHandler                      |     |     | Function Name      |     |     |     |     |     | CreateVideoLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 45                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify video lesson creation with title/url/duration to section, including authorization |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | user editable                                |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true (instructor/editor) |     | O                   |                     |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |                     |
| 4   |           | section found                                |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | true                  |     | O                   |                     |                     |
| 6   |           |                                              |     | false                 |     |                     |                     | O                   |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.Unauthenticated  |     |                     | O                   |                     |
| 11  |           |                                              |     | errs.NotFound         |     |                     |                     | O                   |
| 12  |           | Side effect: course saved                    |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 2. `course.app.CreateTestLessonHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.CreateTestLessonHandler                       |     |     | Function Name      |     |     |     |     |     | CreateTestLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify test lesson creation with questions added to section |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | section found                                |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.NotFound         |     |                     | O                   |
| 8   |           | Side effect: course saved                    |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 3. `course.app.EditVideoLessonHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.EditVideoLessonHandler                        |     |     | Function Name      |     |     |     |     |     | EditVideoLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 45                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify video lesson field updates including type check and authorization |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | lesson exists and is video type              |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |                     |
| 3   |           |                                              |     | exists but test       |     |                     | O                   |                     |
| 4   |           | user editable                                |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | true                  |     | O                   |                     |                     |
| 6   |           |                                              |     | false                 |     |                     |                     | O                   |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.WrongType        |     |                     | O                   |                     |
| 11  |           |                                              |     | errs.Unauthenticated  |     |                     |                     | O                   |
| 12  |           | Side effect: course saved                    |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 4. `course.app.EditTestLessonHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.EditTestLessonHandler                         |     |     | Function Name      |     |     |     |     |     | EditTestLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 35                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify test lesson question updates and course-not-found handling |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | course found                                 |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.NotFound         |     |                     | O                   |
| 8   |           | Side effect: course saved                    |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 5. `course.app.DeleteLessonHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.DeleteLessonHandler                           |     |     | Function Name      |     |     |     |     |     | DeleteLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify lesson removal from section with authorization and not-found checks |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | user editable                                |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |                     |
| 4   |           | lesson found                                 |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | true                  |     | O                   |                     |                     |
| 6   |           |                                              |     | false                 |     |                     |                     | O                   |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.Unauthenticated  |     |                     | O                   |                     |
| 11  |           |                                              |     | errs.NotFound         |     |                     |                     | O                   |
| 12  |           | Side effect: course saved                    |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 6. `course.app.MoveLessonHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.MoveLessonHandler                             |     |     | Function Name      |     |     |     |     |     | MoveLessonHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 35                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify lesson reordering within/between sections with authorization |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | user editable                                |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.Unauthenticated  |     |                     | O                   |
| 8   |           | Side effect: course saved                    |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 7. `course.app.DeleteSectionHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.DeleteSectionHandler                          |     |     | Function Name      |     |     |     |     |     | DeleteSectionHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 35                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify section removal from course with authorization check |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | user editable                                |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.Unauthenticated  |     |                     | O                   |
| 8   |           | Side effect: course saved                    |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 8. `course.app.EnrollInCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.EnrollInCourseHandler                          |     |     | Function Name      |     |     |     |     |     | EnrollInCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course enrollment creation with duplicate and not-found handling |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | course found                                 |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     | O                   |
| 3   |           |                                              |     | false                 |     |                     | O                   |                     |
| 4   |           | already enrolled                             |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | false                 |     | O                   |                     |                     |
| 6   |           |                                              |     | true                  |     |                     |                     | O                   |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.NotFound         |     |                     | O                   |                     |
| 11  |           |                                              |     | errs.Invalid("already enrolled") |     |            |                     |                     | O                   |
| 12  |           | Side effect: enrollment saved                |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 9. `course.app.FinishCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.FinishCourseHandler                            |     |     | Function Name      |     |     |     |     |     | FinishCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course completion: enrollment exists and belongs to correct learner |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | enrollment found                             |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     | O                   |
| 3   |           |                                              |     | false                 |     |                     | O                   |                     |
| 4   |           | learner matches enrollment                   |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | same                  |     | O                   |                     |                     |
| 6   |           |                                              |     | different             |     |                     |                     | O                   |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.NotFound         |     |                     | O                   |                     |
| 11  |           |                                              |     | errs.Invalid("different learner") |     |         |                     |                     | O                   |
| 12  |           | Side effect: enrollment saved                |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true (completed)      |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 10. `course.app.MarkLessonAsCompletedHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.MarkLessonAsCompletedHandler                   |     |     | Function Name      |     |     |     |     |     | MarkLessonAsCompletedHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 45                                                       |     |     | Lack of test cases |     |     |     |     |     | 4          |     |     |                  |
| Test requirement |     | Verify lesson completion logic: video threshold, test auto-complete, idempotent |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 4                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 4          | 0   | 0   | 4                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             | UTCID04             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | lesson type                                  |     |                       |     |                     |                     |                     |                     |
| 2   |           |                                              |     | video                 |     | O                   | O                   |                     |                     |
| 3   |           |                                              |     | test                  |     |                     |                     | O                   |                     |
| 4   |           | watch percentage (video only)                |     |                       |     |                     |                     |                     |                     |
| 5   |           |                                              |     | >= 80%                |     | O                   |                     |                     |                     |
| 6   |           |                                              |     | < 80%                 |     |                     | O                   |                     |                     |
| 7   |           | already completed                            |     |                       |     |                     |                     |                     |                     |
| 8   |           |                                              |     | false                 |     | O                   | O                   | O                   |                     |
| 9   |           |                                              |     | true                  |     |                     |                     |                     | O                   |
| 10  | Confirm   | Return                                       |     |                       |     |                     |                     |                     |                     |
| 11  |           | error                                        |     |                       |     |                     |                     |                     |                     |
| 12  |           |                                              |     | nil                   |     | O                   | O                   | O                   | O                   |
| 13  |           | Side effect: lesson progress completed       |     |                       |     |                     |                     |                     |                     |
| 14  |           |                                              |     | true                  |     | O                   |                     | O                   |                     |
| 15  |           |                                              |     | false (no-op)         |     |                     | O                   |                     | O                   |
| 16  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   | N                   | N                   |
| 17  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   | P                   |
| 18  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 19  |           | Defect ID                                   |     |                       |     |                     |                     |                     |                     |

---

## 11. `course.app.SaveVideoLessonProgressHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.SaveVideoLessonProgressHandler                 |     |     | Function Name      |     |     |     |     |     | SaveVideoLessonProgressHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify saving and updating video progress with completion trigger |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | existing progress record                     |     |                       |     |                     |                     |
| 2   |           |                                              |     | false (new)           |     | O                   |                     |
| 3   |           |                                              |     | true (existing)       |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   | O                   |
| 7   |           | Side effect: progress record saved            |     |                       |     |                     |                     |
| 8   |           |                                              |     | true (created)        |     | O                   |                     |
| 9   |           |                                              |     | true (updated)        |     |                     | O                   |
| 10  |           | Side effect: MarkLessonAsCompleted called     |     |                       |     |                     |                     |
| 11  |           |                                              |     | true                  |     | O                   | O                   |
| 12  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 13  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 14  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 15  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 12. `course.app.ResetLessonProgressHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.ResetLessonProgressHandler                     |     |     | Function Name      |     |     |     |     |     | ResetLessonProgressHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify lesson progress reset: clear if exists, no-op if not found |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | progress found                               |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   | O                   |
| 7   |           | Side effect: progress deleted                 |     |                       |     |                     |                     |
| 8   |           |                                              |     | true                  |     | O                   |                     |
| 9   |           |                                              |     | false (no-op)         |     |                     | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 13. `course.app.ReviewCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.ReviewCourseHandler                            |     |     | Function Name      |     |     |     |     |     | ReviewCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify review creation: enrolled, not previously reviewed |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | user enrolled                                |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     | O                   |
| 3   |           |                                              |     | false                 |     |                     | O                   |                     |
| 4   |           | already reviewed                             |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | false                 |     | O                   |                     |                     |
| 6   |           |                                              |     | true                  |     |                     |                     | O                   |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.Invalid("not enrolled") |     |           |                     | O                   |                     |
| 11  |           |                                              |     | errs.Invalid("already reviewed") |     |         |                     |                     | O                   |
| 12  |           | Side effect: review saved                    |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 14. `course.app.UpdateReviewHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.UpdateReviewHandler                            |     |     | Function Name      |     |     |     |     |     | UpdateReviewHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify review field updates and not-found handling       |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | review found                                 |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.NotFound         |     |                     | O                   |
| 8   |           | Side effect: review saved                    |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 15. `course.app.DeleteReviewHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.DeleteReviewHandler                            |     |     | Function Name      |     |     |     |     |     | DeleteReviewHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify review deletion and not-found handling             |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | review found                                 |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.NotFound         |     |                     | O                   |
| 8   |           | Side effect: review deleted                   |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 16. `course.app.BookmarkCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.BookmarkCourseHandler                          |     |     | Function Name      |     |     |     |     |     | BookmarkCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 45                                                       |     |     | Lack of test cases |     |     |     |     |     | 4          |     |     |                  |
| Test requirement |     | Verify bookmark toggle: create (published), delete (already), errors for not published/not found |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 4                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 2   | 0   | 4                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             | UTCID04             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | course found                                 |     |                       |     |                     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   | O                   | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     |                     |                     | O                   |
| 4   |           | course published                             |     |                       |     |                     |                     |                     |                     |
| 5   |           |                                              |     | true                  |     | O                   | O                   |                     |                     |
| 6   |           |                                              |     | false                 |     |                     |                     | O                   |                     |
| 7   |           | already bookmarked                           |     |                       |     |                     |                     |                     |                     |
| 8   |           |                                              |     | false                 |     | O                   |                     |                     |                     |
| 9   |           |                                              |     | true                  |     |                     | O                   |                     |                     |
| 10  | Confirm   | Return                                       |     |                       |     |                     |                     |                     |                     |
| 11  |           | error                                        |     |                       |     |                     |                     |                     |                     |
| 12  |           |                                              |     | nil                   |     | O                   | O                   |                     |                     |
| 13  |           |                                              |     | errs.Invalid("course not published") |     |          |                     |                     | O                   |                     |
| 14  |           |                                              |     | errs.NotFound         |     |                     |                     |                     | O                   |
| 15  |           | Side effect: bookmark created                |     |                       |     |                     |                     |                     |                     |
| 16  |           |                                              |     | true                  |     | O                   |                     |                     |                     |
| 17  |           | Side effect: bookmark deleted                |     |                       |     |                     |                     |                     |                     |
| 18  |           |                                              |     | true (toggle)         |     |                     | O                   |                     |                     |
| 19  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   | A                   | A                   |
| 20  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   | P                   |
| 21  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 22  |           | Defect ID                                   |     |                       |     |                     |                     |                     |                     |

---

## 17. `course.app.HideCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.HideCourseHandler                              |     |     | Function Name      |     |     |     |     |     | HideCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 35                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify toggling course hidden status with permission check |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | has permission (admin/instructor)            |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.Unauthenticated  |     |                     | O                   |
| 8   |           | Side effect: course hidden toggled and saved |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 18. `course.app.SubmitCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.SubmitCourseHandler                            |     |     | Function Name      |     |     |     |     |     | SubmitCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify course submission: draft→pending, reject if not draft |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | course status is draft                       |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false (e.g. pending) |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.Invalid           |     |                     | O                   |
| 8   |           | Side effect: course saved with pending status |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |

---

## 19. `course.app.DeclineCourseHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.DeclineCourseHandler                           |     |     | Function Name      |     |     |     |     |     | DeclineCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 35                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course decline: pending→deleted, reject if not pending or not found |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | course found                                 |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     |                     | O                   |
| 4   |           | course status is pending                     |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | true                  |     | O                   |                     |                     |
| 6   |           |                                              |     | false                 |     |                     | O                   |                     |
| 7   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 8   |           | error                                        |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.Invalid("course is not pending") |     |           |                     | O                   |                     |
| 11  |           |                                              |     | errs.NotFound         |     |                     |                     | O                   |
| 12  |           | Side effect: course deleted and saved        |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 20. `course.app.CreateDraftVersionHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.CreateDraftVersionHandler                      |     |     | Function Name      |     |     |     |     |     | CreateDraftVersionHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 50                                                       |     |     | Lack of test cases |     |     |     |     |     | 4          |     |     |                  |
| Test requirement |     | Verify draft version creation: original→draft, reject if already has draft, draft-of-draft, wrong instructor |     |                    |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 4                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 3   | 0   | 4                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             | UTCID04             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | course found                                 |     |                       |     |                     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   | O                   | O                   | O                   |
| 3   |           | already has draft version                    |     |                       |     |                     |                     |                     |                     |
| 4   |           |                                              |     | false                 |     | O                   |                     |                     |                     |
| 5   |           |                                              |     | true                  |     |                     | O                   |                     |                     |
| 6   |           | source is draft version                      |     |                       |     |                     |                     |                     |                     |
| 7   |           |                                              |     | false                 |     | O                   |                     |                     |                     |
| 8   |           |                                              |     | true                  |     |                     |                     | O                   |                     |
| 9   |           | correct instructor                           |     |                       |     |                     |                     |                     |                     |
| 10  |           |                                              |     | true                  |     | O                   |                     |                     |                     |
| 11  |           |                                              |     | false                 |     |                     |                     |                     | O                   |
| 12  | Confirm   | Return                                       |     |                       |     |                     |                     |                     |                     |
| 13  |           | error                                        |     |                       |     |                     |                     |                     |                     |
| 14  |           |                                              |     | nil                   |     | O                   |                     |                     |                     |
| 15  |           |                                              |     | errs.Invalid("already has draft") |     |           |                     | O                   |                     |                     |
| 16  |           |                                              |     | errs.Invalid("cannot create draft of draft") |     |         |                     |                     | O                   |                     |
| 17  |           |                                              |     | errs.Unauthenticated  |     |                     |                     |                     | O                   |
| 18  |           | Side effect: draft created and saved         |     |                       |     |                     |                     |                     |                     |
| 19  |           |                                              |     | true                  |     | O                   |                     |                     |                     |
| 20  |           |                                              |     | false                 |     |                     | O                   | O                   | O                   |
| 21  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   | A                   |
| 22  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   | P                   |
| 23  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 24  |           | Defect ID                                   |     |                       |     |                     |                     |                     |                     |

---

## 21. `course.app.MoveSectionHandler`

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.MoveSectionHandler                             |     |     | Function Name      |     |     |     |     |     | MoveSectionHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify section reordering with authorization check       |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | user editable                                |     |                       |     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     |
| 3   |           |                                              |     | false                 |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | error                                        |     |                       |     |                     |                     |
| 6   |           |                                              |     | nil                   |     | O                   |                     |
| 7   |           |                                              |     | errs.Unauthenticated  |     |                     | O                   |
| 8   |           | Side effect: course saved                    |     |                       |     |                     |                     |
| 9   |           |                                              |     | true                  |     | O                   |                     |
| 10  |           |                                              |     | false                 |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |
