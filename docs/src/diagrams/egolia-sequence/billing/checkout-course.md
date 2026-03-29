# Sequence CheckoutCourse

:::info
Thực hiện thanh toán qua cổng Mock VNPay.
Flow này thể hiện communication giữa Billing Service và Course Service.
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

box "Billing Service" #LightPink
  control BillingController as BC
  control BillingApp as BA
  entity Transaction as T
  database BillingDB as BDB
end box

box "Course Service" #LightYellow
  control CourseController as CC
  control CourseApp as CA
  database CourseDB as CDB
end box

box "Payment Gateway (VNPay Mock)" #LightGray
  control VNPayMock as VN
end box

L -> WA: Click "Buy Now" on paid course
activate L
activate WA

WA -> GW: POST /billing/checkout\n{courseId}
activate GW
GW -> GW: Validate JWT, extract userID
GW -> BC: Forward request
activate BC

BC -> BA: CheckoutCourse(userID, courseId)
activate BA

BA -> GW: gRPC: GetCoursePrice(courseId)
activate GW
GW -> CC: Forward to Course Service
activate CC
CC -> CA: GetCoursePrice(courseId)
activate CA
CA -> CDB: Get course price
activate CDB
CA <-- CDB: Course price
deactivate CDB
CC <-- CA: {courseId, price, title}
deactivate CA
GW <-- CC: Course data
deactivate CC
BA <-- GW: Course price and info
deactivate GW

alt Course not found or not purchasable
  BC <-- BA: 404 Not Found
  GW <-- BC: Error
  deactivate BC
  WA <-- GW: Error
  deactivate GW
  WA -> L: Display error
  deactivate WA
  deactivate L
else Course valid
  BA -> T: Create pending Transaction
  activate T
  T -> T: Set userID, amount = price,\nstatus = 'pending',\ncreatedAt = NOW()
  BA <-- T: Transaction entity
  deactivate T

  BA -> BDB: Save transaction
  activate BDB
  BA <-- BDB: Transaction ID
  deactivate BDB

  BA -> VN: Create payment request
  activate VN
  VN -> VN: Generate payment URL\nwith transaction info
  BA <-- VN: Payment redirect URL
  deactivate VN

  BC <-- BA: {transactionId, paymentUrl}
  deactivate BA
  GW <-- BC: 200 OK
  deactivate BC
  WA <-- GW: Payment URL
  deactivate GW

  WA -> VN: Redirect to VNPay payment page
  deactivate WA
  activate VN

  L -> VN: Complete payment

  VN -> VN: Process payment

  VN -> GW: Callback: payment result\n{transactionId, status, vnp_data}
  activate GW
  deactivate VN

  GW -> BC: Forward callback
  activate BC
  BC -> BA: ProcessPaymentCallback(callbackData)
  activate BA

  BA -> BDB: Find transaction
  activate BDB
  BA <-- BDB: Transaction
  deactivate BDB

  BA -> BA: Verify callback signature

  alt Payment successful
    BA -> T: Mark as completed
    activate T
    T -> T: status = 'completed'
    BA <-- T: Updated transaction
    deactivate T

    BA -> BDB: Update transaction
    activate BDB
    BA <-- BDB: Success
    deactivate BDB

    BA -> GW: gRPC: EnrollInCourseForUser(userID, courseId)
    activate GW
    GW -> CC: Forward to Course Service
    activate CC
    CC -> CA: EnrollInCourseForUser(userID, courseId)
    activate CA
    CA -> CDB: Create enrollment
    activate CDB
    CA <-- CDB: Enrollment created
    deactivate CDB
    CC <-- CA: Success
    deactivate CA
    GW <-- CC: Enrollment confirmed
    deactivate CC
    BA <-- GW: Enrollment confirmed
    deactivate GW

    BC <-- BA: Payment success
    deactivate BA
    GW <-- BC: Redirect to success page
    deactivate BC
    WA <-- GW: Payment successful
    activate WA
    WA -> L: Display success\nRedirect to course
    deactivate WA
    deactivate L
  else Payment failed
    BA -> T: Mark as failed
    activate T
    T -> T: status = 'failed'
    BA <-- T: Updated transaction
    deactivate T
    BA -> BDB: Update transaction
    activate BDB
    BA <-- BDB: Success
    deactivate BDB
    BC <-- BA: Payment failed
    deactivate BA
    GW <-- BC: Redirect to failure page
    deactivate BC
    WA <-- GW: Payment failed
    activate WA
    WA -> L: Display payment failed
    deactivate WA
    deactivate L
  end
  deactivate GW
end

@enduml
```

<!-- diagram id="sequence-egolia-billing-checkout-course" -->
