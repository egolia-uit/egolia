# Course OpenAPI - Lead Questions Q&A

Mục đích tài liệu

- Tổng hợp câu hỏi của lead theo kiểu review/clarification.
- Trả lời theo trạng thái hiện tại của repo và đề xuất hướng xử lý.
- Đây là tài liệu giải thích để bàn kỹ thuật, không phải danh sách bắt buộc phải làm ngay.

## 1) Certificate-my đặt tên thế nào?

Nhận xét

- Ban đầu path contract public đã chuyển sang dạng me: `/course/certificates/me` nhưng file nội bộ vẫn mang tên `-my`.

Giải quyết

- Đã tiến hành đổi tên file vật lý từ `certificates-my.yaml` thành [api/course/paths/certificates-me.yaml](api/course/paths/certificates-me.yaml) và từ `courses-my-enrolled.yaml` thành [api/course/paths/courses-me-enrolled.yaml](api/course/paths/courses-me-enrolled.yaml) để hoàn toàn đồng bộ với nhau. Đã update lại file tổng [api/course/openapi.yaml](api/course/openapi.yaml).

## 2) Tag cert đâu?

Nhận xét

- Đã có tag `Certificate` trong [api/course/openapi.yaml](api/course/openapi.yaml).
- Hai endpoint certificate đã gắn tag `Certificate` ở [api/course/paths/certificates-me.yaml](api/course/paths/certificates-me.yaml) và [api/course/paths/certificates\_{certificateId}.yaml](api/course/paths/certificates_%7BcertificateId%7D.yaml).

Kết luận

- Mục này đã đáp ứng.

## 3) Price float hay không? Có bán USD không?

Nhận xét

- Course entity đang mô tả price kiểu integer int64 ở [api/course/components/schemas/Course.yaml](api/course/components/schemas/Course.yaml#L25).
- Endpoint update basic info cũng đã chỉnh về integer int64 ở [api/course/paths/courses\_{courseId}\_basic-info.yaml](api/course/paths/courses_%7BcourseId%7D_basic-info.yaml#L29).

Giải thích

- Integer phù hợp mô hình amount theo minor unit.
- Dùng float cho tiền dễ phát sinh sai số.

Đề xuất

- Giữ integer là hợp lý.
- Nếu hỗ trợ đa quốc gia, chốt thêm currency rule rõ ràng theo domain.

## 4) "Bỏ hết response wrapper để theo CQRS" nghĩa là gì?

Đây là phần dễ hiểu nhầm nhất. Câu lead nói theo nghĩa kỹ thuật thường sẽ rơi vào một trong hai ý dưới đây:

Ý A: Trên API, bỏ lớp bọc data

- Hiện nhiều endpoint đang trả dạng:
  - {
    "data": { ...entity... }
    }
- Nếu bỏ wrapper thì sẽ trả thẳng entity:
  - { ...entity... }

Ý B: Trong backend CQRS, mỗi query trả đúng read model, không bọc thêm lớp chung

- Ví dụ query GetCourseDetail trả đúng CourseDetail.
- Không cần thêm lớp Envelope chỉ để chứa data nếu team không có nhu cầu metadata.

Điểm quan trọng cần thống nhất với partner

- CQRS không bắt buộc phải bỏ wrapper.
- CQRS chỉ yêu cầu tách model đọc/ghi và luồng xử lý query/command rõ ràng.
- Wrapper hay không là API style decision, không phải CQRS core rule.

So sánh hai cách để bàn với partner

- Cách 1: Giữ wrapper data
  - Ưu điểm: nhất quán với nhiều endpoint hiện có; dễ thêm metadata sau này (paging, traceId, warnings).
  - Nhược điểm: payload thêm một lớp; FE phải bóc data.
- Cách 2: Trả thẳng entity
  - Ưu điểm: payload gọn; FE dùng trực tiếp.
  - Nhược điểm: nếu sau này cần metadata sẽ phải đổi contract hoặc tạo biến thể response.

Khuyến nghị thực tế

- Không nên đổi lẻ tẻ từng endpoint.
- Chốt một quy ước cho toàn bộ read endpoints của course.
- Nếu đổi từ wrapper sang non-wrapper, nên có kế hoạch version/deprecation để không vỡ client hiện tại.

Gợi ý câu hỏi chốt với partner

- Team ưu tiên API ổn định dài hạn hay payload tối giản?
- Có nhu cầu gắn metadata chung cho response trong 3-6 tháng tới không?
- Client hiện tại có phụ thuộc cấu trúc data wrapper chưa?

Mục tiêu cuối cùng

- Chọn một hướng duy nhất rồi áp đồng bộ cho toàn bộ nhóm endpoint đọc (getCourse, getCourseDetail, getCourseLandingPage, getCourseProgress, getMyCertificates...).

Bản cực ngắn để trao đổi nhanh với partner

- Câu lead nói có thể hiểu là: API nên trả thẳng entity, không bọc trong data.
- Nhưng CQRS không bắt buộc bỏ wrapper; CQRS chỉ yêu cầu tách command/query và read model/write model rõ ràng.
- Quyết định bỏ hay giữ wrapper là quyết định style API.
- Nếu giữ wrapper: ổn định hơn, dễ gắn metadata về sau.
- Nếu bỏ wrapper: payload gọn hơn, FE đỡ bóc data.
- Quan trọng nhất: phải chọn một kiểu thống nhất cho toàn bộ nhóm endpoint đọc, không làm nửa này nửa kia.

## 5) Landing page có đủ dữ liệu cho FE chưa?

Nhận xét

- Schema hiện tại khá tối giản: [api/course/components/schemas/CourseLandingPage.yaml](api/course/components/schemas/CourseLandingPage.yaml).
- Endpoint dùng schema này: [api/course/paths/courses\_{courseId}\_landing.yaml](api/course/paths/courses_%7BcourseId%7D_landing.yaml#L18).

Giải thích

- Lead nói đúng: nếu FE không dùng thì không nên map dữ liệu dư, tránh backend gánh mapping thừa.

Đề xuất

- Chốt danh sách field bắt buộc với FE rồi khóa schema theo danh sách đó.
- Field nào thêm mới phải có use-case FE cụ thể.

## 6) BookmarkState userId phải là string format number, không phải uuid

Nhận xét

- Common user id là string format number tại [api/common/components/schemas/User.yaml](api/common/components/schemas/User.yaml#L5).
- BookmarkState userId đã ref về common tại [api/course/components/schemas/BookmarkState.yaml](api/course/components/schemas/BookmarkState.yaml#L5).

Kết luận

- Mục này đã theo đúng hướng lead.

## 7) CourseDetailData thì CourseDetail schema đâu?

Nhận xét

- Đã có alias schema ở [api/course/components/schemas/CourseDetail.yaml](api/course/components/schemas/CourseDetail.yaml).
- Path detail đang dùng CourseDetail ở [api/course/paths/courses\_{courseId}\_detail.yaml](api/course/paths/courses_%7BcourseId%7D_detail.yaml#L19).

Kết luận

- Mục này đã đáp ứng.

## 8) Enrollment completedAt là required + nullable

Nhận xét

- completedAt đang nullable và có trong required tại [api/course/components/schemas/Enrollment.yaml](api/course/components/schemas/Enrollment.yaml#L24) và [api/course/components/schemas/Enrollment.yaml](api/course/components/schemas/Enrollment.yaml#L33).

Giải thích

- nullable + required nghĩa là key luôn xuất hiện, giá trị có thể null.

## 9) BookmarkState là gì trong domain? Có trong DB không?

Nhận xét từ tài liệu thiết kế (Class Diagram / Entity):

- Trong tài liệu [docs/src/references/class-diagram.md](docs/src/references/class-diagram.md), thực tiễn chúng ta **CÓ** Aggregate Root tên là `Bookmark` (gồm `id`, `userID`, `courseID`). Dưới tầng DB, nó là một thực thể tồn tại thật.
- Bị "bắt bẻ" là do API OpenAPI lại vẽ thêm chữ `BookmarkState`.

Cách giải quyết triệt để (Khớp 100% DB, CQRS và OpenAPI):

- **Xóa bỏ `BookmarkState`**.
- **Tạo đúng Schema [api/course/components/schemas/Bookmark.yaml](api/course/components/schemas/Bookmark.yaml)** map 1:1 với định nghĩa ở `class-diagram.md`.
- Ở API cắm cờ `POST /courses/{courseId}/bookmark`, sau khi lưu vào DB xong, trả về **đúng đối tượng `Bookmark`** vừa tạo (khớp với kiến trúc: POST trả về Entity vừa tạo). KHÔNG bọc thêm JSON `{ "data": ... }`.
- Ở API gỡ cờ `POST /courses/{courseId}/unbookmark`, trả về `204 No Content` (Vì vừa xóa bản ghi Bookmark đi rồi).

**Góc giải thích FE (Cách Frontend dùng chuẩn CQRS thay vì nhét biến `isBookmarked` vào Course):**
Nếu không nhét `isBookmarked` thẳng vào Course (để giữ cho Course sạch sẽ), Frontend sẽ làm cách nào?

- Thường FE sẽ gọi một API kiểu dạng `GET /courses/me/bookmarks` (Danh sách các ID khóa học tôi đã lưu) ngay khi đăng nhập.
- FE lấy được 1 mảng ID (VD: `["123", "456"]`) và lưu vào State/Redux.
- Mỗi khi màn hình hiển thị danh sách khóa học hay chi tiết khóa học số "123", FE chỉ việc kiểm tra `"123" có nằm trong list đã lưu không?` -> Nếu có thì tự phát sáng icon Bookmark lên. (Đây là best practice, giúp Course siêu nhẹ gọn, không phải chọc API check Bookmark liên tục, cũng không phải gánh 1 trường dư).

## 10) Example ID viết bừa không tốt đến lúc mock nó không serve được là sao?

**Giải thích chi tiết (Dành cho bạn và Partner):**

- Khi bạn thiết kế API bằng OpenAPI (Swagger), Frontend thường không đợi Backend code thật xong mới vào làm việc. Dân Frontend sẽ dùng các tool làm giả API (như Prism, Stoplight, hoặc Wiremock).
- Các **Mock Server** (Server giả này) hoạt động bằng cách: Chúng đọc trực tiếp file `.yaml` chứa API của bạn, sau đó bốc nguyên xi đoạn text bạn viết trong mục `example: ...` ném ngược lại cho Frontend gọi.
- **Tại sao "Example mà cũng cần phải tốt"?**
  - Giả sử ID khóa học (Course ID) trong thiết kế là một con số, nhưng trong dòng `example` bạn làm biếng và gõ bừa: `"example": "hihi_id_của_tui"`.
  - Lúc đó, Mock Server cũng ngố theo, trả đúng chuỗi `"hihi_id_của_tui"` cho Frontend.
  - Frontend xài trúng chuỗi giả bị sai định dạng này -> Sinh lỗi vỡ app, vỡ giao diện. Thậm chí khi Frontend lấy cục ID giả `"hihi_id_của_tui"` gọi qua một endpoint khác (VD lấy bài học của khóa đó: `GET /courses/hihi_id_của_tui/lessons`), mock server thấy ID truyền lên bị sai kiểu nên nó sập và báo lỗi (không "serve được endpoint").
- **Tóm lại, ý của Lead là:** Đã bỏ công copy-paste example thì điền cái ID cho giống thật nhất có thể (ví dụ ID kiểu chuỗi số thì ghi `"example": "10492"`). Viết bừa thì server test giả của tụi Frontend sẽ sinh ra đống dữ liệu rác không xài được để test flow hệ thống.

## 11) Param lessonCommentIdPath sao không reuse CommentIdPath?

Nhận xét

- Đã reuse commentIdPath dùng chung tại [api/common/components/parameters/commentIdPath.yaml](api/common/components/parameters/commentIdPath.yaml).
- Course và blog đều ref chung tham số này, ví dụ [api/course/paths/lesson-comments\_{commentId}\_reply.yaml](api/course/paths/lesson-comments_%7BcommentId%7D_reply.yaml#L9) và [api/blog/paths/comments\_{commentId}.yaml](api/blog/paths/comments_%7BcommentId%7D.yaml#L9).

Kết luận

- Mục này đã giải quyết theo hướng tái sử dụng và đã test join/gen pass.

## 12) Có chắc gộp các loại get course là hợp lý?

Nhận xét

- Hiện có nhiều read endpoint riêng: getCourse, getCourseDetail, getCourseLandingPage, getCourseProgress.

Góc nhìn kiến trúc

- Theo CQRS, tách read model theo use-case là hợp lý.
- Nếu overlap field quá lớn thì cần tối ưu để giảm duplicate mapping.

Đề xuất

- Dùng ma trận endpoint x consumer.
- Endpoint nào không có consumer rõ thì cân nhắc gộp/bỏ.

## 13) Câu summary tiếng Anh

Nhận xét

- Đã đổi sang "Update course basic information" tại [api/course/paths/courses\_{courseId}\_basic-info.yaml](api/course/paths/courses_%7BcourseId%7D_basic-info.yaml#L6).

## 14) Path get my own sửa thành /.../me

Nhận xét

- Certificate đã là /me trong [api/course/openapi.yaml](api/course/openapi.yaml#L97).
- Courses enrolled đã là /me trong [api/course/openapi.yaml](api/course/openapi.yaml#L71).
- Tên file nội bộ chưa đổi (courses-my-enrolled.yaml, certificates-my.yaml) nhưng contract public đã là /me.

## 15) CheckoutCourseRequest đặt ở schema hay path?

Trạng thái

- Thuộc billing, owner khác.

Nhận xét kỹ thuật

- Đặt request body schema trong components/schemas là hợp lệ OpenAPI.
- Nếu team muốn rõ hơn có thể tách namespace requests theo convention.

## 16) CRUD và ORM model xử lý logic luôn?

Trạng thái

- Đây là quyết định kiến trúc backend, không phải lỗi OpenAPI tự thân.

Đề xuất

- Chốt boundary rõ giữa domain entity, use-case/service, mapping layer.

## 17) Upload video URL flow (tạo rồi lấy duration)

Nhận xét

- Endpoint tạo upload URL có tại [api/course/paths/lessons\_{lessonId}\_upload-video-url.yaml](api/course/paths/lessons_%7BlessonId%7D_upload-video-url.yaml).
- Response hiện có uploadUrl/objectKey/expiresAt tại [api/course/components/schemas/UploadVideoUrlResponse.yaml](api/course/components/schemas/UploadVideoUrlResponse.yaml).
- duration đang ở lesson edit tại [api/course/paths/lessons\_{lessonId}.yaml](api/course/paths/lessons_%7BlessonId%7D.yaml#L63).

Gap cần làm rõ

- Chưa có contract rõ cho bước ingest callback/metadata extraction để cập nhật duration tự động.

## 18) Revenue analytics logic có chuẩn không?

Trạng thái

- Thuộc billing, owner khác.

Nhận xét

- Cần tài liệu hóa logic aggregate trước khi chốt schema và mock data.

## 19) Test có thuộc course không? Tag chia đã hợp lý chưa?

Nhận xét

- Endpoint test đang gắn tag Test tại [api/course/paths/lessons\_{lessonId}\_tests.yaml](api/course/paths/lessons_%7BlessonId%7D_tests.yaml#L5).

Giải thích

- Nếu xem Test là sub-domain riêng trong Course thì tag Test là hợp lý.
- Nếu muốn gom hơn, có thể gắn thêm tag Course cùng lúc.

## Tổng hợp ưu tiên cho phần Course

Ưu tiên cao

- Chốt quy ước response (wrapper hay không) theo một chuẩn duy nhất.
- Chốt định nghĩa BookmarkState là read-model từ Bookmark.
- Chốt flow upload video và cập nhật duration.

Ưu tiên trung bình

- Đổi tên file certificates-my.yaml thành certificates-me.yaml để đồng bộ nội bộ.
- Rà soát chất lượng examples theo đúng type/format/domain.
- Rà soát lại nhóm endpoint get course theo consumer thực tế.

Chú thích ownership

- Các mục billing/blog trong note lead nên tách ticket owner riêng để tránh PR course ôm quá nhiều scope.
