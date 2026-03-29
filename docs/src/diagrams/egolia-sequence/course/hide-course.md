# Sequence HideCourse

:::info
Admin ẩn một khóa học đang Published.
:::

```plantuml
@startuml
autonumber

skinparam BoxPadding 10

actor Admin as A
boundary WebApp as WA

box "API Gateway" #LightBlue
  control "API Gateway" as GW
end box

box "Course Service" #LightYellow
  control AdminCourseController as ACC
  control CourseApp as CA
  entity Course as C
  database CourseDB as CDB
end box

A -> WA: Click "Hide" on published course
activate A
activate WA
WA -> WA: Display confirmation dialog

A -> WA: Confirm hide

WA -> GW: POST /admin/courses/{courseId}/hide
activate GW
GW -> GW: Validate JWT, check admin role
GW -> ACC: Forward request
activate ACC

ACC -> CA: HideCourse(courseId, adminID)
activate CA

CA -> CDB: Find course
activate CDB

alt Course not found
  CA <-- CDB: Not found
  deactivate CDB
  ACC <-- CA: 404 Not Found
  GW <-- ACC: Error
  deactivate ACC
  WA <-- GW: Error
  deactivate GW
  WA -> A: Display error
  deactivate WA
  deactivate A
else Course found
  CA <-- CDB: Course data
  deactivate CDB

  CA -> CA: Validate course is published

  alt Course not published
    ACC <-- CA: 400 Bad Request
    GW <-- ACC: Error
    deactivate ACC
    WA <-- GW: "Only published courses can be hidden"
    deactivate GW
    WA -> A: Display error
    deactivate WA
    deactivate A
  else Course is published
    CA -> C: Update status to hidden
    activate C
    C -> C: Set status = 'hidden'
    CA <-- C: Updated course
    deactivate C

    CA -> CDB: Save status change
    activate CDB
    CA <-- CDB: Success
    deactivate CDB

    note over CA: Enrolled users can still access

    ACC <-- CA: CourseDTO
    deactivate CA
    GW <-- ACC: 200 OK
    deactivate ACC
    WA <-- GW: Hide success
    deactivate GW
    WA -> A: Update course status in UI\n(no longer visible to new learners)
    deactivate WA
    deactivate A
  end
end

@enduml
```

<!-- diagram id="sequence-egolia-course-hide-course" -->
