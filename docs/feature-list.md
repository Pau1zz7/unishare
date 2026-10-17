UNISHARE — DANH SÁCH TÍNH NĂNG VÀ TECH STACK

PHẦN 0 — TECH STACK CHI TIẾT

0.1. Tổng quan stack

Framework: 	React Native + Expo
Ngôn ngữ: 	TypeScript
Routing: 		React Navigation
State: 		Zustand
Data fetching:	Custom Hooks (useState + useEffect) + Firestore onSnapshot
UI styling: 		NativeWind
Form: 		react-hook-form
Validation: 	zod
Backend: 		Firebase (Auth, Firestore, Storage, FCM)
Map: 		react-native-maps + Google Directions API + @mapbox/polyline
Geospatial: 	geofire-common
Đóng gói: 		EAS Build (build APK/AAB)

0.2. Chi tiết từng thành phần

Framework — React Native + Expo
Vai trò: Nền tảng để viết app mobile bằng JavaScript/TypeScript, chạy được cả Android và iOS.
Lý do chọn: Cộng đồng lớn, tài liệu nhiều, Expo giúp build nhanh không cần cấu hình native phức tạp.
Phiên bản: Expo SDK mới nhất.

Ngôn ngữ — TypeScript
Vai trò: Viết code có kiểu dữ liệu, bắt lỗi sớm khi compile.
Lý do chọn: Bắt buộc với dự án nhiều người làm chung, tránh lỗi đổi tên field.

Routing — React Navigation
Vai trò: Điều hướng giữa các màn hình (Stack, Tab, Drawer).
Lý do chọn: Là thư viện routing chuẩn và phổ biến nhất của React Native, tài liệu nhiều.
Thành phần dùng: Stack Navigator, Bottom Tab Navigator.

State — Zustand
Vai trò: Quản lý state dùng chung giữa các màn hình (user đang đăng nhập, filter đang chọn, theme...).
Lý do chọn: Nhẹ hơn Redux, dễ học hơn Context API khi có nhiều state.
Cách dùng trong UniShare:
useAuthStore: lưu user hiện tại, trạng thái đăng nhập
useFilterStore: lưu filter đang chọn ở màn Bảng tin
useChatStore: lưu conversation đang mở

Data fetching — Custom Hooks + Firestore SDK
Vai trò: Gọi dữ liệu từ Firestore, lắng nghe dữ liệu thời gian thực (Realtime) và quản lý trạng thái loading / error.
Lý do chọn: Tận dụng trực tiếp cơ chế Offline Caching và Realtime Listener (onSnapshot) có sẵn của Firebase SDK. Không dùng TanStack Query để tránh xung đột cơ chế cache, tránh rò rỉ bộ nhớ (memory leak) khi dùng chung với websocket listener và tránh over-engineering.
Cách dùng trong UniShare:
Dùng getDoc / getDocs kết hợp useState + useEffect cho các truy vấn 1 lần (xem chi tiết, lọc theo lộ trình).
Dùng onSnapshot trong useEffect (có hàm cleanup unsubscribe) cho các màn hình cần cập nhật tức thời (Bảng tin, Chat 1-1, Danh sách hội thoại).

UI styling — NativeWind
Vai trò: Viết style bằng class giống Tailwind CSS, không cần viết StyleSheet.
Lý do chọn: Quen thuộc nếu biết Tailwind, code gọn hơn.

Form — react-hook-form
Vai trò: Quản lý form (nhập liệu, validate, submit).
Lý do chọn: Nhẹ, không re-render nhiều, dễ tích hợp với zod.

Validation — zod
Vai trò: Định nghĩa schema validate dữ liệu (email, password, số điện thoại...).
Lý do chọn: Chuẩn TypeScript, tự sinh type từ schema.

Backend — Firebase
Vai trò: Cung cấp backend dưới dạng dịch vụ (không cần tự viết server).
Thành phần dùng:
Firebase Auth: đăng ký, đăng nhập, quên mật khẩu
Firestore: lưu trữ dữ liệu chính (users, tasks, products, conversations...)
Firebase Storage: lưu ảnh (avatar, task, product)
Firebase Cloud Messaging: push notification
Lý do chọn: Free tier hào phóng, có realtime listener, không cần viết server.
Chi phí: Miễn phí với giới hạn (50k auth/tháng, 50k đọc Firestore/ngày, 5GB Storage).

Map — react-native-maps + Google Directions API
Vai trò: Hiển thị bản đồ, marker, vẽ tuyến đường.
Lý do chọn: react-native-maps là thư viện chuẩn cho map trong RN. Google Directions API cung cấp polyline của tuyến đường (giải mã bằng @mapbox/polyline).
Chi phí: react-native-maps miễn phí. Google Directions API có 200 USD credit/tháng, đủ cho đồ án.

Geospatial — geofire-common
Vai trò: Sinh geohash từ tọa độ, hỗ trợ truy vấn theo khu vực (Bounding Box) trên Firestore.
Lý do chọn: Firestore không hỗ trợ query không gian native, phải dùng geohash.

Đóng gói — EAS Build
Vai trò: Build file APK/AAB để cài lên máy thật.
Lý do chọn: Không cần cài Android Studio nặng máy, hỗ trợ build trên cloud hoặc local.
Chi phí: Miễn phí cho dev cá nhân.

0.3. Cấu trúc thư mục project

unishare/
├── app/ (hoặc src/screens/ nếu dùng React Navigation)
├── src/
│ ├── types/ (định nghĩa TypeScript types)
│ ├── features/
│ │ ├── auth/ (services/, hooks/, components/)
│ │ ├── tasks/
│ │ ├── chat/
│ │ ├── market/
│ │ ├── tutor/
│ │ ├── map/
│ │ └── admin/
│ ├── components/ (UI dùng chung: Button, Input, Card...)
│ ├── lib/
│ │ ├── firebase/ (config, auth, firestore, storage, fcm)
│ │ ├── maps/ (polyline, distance, geocoding)
│ │ └── utils/ (format, date, currency)
│ ├── store/ (Zustand stores)
│ ├── theme/ (tokens.ts - export từ Figma)
│ └── constants/
├── docs/
│ ├── feature-list.md (file này)
│ ├── database-design.md
│ ├── activity-diagrams.md
│ ├── architecture.md
│ ├── design/ (ảnh export từ Figma)
│ └── wireframes.md
├── .env (không push - chứa Firebase & Maps API config)
├── .env.example (push - template cho người khác)
├── .gitignore
├── app.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json

0.4. Quy tắc sử dụng stack

Không tự ý thêm thư viện mới ngoài danh sách này mà không báo người còn lại.
Nếu cần thêm, phải: (1) giải thích lý do, (2) cả 2 đồng ý, (3) cập nhật file này.
Không đổi framework, ngôn ngữ, hoặc backend giữa chừng.
Không tự viết StyleSheet thuần, luôn dùng NativeWind.
Không gọi trực tiếp Firebase ở UI Component, luôn gọi qua service + hook.

PHẦN 1 — HỢP ĐỒNG CHUNG (CHỐT TRƯỚC KHI CODE)

Đây là phần quan trọng nhất. Phải thống nhất toàn bộ phần này trước khi viết bất kỳ dòng code nào. Sau khi chốt, không ai được đổi tên field, tên component, tên hàm, tên type mà không báo người còn lại.

1.1. Tên collection Firestore

users
tasks
products
tutors
conversations
messages (subcollection của conversations)
reviews

1.2. Tên field trong từng collection

users
uid, email, displayName, avatarUrl, bio, phone
role: "user" | "admin"
trustScore, totalReviews
status: "active" | "banned"
createdAt, updatedAt

tasks
taskId, title, description
requesterId, requesterName, requesterAvatar
bounty, paymentMethod ("cash" | "transfer" | "exchange")
pickupLocation, deliveryLocation (mỗi cái là object gồm latitude, longitude, geohash, address)
status: "open" | "matched" | "completed" | "cancelled" | "hidden"
estimatedTime, imageUrls
workerId, workerName
createdAt, updatedAt

products
productId, title, description, price, isFree
category ("book" | "electronic" | "furniture" | "clothing" | "other")
condition ("new" | "like-new" | "used" | "broken")
imageUrls, sellerId, sellerName
location (latitude, longitude, geohash, address)
status: "available" | "sold" | "hidden"
createdAt, updatedAt

tutors
tutorId (trùng uid), displayName, avatarUrl, university
subjects (mảng tên môn), courseCodes (mảng mã môn VD: ["IT001", "NT118"])
feeType: "hourly" | "per_session" | "free_exchange"
feeAmount, bio
trustScore, totalReviews, createdAt

conversations
conversationId, participants (mảng 2 uid), participantNames (mảng 2 tên)
lastMessage, lastMessageAt
relatedType ("task" | "product" | "tutor" | null), relatedId
createdAt

messages
messageId, senderId, senderName, content, imageUrl, createdAt

reviews
reviewId, reviewerId, reviewerName, targetUserId
rating, comment
relatedType, relatedId
createdAt

1.3. Tên component React Native dùng chung

Layout và cơ bản
ScreenContainer, SafeAreaWrapper, Header

Form và input
PrimaryButton, SecondaryButton, InputField, SearchBar, FilterModal

Hiển thị
Avatar, Card, Badge, EmptyState, LoadingSpinner, ErrorMessage, BottomSheet

Domain-specific
TaskCard, ProductCard, ConversationItem, MessageBubble, ReviewItem, TutorCard, MapMarker

1.4. Tên hàm service

authService
register(input: RegisterInput): Promise<User>
login(email: string, password: string): Promise<User>
logout(): Promise<void>
sendPasswordReset(email: string): Promise<void>
getCurrentUser(): Promise<User | null>
updateProfile(uid: string, input: UpdateProfileInput): Promise<void>

taskService
createTask(input: CreateTaskInput): Promise<string>
getTasksNearby(lat: number, lng: number, radiusKm: number): Promise<Task[]>
getTaskById(taskId: string): Promise<Task | null>
acceptTask(taskId: string, workerId: string, workerName: string): Promise<void>
updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>
searchTasks(keyword: string): Promise<Task[]>
filterTasks(filters: TaskFilter): Promise<Task[]>
uploadImages(localUris: string[], folder: "tasks" | "products" | "avatars"): Promise<string[]>

chatService
getOrCreateConversation(input: StartConversationInput): Promise<string>
getConversations(userId: string): Promise<Conversation[]>
sendMessage(conversationId, senderId, senderName, content, imageUrl?): Promise<void>
subscribeMessages(conversationId, callback): () => void
subscribeConversations(userId, callback): () => void

productService
createProduct(input: CreateProductInput): Promise<string>
getProductsNearby(lat, lng, radiusKm, category?): Promise<Product[]>
getProductById(productId: string): Promise<Product | null>
markProductAsSold(productId: string): Promise<void>

tutorService
createOrUpdateTutorProfile(input: CreateTutorProfileInput): Promise<void>
getTutors(subjectOrCourseCode?: string): Promise<Tutor[]>
getTutorById(tutorId: string): Promise<Tutor | null>

locationService
getCurrentLocation(): Promise<Coordinates>
generateGeohash(lat: number, lng: number): string
getDistanceInMeters(c1: Coordinates, c2: Coordinates): number

mapService
getDirections(origin: Coordinates, destination: Coordinates): Promise<RouteResult>
decodePolyline(encoded: string): Coordinates[]
filterTasksOnRoute(tasks, routePath, maxDistanceMeters): Array<{ task: Task, distanceToRoute: number }>

adminService
getAllUsers(): Promise<User[]>
banUser(uid: string): Promise<void>
hideTask(taskId: string): Promise<void>
hideProduct(productId: string): Promise<void>

1.5. Tên hook

useAuth, useTasks, useTaskDetail, useChat, useConversations, useProducts, useTutors, useLocation, useRouteMatching, useAdmin

1.6. Tên type TypeScript (đặt trong src/types)

User, RegisterInput, UpdateProfileInput
Task, TaskStatus, CreateTaskInput, GeoLocation, PaymentMethod, TaskFilter
Product, ProductCategory, ProductCondition, CreateProductInput
Tutor, CreateTutorProfileInput
Conversation, Message, StartConversationInput
Review, CreateReviewInput
Coordinates, RouteResult

1.7. Tên Zustand store

useAuthStore: user, isLoggedIn, setUser, clearUser
useFilterStore: taskFilter, productFilter, setTaskFilter, setProductFilter
useChatStore: activeConversationId, setActiveConversation

1.8. Quy tắc sau khi chốt

Không sửa file trong src/types mà không báo người kia.
Không tự viết Firestore query trong component UI, phải gọi qua hook hoặc service.
Không đổi tên field sau khi chốt. Nếu buộc phải đổi, dùng Find and Replace toàn project và commit 1 lần duy nhất.
Mỗi PR review chéo trước khi merge.

PHẦN 2 — P1 BẮT BUỘC (26 tính năng)

Nhóm A — Tài khoản và Xác thực
Phân tầng nội bộ:
Tier A (core auth): Đăng ký, Đăng nhập, Đăng xuất, Quên mật khẩu
Tier B (support): Cập nhật hồ sơ, Xem điểm uy tín

Đăng ký bằng email .edu.vn
Mô tả: User đăng ký tài khoản, hệ thống chỉ chấp nhận email đuôi .edu.vn.
Ghi chú: Nếu email không đuôi .edu.vn thì báo lỗi ngay trên form. Validate ở client.
Người làm: Phúc (service), Khôi (UI)
Input: email, password, displayName, phone
Output: Firebase Auth user + doc users/{uid} với role mặc định "user"

Đăng nhập
Mô tả: User đăng nhập bằng email và password.
Ghi chú: Kiểm tra thêm trạng thái status !== "banned".
Người làm: Phúc, Khôi
Input: email, password
Output: Session Firebase Auth + thông tin user load về app

Đăng xuất
Mô tả: User bấm đăng xuất, xóa session, quay về màn hình Login.
Người làm: Khôi
Input: không
Output: Firebase Auth signOut, app reset về Login

Quên mật khẩu
Mô tả: User nhập email, hệ thống gửi link reset mật khẩu qua email.
Ghi chú: Dùng hàm sendPasswordResetEmail của Firebase.
Người làm: Khôi
Input: email
Output: Firebase gửi mail có link reset

Cập nhật hồ sơ
Mô tả: User đổi tên, avatar, bio, SĐT.
Ghi chú: Avatar upload lên Firebase Storage, lấy URL lưu vào Firestore.
Người làm: Khôi
Input: UpdateProfileInput gồm displayName?, bio?, phone?, avatarUrl?
Output: users/{uid} được update

Xem điểm uy tín
Mô tả: Hiển thị điểm trung bình từ các review, thang 0.0 đến 5.0.
Ghi chú: Chỉ tính trung bình cộng từ collection reviews.
Người làm: Khôi
Input: uid
Output: trustScore, totalReviews

Nhóm B — Bảng việc vặt
Phân tầng nội bộ:
Tier A (core): Đăng việc, Xem feed, Xem chi tiết, Nhận việc
Tier B (support): Tìm kiếm, Lọc

Đăng việc mới
Mô tả: User đăng việc với tiêu đề, mô tả, thù lao, địa điểm lấy, địa điểm giao, ảnh.
Ghi chú: Ảnh upload lên Storage trước, sau đó lưu URL vào doc. Sinh geohash cho 2 địa điểm.
Người làm: Phúc (service + geohash), Khôi (form UI)
Input: CreateTaskInput
Output: Doc mới trong tasks, kèm geohash

Xem feed việc vặt
Mô tả: Hiển thị danh sách việc gần vị trí hiện tại, bán kính 5km.
Ghi chú: Dùng geofire-common để query bounding box trước, lọc chính xác sau bằng Haversine.
Người làm: Phúc (query), Khôi (UI card)
Input: latitude, longitude, radiusKm
Output: Danh sách Task sắp xếp theo khoảng cách

Xem chi tiết việc
Mô tả: Hiển thị đầy đủ thông tin 1 task, nút Nhận việc hoặc Nhắn tin.
Ghi chú: Nếu task đã matched thì ẩn nút Nhận việc.
Người làm: Khôi
Input: taskId
Output: Màn hình chi tiết với đầy đủ field

Nhận việc
Mô tả: User bấm Nhận việc, hệ thống cập nhật status thành matched, gán workerId và workerName.
Ghi chú: Dùng Firestore Transaction để tránh 2 người nhận cùng lúc.
Người làm: Phúc
Input: taskId, workerId, workerName
Output: tasks/{taskId} update status = "matched"

Tìm kiếm việc
Mô tả: Search theo từ khóa trong title và description.
Ghi chú: Lọc client-side trên danh sách task đang mở trong khu vực hoặc search prefix.
Người làm: Phúc (query), Khôi (UI)
Input: keyword
Output: Danh sách Task khớp

Lọc việc
Mô tả: Lọc theo thù lao khoảng giá và khoảng cách.
Người làm: Phúc (query), Khôi (UI modal)
Input: TaskFilter gồm minBounty?, maxBounty?, radiusKm?
Output: Danh sách Task đã lọc

Nhóm D — Chợ đồ cũ
Phân tầng nội bộ:
Tier A (core): Đăng bán, Xem danh sách, Xem chi tiết

Đăng bán đồ cũ
Mô tả: User đăng sản phẩm với tiêu đề, mô tả, giá, danh mục, tình trạng, ảnh.
Người làm: Khôi
Input: CreateProductInput
Output: Doc mới trong products

Xem danh sách đồ cũ
Mô tả: Grid view các sản phẩm gần đây.
Ghi chú: Tái sử dụng logic geohash query của mục 8.
Người làm: Khôi
Input: latitude, longitude
Output: Danh sách Product

Xem chi tiết sản phẩm
Mô tả: Hiển thị đầy đủ thông tin sản phẩm, nút Nhắn tin cho người bán.
Người làm: Khôi
Input: productId
Output: Màn hình chi tiết

Nhóm E — Chat
Phân tầng nội bộ:
Tier A (core): Nhắn tin 1-1, Danh sách trò chuyện

Nhắn tin 1-1 realtime
Mô tả: 2 user nhắn tin qua lại, tin nhắn hiện realtime không cần reload.
Ghi chú: Dùng Firestore onSnapshot. Không cần typing indicator, không cần seen status.
Người làm: Phúc (service + listener), Khôi (UI)
Input: conversationId, senderId, senderName, content, imageUrl?
Output: Message mới trong Firestore, listener đẩy về client

Danh sách cuộc trò chuyện
Mô tả: Tab Chat hiển thị danh sách các conversation user đang tham gia.
Ghi chú: Cache lastMessage vào conversation doc để không phải query messages.
Người làm: Phúc (listener), Khôi (UI list)
Input: userId
Output: Danh sách Conversation sắp xếp theo lastMessageAt giảm dần

Nhóm F — Bản đồ và Vị trí
Phân tầng nội bộ:
Tier A (core): Lấy GPS, Hiển thị map, Vẽ tuyến đường, Gợi ý việc dọc tuyến (bài toán khó)

Lấy vị trí GPS
Mô tả: Lấy tọa độ hiện tại của thiết bị.
Ghi chú: Dùng expo-location. Xin quyền khi user mở app lần đầu.
Người làm: Phúc
Input: không
Output: latitude, longitude

Hiển thị bản đồ với marker
Mô tả: Bản đồ Google Maps hiển thị marker các task hoặc product gần đây.
Ghi chú: Dùng react-native-maps.
Người làm: Phúc (query), Khôi (UI map)
Input: danh sách tọa độ Coordinates[]
Output: Màn hình map với marker

Vẽ tuyến đường từ A đến B
Mô tả: User nhập điểm đến, app vẽ đường đi từ vị trí hiện tại.
Ghi chú: Dùng Google Directions API. Decode polyline bằng @mapbox/polyline.
Người làm: Phúc
Input: origin, destination
Output: RouteResult gồm polyline, decodedPath, distanceMeters, durationSeconds

Gợi ý việc dọc tuyến đường (BÀI TOÁN)
Mô tả: Sau khi có tuyến đường, hệ thống lọc ra các task nằm dọc tuyến trong bán kính 300m, sắp xếp theo khoảng cách.
Ghi chú: Dùng Point-to-Segment Distance. Đây là điểm nhấn chính của đồ án.
Người làm: Phúc (thuật toán), Khôi (bottom sheet UI)
Input: tasks, routePath, maxDistanceMeters
Output: Array gồm task và distanceToRoute

Nhóm G — Uy tín
Phân tầng nội bộ:
Tier A (core): Đánh giá 1-5 sao

Đánh giá 1-5 sao
Mô tả: Sau khi giao dịch xong, 2 bên đánh giá nhau 1-5 sao kèm nhận xét.
Ghi chú: Trust Score = trung bình cộng rating.
Người làm: Khôi
Input: CreateReviewInput
Output: Doc mới trong reviews, cập nhật trustScore của target user

Nhóm H — Thông báo
Phân tầng nội bộ:
Tier A (core): Push khi có việc mới gần đây

Push notification khi có việc mới gần đây
Mô tả: Khi có task mới trong bán kính 1km, gửi push notification cho user.
Ghi chú: Dùng Firebase Cloud Messaging. Chỉ làm 1 loại notification cơ bản.
Người làm: Phúc
Input: task mới vừa tạo
Output: Notification hiện trên thiết bị

Nhóm I — Quản trị (Admin)
Phân tầng nội bộ:
Tier B (support): Toàn bộ nhóm I (cần cho điểm phân quyền)

Admin xem danh sách user
Mô tả: Admin xem danh sách toàn bộ user trong hệ thống.
Ghi chú: Chỉ user có role = "admin" mới thấy tab này.
Người làm: Khôi
Input: role của user hiện tại
Output: Danh sách User

Admin khóa user vi phạm
Mô tả: Admin khóa tài khoản user vi phạm.
Ghi chú: Đánh dấu status = "banned" trong Firestore.
Người làm: Khôi
Input: uid
Output: users/{uid} update status = "banned"

Admin ẩn task hoặc product vi phạm
Mô tả: Admin ẩn các bài đăng vi phạm.
Ghi chú: Dùng status = "hidden" để tránh mất dữ liệu.
Người làm: Khôi
Input: taskId hoặc productId
Output: Doc update status = "hidden"

PHẦN 3 — P2 NÊN CÓ (11 tính năng)

Nhóm A — Auth
Phân tầng nội bộ:
Tier B: Cả nhóm (không ảnh hưởng P1)

Xác thực OTP / Link qua email
Mô tả: Sau khi đăng ký, xác thực email sinh viên.
Ghi chú: Dùng sendEmailVerification có sẵn của Firebase hoặc mock OTP "123456" cho demo.
Người làm: Khôi

Nhóm B — Bảng việc vặt
Phân tầng nội bộ:
Tier B: Hủy/hoàn thành việc

Hủy hoặc hoàn thành việc
Mô tả: User hủy task đang làm, hoặc đánh dấu hoàn thành sau khi giao xong.
Người làm: Phúc
Input: taskId, newStatus ("cancelled" | "completed")

Nhóm C — Gia sư (Chuẩn hóa cho Sinh viên ĐH)
Phân tầng nội bộ:
Tier B: Toàn bộ nhóm C (không ảnh hưởng demo)

Đăng ký làm gia sư
Mô tả: Sinh viên đăng ký hồ sơ gia sư, chọn môn học (subjects), mã môn (courseCodes như IT001, MA001), mức phí (feeAmount).
Ghi chú: Lưu vào collection tutors với tutorId = uid.
Người làm: Khôi
Input: CreateTutorProfileInput

Xem danh sách gia sư
Mô tả: Hiển thị danh sách các gia sư đại học đã đăng ký, lọc theo môn học hoặc mã môn.
Người làm: Khôi
Input: subject?, courseCode?

Xem profile gia sư
Mô tả: Hiển thị thông tin chi tiết của 1 gia sư kèm điểm uy tín và review.
Người làm: Khôi
Input: tutorId

Nhóm D — Chợ đồ cũ
Phân tầng nội bộ:
Tier B: Đánh dấu đã bán, Lọc danh mục

Đánh dấu đã bán
Mô tả: Người bán đánh dấu sản phẩm status = "sold".
Người làm: Khôi

Lọc sản phẩm theo danh mục
Mô tả: Lọc chợ đồ cũ theo category (book, electronic, furniture, clothing, other).
Người làm: Khôi

Nhóm E — Chat
Phân tầng nội bộ:
Tier B: Gửi ảnh, Make Offer

Gửi ảnh trong chat
Mô tả: Upload ảnh lên Storage trước, sau đó gửi message kèm imageUrl.
Người làm: Khôi

Make Offer thù lao
Mô tả: User đề nghị mặc cả thù lao cho 1 task bằng tin nhắn format đặc biệt.
Người làm: Khôi

Nhóm G — Lịch sử
Phân tầng nội bộ:
Tier B: Xem lịch sử giao dịch

Xem lịch sử giao dịch
Mô tả: Xem lại các task đã nhận (workerId == uid) hoặc đã đăng (requesterId == uid).
Người làm: Khôi

Nhóm H — Thông báo
Phân tầng nội bộ:
Tier B: Push khi có tin nhắn mới

Push notification khi có tin nhắn mới
Mô tả: Khi nhận tin nhắn mới, gửi push notification (chỉ làm nếu còn thời gian).
Người làm: Phúc

PHẦN 4 — P3 CẮT BỎ (3 tính năng)

Check-in trạng thái đang rảnh (Kịch bản A)
Lý do cắt: Tập trung vào Kịch bản B (Route Matching) làm bài toán khó duy nhất.

Report user vi phạm
Lý do cắt: Đã có chức năng Admin khóa user/ẩn bài ở mục 24, 25, 26.

Chặn user khác
Lý do cắt: Không ảnh hưởng đến luồng chính.

PHẦN 5 — CÁC MỤC ĐÃ GỘP HOẶC TRÙNG

Tìm gia sư theo môn (gốc #16): Gộp vào mục 30.
Tìm việc quanh vị trí (gốc #29): Gộp vào mục 8.
Xóa tài khoản tự động (gốc #39): Gộp vào mục 25.

PHẦN 6 — MA TRẬN ƯU TIÊN

Impact cao, Effort cao:
Gợi ý việc dọc tuyến (mục 21), Nhắn tin 1-1 realtime (mục 16).

Impact cao, Effort thấp:
Đăng nhập, đăng ký, đăng xuất (mục 1, 2, 3), Feed việc vặt (mục 8), Xem chi tiết việc (mục 9), Đánh giá 1-5 sao (mục 22).

Impact thấp, Effort cao:
Push notification (mục 23), Admin panel (mục 24, 25, 26).

Impact thấp, Effort thấp:
Tìm kiếm, lọc việc (mục 11, 12), Đăng bán đồ cũ (mục 13).

PHẦN 7 — CAM KẾT

P1 sẽ hoàn thành 100% trước 15/12/2026.
P2 sẽ làm nếu còn thời gian, không ảnh hưởng P1.
P3 không làm, không bàn thêm.
Nếu giảng viên yêu cầu thêm tính năng ngoài danh sách này, nhóm họp lại và cập nhật file này trước khi code.
Không thêm thư viện mới ngoài stack ở Phần 0 mà không báo người còn lại.