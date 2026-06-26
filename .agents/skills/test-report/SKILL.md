---
name: test-report
description: Test report as formatted
---

# Test Report Template

## Guidance of whitebox (unit) testing

- This is an template for testing a function (whitebox)
- Each of the call in a test, calling a function should produce a single sheet for each
- For those value of the argument which aren't provided (use default value in go), don't need to mention
- The function name should be in the format of `{project}.StructName`
  > Ex: `course.domain.FinishCourseSvc`, `course.app.GetCourseLandingPageHandler`
- The defect ID should be mentioned if there is any defect found during the test, otherwise leave it blank.
  The ID should be in form of "DF-{ProjectName-in-short}-{StructName-in-short}-01"
  > Ex: `C-FCS-01` for Course - FinishCourseSvc - 01
- In the "Confirm" section, do not just write "Result" (Success/Error).
  You must list the important fields of the struct/return value (e.g., Name, Status).
  You may skip ID or timestamps if they are just "not nil", but for logic-critical fields, list them.
- If an error is expected, write a sample error message or the error type.
  Usually the error thrown in the internal/errs package of the project for go service
  > Ex: "Code: 'CodeLessonGenerateOrderFailed' Message: failed to generate order between %s and %s"
- DO NOT change the format of the table (transposing,...), otherwise the parsing script may not work.

## Detailed Layout Explanation (Stylesheet)

The "Sheet" section uses a **transposed matrix** layout, which differs from standard test case tables.

### Structure

1.  **Columns represent Test Cases**:
    - The header row starts with empty structure cells.
    - From the 6th column onwards, each column represents a unique Test Case ID (e.g., `UTCID01`, `UTCID02`).
2.  **Rows represent Variables/Values**:
    - **Condition Section**: Lists input variables.
      - The main variable name is in the second column (e.g., "a", "Name Length").
      - Specific values for that variable are listed in subsequent rows in the 4th column (e.g., "0", "1", "100").
      - An `O` (or `X`) is placed in the intersection of a Value Row and a Test Case Column to indicate that specific input is used for that test case.
    - **Confirm/Return Section**: Lists expected outputs.
      - Similar to conditions, possible return values or states are listed in rows.
      - An `O` marks the expected result for that column's test case.
3.  **Result Section**:
    - Contains metadata for the test execution (Type, Pass/Fail status, Date, Defect ID).

### Visual Guide

```text
| #   |           | Variable Name | ... | Value | ... | UTCID01 | UTCID02 |
| --- | --------- | ------------- | --- | ----- | --- | ------- | ------- |
| 1   | Condition | Input A       |     |       |     |         |         |
| 2   |           |               |     | Val 1 |     | O       |         | <- UTCID01 uses Val 1
| 3   |           |               |     | Val 2 |     |         | O       | <- UTCID02 uses Val 2
| 4   | Confirm   | Output        |     |       |     |         |         |
| 5   |           |               |     | Error |     | O       |         | <- UTCID01 expects Error
| 6   |           |               |     | OK    |     |         | O       | <- UTCID02 expects OK
```

### Meta

|                  |     |                                                                          |     |     |                    |     |     |     |     | 0   | 1          | 2   | 3   | 4                |
| ---------------- | --- | ------------------------------------------------------------------------ | --- | --- | ------------------ | --- | --- | --- | --- | --- | ---------- | --- | --- | ---------------- |
| Function Code    |     | Function1                                                                |     |     | Function Name      |     |     |     |     |     | Function A |     |     |                  |
| Created By       |     | <Developer Name>                                                         |     |     | Executed By        |     |     |     |     |     |            |     |     |                  |
| Lines of code    |     | 100                                                                      |     |     | Lack of test cases |     |     |     |     |     | -5         |     |     |                  |
| Test requirement |     | <Brief description about requirements which are tested in this function> |     |     |                    |     |     |     |     |     |            |     |     |                  |
| Passed           |     | Failed                                                                   |     |     | Untested           |     |     |     |     |     | N          | A   | B   | Total Test Cases |
| 1                |     | 1                                                                        |     |     | 5                  |     |     |     |     |     | 5          | 1   | 1   | 7                |

### Sheet

|     |           |                                              |     |                       |     | UTCID01             | UTCID02             | UTCID02             | UTCID02             | UTCID02             | UTCID02             | UTCID07             |
| --- | --------- | -------------------------------------------- | --- | --------------------- | --- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| 1   | Condition | Precondition                                 |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 2   |           | a                                            |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 3   |           |                                              |     | -2                    |     | O                   |                     |                     |                     |                     |                     |                     |
| 4   |           |                                              |     | -1                    |     |                     |                     |                     |                     |                     |                     | O                   |
| 5   |           |                                              |     | 0                     |     |                     | O                   | O                   | O                   |                     |                     |                     |
| 6   |           |                                              |     | 1                     |     |                     |                     |                     |                     | O                   | O                   |                     |
| 7   |           | b                                            |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 8   |           |                                              |     | 0                     |     |                     | O                   | O                   |                     |                     |                     |                     |
| 9   |           |                                              |     | -2                    |     |                     |                     |                     |                     | O                   | O                   | O                   |
| 10  |           |                                              |     | 2                     |     |                     |                     |                     | O                   |                     |                     |                     |
| 11  |           | c                                            |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 12  |           |                                              |     | 0                     |     |                     | O                   |                     |                     |                     |                     |                     |
| 13  |           |                                              |     | 1                     |     |                     |                     | O                   | O                   | O                   |                     |                     |
| 14  |           |                                              |     | 3                     |     |                     |                     |                     |                     |                     |                     | O                   |
| 15  |           |                                              |     | 5                     |     |                     |                     |                     |                     |                     | O                   |                     |
| 16  | Confirm   | Return                                       |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 17  |           | list                                         |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 18  |           |                                              |     |                       |     | O                   |                     | O                   |                     |                     | O                   |                     |
| 19  |           |                                              |     | size = 0              |     |                     | O                   |                     |                     |                     |                     |                     |
| 20  |           |                                              |     | {-1/2}                |     |                     |                     |                     | O                   |                     |                     |                     |
| 21  |           |                                              |     | {1,1}                 |     |                     |                     |                     |                     | O                   |                     |                     |
| 22  |           |                                              |     | {1,-3}                |     |                     |                     |                     |                     |                     |                     | O                   |
| 23  |           | Exception                                    |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 24  |           |                                              |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 25  |           | Log message                                  |     |                       |     |                     |                     |                     |                     |                     |                     |                     |
| 26  |           |                                              |     | "please input a>= -1" |     | O                   |                     |                     |                     |                     |                     |                     |
| 27  | Result    | Type(N : Normal, A : Abnormal, B : Boundary) |     |                       |     | A                   | N                   | N                   | N                   | N                   | N                   | B                   |
| 28  |           | Passed/Failed                                |     |                       |     | P                   | F                   |                     |                     |                     |                     |                     |
| 29  |           | Executed Date                                |     |                       |     | 2007-02-26 00:00:00 | 2007-02-26 00:00:00 | 2007-02-26 00:00:00 | 2007-02-26 00:00:00 | 2007-02-26 00:00:00 | 2007-02-26 00:00:00 | 2007-03-03 00:00:00 |
| 30  |           | Defect ID                                    |     |                       |     |                     | DF-M-FN-01          |                     |                     |                     |                     |                     |

Look at the @./domainreport/attribute.md for real example
