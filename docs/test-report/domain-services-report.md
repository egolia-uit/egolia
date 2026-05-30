# Domain Services Test Report

This report documents the planned unit test cases for the 5 domain services in `internal/course/domain/`. Each service gets one or more **Sheet** sections following the transposed matrix layout.

---

## 1. AuthorizationSvc — HasGetCourseDetailPermission

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.domain.AuthorizationSvc                           |     |     | Function Name      |     |     |     |     |     | HasGetCourseDetailPermission |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 6          |     |     |                  |
| Test requirement |     | Verify user permissions for viewing course details based on role, ownership, and enrollment |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 6                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 3          | 3   | 0   | 6                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             | UTCID04             | UTCID05             | UTCID06             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | userRoles                                    |     |                       |     |                     |                     |                     |                     |                     |                     |
| 2   |           |                                              |     | contains "admin"       |     | O                   |                     |                     |                     |                     |                     |
| 3   |           |                                              |     | contains "instructor"  |     |                     | O                   |                     |                     |                     |                     |
| 4   |           |                                              |     | neither               |     |                     |                     | O                   | O                   | O                   | O                   |
| 5   |           | courseRepo.Get                               |     |                       |     |                     |                     |                     |                     |                     |                     |
| 6   |           |                                              |     | returns course        |     | O                   | O                   | O                   | O                   | O                   |                     |
| 7   |           |                                              |     | returns error         |     |                     |                     |                     |                     |                     | O                   |
| 8   |           | instructor match                             |     |                       |     |                     |                     |                     |                     |                     |                     |
| 9   |           |                                              |     | true                  |     |                     | O                   |                     |                     |                     |                     |
| 10  |           |                                              |     | false                 |     |                     |                     | O                   | O                   | O                   |                     |
| 11  |           | course.IsPublic()                            |     |                       |     |                     |                     |                     |                     |                     |                     |
| 12  |           |                                              |     | true                  |     |                     |                     | O                   | O                   |                     |                     |
| 13  |           |                                              |     | false                 |     |                     |                     |                     |                     | O                   |                     |
| 14  |           | enrollmentRepo.ExistsByCourseAndLearner      |     |                       |     |                     |                     |                     |                     |                     |                     |
| 15  |           |                                              |     | true                  |     |                     |                     | O                   |                     |                     |                     |
| 16  |           |                                              |     | false                 |     |                     |                     |                     | O                   |                     |                     |
| 17  | Confirm   | Return                                       |     |                       |     |                     |                     |                     |                     |                     |                     |
| 18  |           | bool                                         |     |                       |     |                     |                     |                     |                     |                     |                     |
| 19  |           |                                              |     | true                  |     | O                   | O                   | O                   |                     |                     |                     |
| 20  |           |                                              |     | false                 |     |                     |                     |                     | O                   | O                   | O                   |
| 21  |           | error                                        |     |                       |     |                     |                     |                     |                     |                     |                     |
| 22  |           |                                              |     | nil                   |     | O                   | O                   | O                   | O                   | O                   |                     |
| 23  |           |                                              |     | propagated            |     |                     |                     |                     |                     |                     | O                   |
| 24  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   | N                   | A                   | A                   | A                   |
| 25  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   | P                   | P                   | P                   |
| 26  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 27  |           | Defect ID                                   |     |                       |     |                     |                     |                     |                     |                     |                     |

---

## 2. AuthorizationSvc — HasHideCoursePermission

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.domain.AuthorizationSvc                           |     |     | Function Name      |     |     |     |     |     | HasHideCoursePermission |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 15                                                       |     |     | Lack of test cases |     |     |     |     |     | 5          |     |     |                  |
| Test requirement |     | Verify user permissions for toggling course hidden status |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 5                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 3   | 0   | 5                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             | UTCID04             | UTCID05             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | userRoles                                    |     |                       |     |                     |                     |                     |                     |                     |
| 2   |           |                                              |     | contains "admin"       |     | O                   |                     |                     |                     |                     |
| 3   |           |                                              |     | contains "instructor"  |     |                     | O                   | O                   |                     |                     |
| 4   |           |                                              |     | neither               |     |                     |                     |                     | O                   | O                   |
| 5   |           | courseRepo.Get                               |     |                       |     |                     |                     |                     |                     |                     |
| 6   |           |                                              |     | returns course        |     | O                   | O                   | O                   | O                   |                     |
| 7   |           |                                              |     | returns error         |     |                     |                     |                     |                     | O                   |
| 8   |           | instructor match                             |     |                       |     |                     |                     |                     |                     |                     |
| 9   |           |                                              |     | true                  |     |                     | O                   |                     |                     |                     |
| 10  |           |                                              |     | false                 |     |                     |                     | O                   | O                   |                     |
| 11  | Confirm   | Return                                       |     |                       |     |                     |                     |                     |                     |                     |
| 12  |           | bool                                         |     |                       |     |                     |                     |                     |                     |                     |
| 13  |           |                                              |     | true                  |     | O                   | O                   |                     |                     |                     |
| 14  |           |                                              |     | false                 |     |                     |                     | O                   | O                   | O                   |
| 15  |           | error                                        |     |                       |     |                     |                     |                     |                     |                     |
| 16  |           |                                              |     | nil                   |     | O                   | O                   | O                   | O                   |                     |
| 17  |           |                                              |     | propagated            |     |                     |                     |                     |                     | O                   |
| 18  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   | A                   | A                   | A                   |
| 19  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   | P                   | P                   |
| 20  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 21  |           | Defect ID                                   |     |                       |     |                     |                     |                     |                     |                     |

---

## 3. DeleteCourseSvc — Handle

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.domain.DeleteCourseSvc                            |     |     | Function Name      |     |     |     |     |     | Handle      |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 33                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify deletion of course: block if enrollments exist, succeed otherwise |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | EnrollmentRepo                               |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | nil                   |     |                     |                     | O                   |
| 3   |           |                                              |     | not nil               |     | O                   | O                   |                     |
| 4   |           | EnrollmentRepo.ExistsByCourseID              |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | false                 |     | O                   |                     |                     |
| 6   |           |                                              |     | true                  |     |                     | O                   |                     |
| 7   |           |                                              |     | error from repo       |     |                     |                     |                     |
| 8   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 10  |           |                                              |     | errs.Internal         |     |                     |                     | O                   |
| 11  |           |                                              |     | errs.CourseHasEnrollment |     |                   | O                   |                     |
| 12  |           | Side effect: Course.Delete called            |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | true (deletedAt set)  |     | O                   |                     |                     |
| 14  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 15  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 16  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 17  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 18  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 4. EnrollInCourseSvc — Handle

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.domain.EnrollInCourseSvc                          |     |     | Function Name      |     |     |     |     |     | Handle      |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 38                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify enrollment creation: validate learner, prevent duplicate enrollments |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | learnerID                                    |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | empty ("")            |     |                     |                     | O                   |
| 3   |           |                                              |     | valid string          |     | O                   | O                   |                     |
| 4   |           | enrollRepo.ExistsByCourseAndLearner          |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | false                 |     | O                   |                     |                     |
| 6   |           |                                              |     | true                  |     |                     | O                   |                     |
| 7   |           |                                              |     | error from repo       |     |                     |                     |                     |
| 8   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 9   |           | *Enrollment                                  |     |                       |     |                     |                     |                     |
| 10  |           |                                              |     | not nil (created)     |     | O                   |                     |                     |
| 11  |           |                                              |     | nil                   |     |                     | O                   | O                   |
| 12  |           | error                                        |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | nil                   |     | O                   |                     |                     |
| 14  |           |                                              |     | errs.Invalid("learner has already enrolled") |     |  | O                   |                     |
| 15  |           |                                              |     | errs.Invalid("learner id is required") |     |       |                     |                     | O                   |
| 16  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 17  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 18  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 19  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 5. FinishCourseSvc — Handle

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.domain.FinishCourseSvc                            |     |     | Function Name      |     |     |     |     |     | Handle      |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 25                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course completion: only the enrolled learner can mark completion |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 1   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | params.Enrollment                            |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | nil                   |     |                     |                     | O                   |
| 3   |           |                                              |     | not nil               |     | O                   | O                   |                     |
| 4   |           | learnerID match                              |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | same (LearnerID == params.LearnerID) |     | O |                     |                     |
| 6   |           |                                              |     | different              |     |                     | O                   |                     |
| 7   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 8   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 9   |           |                                              |     | errs.Invalid("only the learner can finish the course") |     |  | O                   |                     |
| 10  |           |                                              |     | errs.Invalid("enrollment is required") |     |       |                     |                     | O                   |
| 11  |           | Side effect: Enrollment.Complete called      |     |                       |     |                     |                     |                     |
| 12  |           |                                              |     | true (completedAt set)|     | O                   |                     |                     |
| 13  |           |                                              |     | false                 |     |                     | O                   | O                   |
| 14  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | B                   |
| 15  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 16  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 17  |           | Defect ID                                   |     |                       |     |                     |                     |                     |

---

## 6. ReviewPolicySvc — Handle

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.domain.ReviewPolicySvc                            |     |     | Function Name      |     |     |     |     |     | Handle      |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 21                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify review policy: learner must be enrolled and not have already reviewed |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | hasEnrolled                                  |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | true                  |     | O                   |                     | O                   |
| 3   |           |                                              |     | false                 |     |                     | O                   |                     |
| 4   |           | hasReviewed                                  |     |                       |     |                     |                     |                     |
| 5   |           |                                              |     | false                 |     | O                   |                     |                     |
| 6   |           |                                              |     | true                  |     |                     |                     | O                   |
| 7   | Confirm   | Return error                                 |     |                       |     |                     |                     |                     |
| 8   |           |                                              |     | nil                   |     | O                   |                     |                     |
| 9   |           |                                              |     | errs.Invalid("learner has not enrolled in this course") |     |  | O                   |                     |
| 10  |           |                                              |     | errs.Invalid("learner has already reviewed this course") |     | |                     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 12  |           | Passed/Failed                               |     |                       |     | P                   | P                   | P                   |
| 13  |           | Executed Date                               |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                   |     |                       |     |                     |                     |                     |
