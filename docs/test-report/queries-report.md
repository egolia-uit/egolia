# App Query Handler Test Report

This report documents the planned unit test cases for all 16 query handlers in `internal/course/app/`. Each handler gets a **Sheet** section following the transposed matrix layout, based on mockery-generated read model mocks.

---

## 1. GetCourseHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetCourseHandler                              |     |     | Function Name      |     |     |     |     |     | GetCourseHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 26                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving a single course by ID from read model  |     |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourse                          |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns course         |     | O                   |                     |
| 3   |           |                                              |     | returns error         |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Course                                      |     |                       |     |                     |                     |
| 6   |           |                                              |     | not nil               |     | O                   |                     |
| 7   |           |                                              |     | nil                   |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |
| 10  |           |                                              |     | propagated            |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 2. GetCourseDetailHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetCourseDetailHandler                        |     |     | Function Name      |     |     |     |     |     | GetCourseDetailHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 47                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify course detail retrieval with authorization check (HasGetCourseDetailPermission) |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | authorizationSvc.HasGetCourseDetailPermission |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | (true, nil)           |     | O                   |                     |                     |
| 3   |           |                                              |     | (false, nil)          |     |                     | O                   |                     |
| 4   |           |                                              |     | (false, error)        |     |                     |                     | O                   |
| 5   |           | readModel.GetCourseDetail                    |     |                       |     |                     |                     |                     |
| 6   |           |                                              |     | not called            |     |                     | O                   | O                   |
| 7   |           |                                              |     | returns courseDetail  |     | O                   |                     |                     |
| 8   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 9   |           | *CourseDetail                                |     |                       |     |                     |                     |                     |
| 10  |           |                                              |     | not nil               |     | O                   |                     |                     |
| 11  |           |                                              |     | nil                   |     |                     | O                   | O                   |
| 12  |           | error                                        |     |                       |     |                     |                     |                     |
| 13  |           |                                              |     | nil                   |     | O                   |                     |                     |
| 14  |           |                                              |     | errs.Unauthorized     |     |                     | O                   |                     |
| 15  |           |                                              |     | propagated            |     |                     |                     | O                   |
| 16  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 17  |           | Passed/Failed                                |     |                       |     | P                   | P                   | P                   |
| 18  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 19  |           | Defect ID                                    |     |                       |     |                     |                     |                     |

---

## 3. GetCourseForUpdateHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetCourseForUpdateHandler                     |     |     | Function Name      |     |     |     |     |     | GetCourseForUpdateHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 43                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving course draft version for editing; nil check returns DraftCourseNotFound |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourseDetailForUpdate           |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns courseDetail  |     | O                   |                     |
| 3   |           |                                              |     | returns nil           |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *CourseDetail                                |     |                       |     |                     |                     |
| 6   |           |                                              |     | not nil               |     | O                   |                     |
| 7   |           |                                              |     | nil                   |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |
| 10  |           |                                              |     | errs.DraftCourseNotFound |     |                   | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 4. GetCourseLandingPageHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetCourseLandingPageHandler                   |     |     | Function Name      |     |     |     |     |     | GetCourseLandingPageHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 35                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify course landing page returns published course (Hidden=false, Status=Approved) |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 1   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourseByID                      |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns course (Hidden=false, Status=Approved) |     | O |                     |
| 3   |           |                                              |     | returns error         |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Course                                      |     |                       |     |                     |                     |
| 6   |           |                                              |     | not nil               |     | O                   |                     |
| 7   |           |                                              |     | nil                   |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   |                     |
| 10  |           |                                              |     | propagated            |     |                     | O                   |
| 11  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   |
| 12  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 13  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 14  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 5. GetPublishedCoursesHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetPublishedCoursesHandler                    |     |     | Function Name      |     |     |     |     |     | GetPublishedCoursesHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 28                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving published courses filtered by status=approved and hidden=false |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourses                         |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated results |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated  |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Course]                           |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 6. GetSystemCoursesHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetSystemCoursesHandler                       |     |     | Function Name      |     |     |     |     |     | GetSystemCoursesHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 23                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving all system courses (passthrough to read model without filters) |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourses                         |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated results |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated  |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Course]                           |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 7. GetMyCoursesHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetMyCoursesHandler                           |     |     | Function Name      |     |     |     |     |     | GetMyCoursesHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 32                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving courses belonging to the authenticated instructor |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetMyCourses                       |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated results |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated  |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Course]                           |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 8. GetMyEnrolledCoursesHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetMyEnrolledCoursesHandler                   |     |     | Function Name      |     |     |     |     |     | GetMyEnrolledCoursesHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 36                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving enrolled courses filtered by status=approved and hidden=false |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetMyEnrolledCourses               |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated results |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated  |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Course]                           |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 9. GetMyBookmarkedCoursesHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetMyBookmarkedCoursesHandler                 |     |     | Function Name      |     |     |     |     |     | GetMyBookmarkedCoursesHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 36                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving bookmarked courses filtered by status=approved and hidden=false |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetMyBookmarkedCourses             |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated results |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated  |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Course]                           |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 10. GetMyCertificatesHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetMyCertificatesHandler                      |     |     | Function Name      |     |     |     |     |     | GetMyCertificatesHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 33                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving certificates for the authenticated user|     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetMyCertificates                  |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated certs |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated|     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Certificate]                      |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 11. GetCourseProgressHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetCourseProgressHandler                      |     |     | Function Name      |     |     |     |     |     | GetCourseProgressHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 29                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving course-level progress for a learner    |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourseProgress                  |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns progress      |     | O                   |                     |
| 3   |           |                                              |     | returns nil/zero      |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *CourseProgress                              |     |                       |     |                     |                     |
| 6   |           |                                              |     | not nil (with data)   |     | O                   |                     |
| 7   |           |                                              |     | nil / zero progress   |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 12. GetCourseReviewsHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetCourseReviewsHandler                       |     |     | Function Name      |     |     |     |     |     | GetCourseReviewsHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 31                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving paginated reviews for a course         |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetCourseReviews                   |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns paginated reviews |     | O                 |                     |
| 3   |           |                                              |     | returns empty paginated  |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | *Paginated[Review]                           |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty Items slice     |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 13. GetLessonDetailHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetLessonDetailHandler                        |     |     | Function Name      |     |     |     |     |     | GetLessonDetailHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 40                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify lesson detail retrieval with video→test lesson fallback logic |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 1   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetVideoLessonDetail               |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | returns videoLesson    |     | O                   |                     |                     |
| 3   |           |                                              |     | returns LessonNotFound |     |                     | O                   |                     |
| 4   |           |                                              |     | returns other error   |     |                     |                     | O                   |
| 5   |           | readModel.GetTestLessonDetail                |     |                       |     |                     |                     |                     |
| 6   |           |                                              |     | not called            |     | O                   |                     | O                   |
| 7   |           |                                              |     | returns testLesson    |     |                     | O                   |                     |
| 8   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 9   |           | Lesson (interface)                           |     |                       |     |                     |                     |                     |
| 10  |           |                                              |     | *VideoLesson          |     | O                   |                     |                     |
| 11  |           |                                              |     | *TestLesson           |     |                     | O                   |                     |
| 12  |           |                                              |     | nil                   |     |                     |                     | O                   |
| 13  |           | error                                        |     |                       |     |                     |                     |                     |
| 14  |           |                                              |     | nil                   |     | O                   | O                   |                     |
| 15  |           |                                              |     | propagated            |     |                     |                     | O                   |
| 16  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   | A                   |
| 17  |           | Passed/Failed                                |     |                       |     | P                   | P                   | P                   |
| 18  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 19  |           | Defect ID                                    |     |                       |     |                     |                     |                     |

---

## 14. GetLessonCommentsHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetLessonCommentsHandler                      |     |     | Function Name      |     |     |     |     |     | GetLessonCommentsHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 29                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving comments for a lesson                   |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetLessonComments                   |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns []*LessonComment |     | O                 |                     |
| 3   |           |                                              |     | returns empty slice     |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | []*LessonComment                             |     |                       |     |                     |                     |
| 6   |           |                                              |     | with items            |     | O                   |                     |
| 7   |           |                                              |     | empty slice           |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 15. GetLessonProgressHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetLessonProgressHandler                      |     |     | Function Name      |     |     |     |     |     | GetLessonProgressHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 30                                                       |     |     | Lack of test cases |     |     |     |     |     | 2          |     |     |                  |
| Test requirement |     | Verify retrieving lesson-level progress for a learner    |     |                    |     |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 2                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 2          | 0   | 0   | 2                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- |
| 1   | Condition | readModel.GetLessonProgress                  |     |                       |     |                     |                     |
| 2   |           |                                              |     | returns progress      |     | O                   |                     |
| 3   |           |                                              |     | returns empty/zero   |     |                     | O                   |
| 4   | Confirm   | Return                                       |     |                       |     |                     |                     |
| 5   |           | LessonProgress                               |     |                       |     |                     |                     |
| 6   |           |                                              |     | populated             |     | O                   |                     |
| 7   |           |                                              |     | empty / not started   |     |                     | O                   |
| 8   |           | error                                        |     |                       |     |                     |                     |
| 9   |           |                                              |     | nil                   |     | O                   | O                   |
| 10  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | N                   |
| 11  |           | Passed/Failed                                |     |                       |     | P                   | P                   |
| 12  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          |
| 13  |           | Defect ID                                    |     |                       |     |                     |                     |

---

## 16. GetUploadVideoLessonURLHandler

### Meta

|                  |     |                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | -------------------------------------------------------- | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | course.app.GetUploadVideoLessonURLHandler                |     |     | Function Name      |     |     |     |     |     | GetUploadVideoLessonURLHandler |     |     |                  |
| Created By       |     | Plan                                                     |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 23                                                       |     |     | Lack of test cases |     |     |     |     |     | 3          |     |     |                  |
| Test requirement |     | Verify generating an upload URL for a video lesson via ObjectStorageSvc |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 3                |     | 0                                                       |     |     | 0                  |     |     |     |     |     | 1          | 2   | 0   | 3                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID03             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | objectStorageSvc.GetUploadVideoLessonURL     |     |                       |     |                     |                     |                     |
| 2   |           |                                              |     | returns url, nil      |     | O                   |                     |                     |
| 3   |           |                                              |     | returns nil, error    |     |                     | O                   |                     |
| 4   |           |                                              |     | returns nil, validation error (empty filename) |     |   |                     | O                   |
| 5   | Confirm   | Return                                       |     |                       |     |                     |                     |                     |
| 6   |           | *VideoLessonObject                           |     |                       |     |                     |                     |                     |
| 7   |           |                                              |     | not nil               |     | O                   |                     |                     |
| 8   |           |                                              |     | nil                   |     |                     | O                   | O                   |
| 9   |           | error                                        |     |                       |     |                     |                     |                     |
| 10  |           |                                              |     | nil                   |     | O                   |                     |                     |
| 11  |           |                                              |     | propagated            |     |                     | O                   |                     |
| 12  |           |                                              |     | errs.Invalid          |     |                     |                     | O                   |
| 13  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | N                   | A                   | A                   |
| 14  |           | Passed/Failed                                |     |                       |     | P                   | P                   | P                   |
| 15  |           | Executed Date                                |     |                       |     | 2026-05-30          | 2026-05-30          | 2026-05-30          |
| 16  |           | Defect ID                                    |     |                       |     |                     |                     |                     |
