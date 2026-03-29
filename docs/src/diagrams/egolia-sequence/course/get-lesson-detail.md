# Sequence GetLessonDetail

:::info
Lấy chi tiết nội dung của 1 bài học cụ thể (thường là 1 video stream từ MinIO).
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
  control LessonController as LC
  control CourseApp as CA
  database CourseDB as CDB
end box

box "MinIO Storage" #LightCoral
  control MinIOClient as MC
  storage ObjectStorage as OS
end box

L -> WA: Click on lesson in sidebar
activate L
activate WA

WA -> GW: GET /lessons/{lessonId}
activate GW
GW -> GW: Validate JWT, extract userID
GW -> LC: Forward request
activate LC

LC -> CA: GetLessonDetail(lessonId, userID)
activate CA

CA -> CDB: Find lesson with enrollment check
activate CDB
CA <-- CDB: Lesson data
deactivate CDB

CA -> CDB: Verify enrollment
activate CDB

alt Not enrolled
  CA <-- CDB: Not found
  deactivate CDB
  LC <-- CA: 403 Forbidden
  GW <-- LC: Error
  deactivate LC
  WA <-- GW: Error
  deactivate GW
  WA -> L: Display access denied
  deactivate WA
  deactivate L
else Enrolled
  CA <-- CDB: Enrollment confirmed
  deactivate CDB

  alt Video Lesson
    CA -> MC: Get pre-signed URL for video streaming
    activate MC
    MC -> MC: Generate signed GET URL\n(expires in 4 hours)
    CA <-- MC: Streaming URL
    deactivate MC
  else Test Lesson
    CA -> CDB: Get test questions (without answers)
    activate CDB
    CA <-- CDB: Questions without correct answers
    deactivate CDB
  end

  CA -> CDB: Get user's progress for this lesson
  activate CDB
  CA <-- CDB: Progress (or null if first time)
  deactivate CDB

  LC <-- CA: LessonDetailDTO
  deactivate CA
  GW <-- LC: 200 OK
  deactivate LC
  WA <-- GW: Lesson content
  deactivate GW

  alt Video Lesson
    WA -> OS: Stream video from signed URL
    activate OS
    WA <-- OS: Video stream
    deactivate OS
    WA -> L: Display video player\nwith resume position
  else Test Lesson
    WA -> L: Display test questions
  end
  deactivate WA
  deactivate L
end

@enduml
```

<!-- diagram id="sequence-egolia-course-get-lesson-detail" -->
