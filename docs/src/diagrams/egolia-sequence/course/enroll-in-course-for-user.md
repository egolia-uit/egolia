# Sequence EnrollInCourseForUser

:::info
Hệ thống ghi nhận trạng thái Enrolled cho user thông qua giao thức nội bộ (Proto/gRPC).
Được gọi từ Billing Service sau khi thanh toán thành công.
:::

```plantuml
@startuml
autonumber

skinparam BoxPadding 10

box "Billing Service" #LightPink
  control BillingApp as BA
end box

box "API Gateway" #LightBlue
  control "API Gateway" as GW
end box

box "Course Service" #LightYellow
  control CourseGRPCHandler as CGH
  control CourseApp as CA
  entity Enrollment as E
  database CourseDB as CDB
end box

BA -> GW: gRPC: EnrollInCourseForUser\n{userID, courseID, transactionID}
activate BA
activate GW

GW -> CGH: Forward gRPC request
activate CGH

CGH -> CA: EnrollInCourseForUser(userID, courseID, transactionID)
activate CA

CA -> CDB: Verify course exists
activate CDB
CA <-- CDB: Course data
deactivate CDB

CA -> CDB: Check existing enrollment
activate CDB

alt Already enrolled
  CA <-- CDB: Enrollment exists
  deactivate CDB
  CGH <-- CA: Already enrolled (idempotent success)
  GW <-- CGH: Success
  deactivate CGH
  BA <-- GW: Enrollment confirmed
  deactivate GW
  deactivate BA
else Not enrolled
  CA <-- CDB: No enrollment
  deactivate CDB

  CA -> E: Create Enrollment aggregate
  activate E
  E -> E: Set userID, courseID,\nenrollmentDate = NOW(),\ntransactionID for audit
  CA <-- E: Enrollment entity
  deactivate E

  CA -> CDB: Save enrollment
  activate CDB
  CA <-- CDB: Enrollment saved
  deactivate CDB

  CGH <-- CA: EnrollmentDTO
  deactivate CA
  GW <-- CGH: Success
  deactivate CGH
  BA <-- GW: Enrollment confirmed
  deactivate GW
  deactivate BA
end

@enduml
```

<!-- diagram id="sequence-egolia-course-enroll-for-user" -->
