# Sequence ChangeBasicCourseInfo

:::info
Cập nhật siêu dữ liệu cơ bản (tên, tác giả, giá...) mà không cần load toàn bộ nội dung khóa học.
:::

```plantuml
@startuml
autonumber

skinparam BoxPadding 10

actor Instructor as I
boundary WebApp as WA

box "API Gateway" #LightBlue
  control "API Gateway" as GW
end box

box "Course Service" #LightYellow
  control CourseController as CC
  control CourseApp as CA
  entity Course as C
  database CourseDB as CDB
end box

I -> WA: Navigate to Course Settings
activate I
activate WA

WA -> GW: GET /courses/{courseId}/settings
activate GW
GW -> CC: Forward request
activate CC
CC -> CA: GetCourseBasicInfo(courseId, instructorID)
activate CA
CA -> CDB: Get course basic info
activate CDB
CA <-- CDB: Course metadata
deactivate CDB
CC <-- CA: CourseSettingsDTO
deactivate CA
GW <-- CC: 200 OK
deactivate CC
WA <-- GW: Current settings
deactivate GW

WA -> WA: Display settings form

I -> WA: Update course info\n(title, description, price)
I -> WA: Click "Save Changes"

WA -> GW: PATCH /courses/{courseId}\n{title, description, price}
activate GW
GW -> GW: Validate JWT
GW -> CC: Forward request
activate CC

CC -> CA: ChangeBasicCourseInfo(courseId, updates, instructorID)
activate CA

CA -> CDB: Find course
activate CDB
CA <-- CDB: Course data
deactivate CDB

CA -> CA: Verify instructor ownership

alt Not course owner
  CC <-- CA: 403 Forbidden
  GW <-- CC: Error
  deactivate CC
  WA <-- GW: Error
  deactivate GW
  WA -> I: Display error
  deactivate WA
  deactivate I
else Is owner
  CA -> CA: Validate updates\n(price >= 0, title not empty)

  alt Validation failed
    CC <-- CA: 400 Bad Request
    GW <-- CC: Error
    deactivate CC
    WA <-- GW: Validation error
    deactivate GW
    WA -> I: Display error
    deactivate WA
    deactivate I
  else Validation passed
    CA -> C: Apply updates
    activate C
    C -> C: Update fields, regenerate slug if title changed
    CA <-- C: Updated course
    deactivate C

    CA -> CDB: Save changes
    activate CDB
    CA <-- CDB: Success
    deactivate CDB

    CC <-- CA: CourseDTO
    deactivate CA
    GW <-- CC: 200 OK
    deactivate CC
    WA <-- GW: Updated course
    deactivate GW
    WA -> I: Display success notification
    deactivate WA
    deactivate I
  end
end

@enduml
```

<!-- diagram id="sequence-egolia-course-change-basic-info" -->
