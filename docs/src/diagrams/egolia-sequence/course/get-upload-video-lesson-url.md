# Sequence GetUploadVideoLessonUrl

:::info
Lấy Pre-signed URL để frontend upload file video trực tiếp lên MinIO.
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
  control LessonController as LC
  control CourseApp as CA
  database CourseDB as CDB
end box

box "MinIO Storage" #LightCoral
  control MinIOClient as MC
  storage ObjectStorage as OS
end box

I -> WA: Select video file to upload
activate I
activate WA

WA -> GW: POST /lessons/{lessonId}/upload-url\n{filename, contentType}
activate GW
GW -> GW: Validate JWT
GW -> LC: Forward request
activate LC

LC -> CA: GetUploadVideoLessonUrl(lessonId, filename, instructorID)
activate CA

CA -> CDB: Find lesson with section and course
activate CDB
CA <-- CDB: Lesson data
deactivate CDB

CA -> CA: Verify instructor ownership

alt Not course owner
  LC <-- CA: 403 Forbidden
  GW <-- LC: Error
  deactivate LC
  WA <-- GW: Error
  deactivate GW
  WA -> I: Display error
  deactivate WA
  deactivate I
else Is owner
  CA -> MC: Generate pre-signed PUT URL
  activate MC
  MC -> MC: Create signed URL\n(expires in 15 min)
  CA <-- MC: Pre-signed URL
  deactivate MC

  LC <-- CA: {uploadUrl, objectKey}
  deactivate CA
  GW <-- LC: 200 OK with upload URL
  deactivate LC
  WA <-- GW: Pre-signed URL
  deactivate GW

  WA -> OS: Direct upload video file\n(PUT to pre-signed URL)
  activate OS
  WA <-- OS: 200 OK
  deactivate OS

  WA -> GW: PATCH /lessons/{lessonId}\n{videoURL: objectKey}
  activate GW
  GW -> LC: Update lesson video URL
  activate LC
  LC -> CA: EditLesson(lessonId, {videoURL})
  activate CA
  CA -> CDB: Update lesson
  activate CDB
  CA <-- CDB: Success
  deactivate CDB
  LC <-- CA: Updated lesson
  deactivate CA
  GW <-- LC: 200 OK
  deactivate LC
  WA <-- GW: Success
  deactivate GW

  WA -> I: Display upload complete
  deactivate WA
  deactivate I
end

@enduml
```

<!-- diagram id="sequence-egolia-course-get-upload-video-url" -->
