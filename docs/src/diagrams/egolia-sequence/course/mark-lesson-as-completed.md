# Sequence MarkLessonAsCompleted

:::info
User tự đánh dấu hoàn thành (khi xem >= 80%), hoặc hệ thống tự động đánh dấu khi đạt 100%.
:::

```plantuml
@startuml
autonumber

skinparam BoxPadding 10

actor Learner as L
boundary WebApp as WA

box "API Gateway" #LightBlue
  control "API Gateway" as GW
end box

box "Course Service" #LightYellow
  control ProgressController as PC
  control CourseApp as CA
  entity LessonProgress as LP
  database CourseDB as CDB
end box

L -> WA: Complete watching video (>=80%)
activate L
activate WA

note over WA: Auto-trigger when video\nreaches 80% or manual mark

WA -> GW: POST /lessons/{lessonId}/complete
activate GW
GW -> GW: Validate JWT
GW -> PC: Forward request
activate PC

PC -> CA: MarkLessonAsCompleted(lessonId, userID)
activate CA

CA -> CDB: Find lesson progress
activate CDB
CA <-- CDB: Progress data
deactivate CDB

CA -> LP: Mark as completed
activate LP
LP -> LP: Set isCompleted = true
CA <-- LP: Updated progress
deactivate LP

CA -> CDB: Update progress
activate CDB
CA <-- CDB: Success
deactivate CDB

PC <-- CA: ProgressDTO
deactivate CA
GW <-- PC: 200 OK
deactivate PC
WA <-- GW: Success
deactivate GW

WA -> L: Update UI: show lesson completed
deactivate WA
deactivate L

@enduml
```

<!-- diagram id="sequence-egolia-course-mark-lesson-completed" -->
