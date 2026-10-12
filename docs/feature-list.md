UNISHARE — DANH SÁCH TÍNH NĂNG VÀ TECH STACK

PHẦN 0 — TECH STACK CHI TIẾT

0.1. Tổng quan stack

Framework:	React Native + Expo
Ngôn ngữ:		TypeScript
Routing:		React Navigation
State:		Zustand
Data fetching:	TanStack Query
UI styling:		NativeWind
Form:		react-hook-form
Validation:		zod
Backend:		Firebase (Auth, Firestore, Storage, FCM)
Map:      		react-native-maps + Google Directions API
Geospatial:       	geofire-common
Đóng gói:         	EAS Build (build APK/AAB)

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
  - useAuthStore: lưu user hiện tại, trạng thái đăng nhập
  - useFilterStore: lưu filter đang chọn ở màn Bảng tin
  - useChatStore: lưu conversation đang mở


Data fetching — TanStack Query
Vai trò: Cache kết quả gọi Firestore, tự động refetch khi cần, quản lý loading/error state.
Lý do chọn: Giảm code lặp trong custom hook, có sẵn logic cache và retry.
Cách dùng trong UniShare:
  - useQuery cho các truy vấn 1 lần (getTaskById, getProductById)
  - useMutation cho hành động ghi (createTask, sendMessage, acceptTask)
  - useInfiniteQuery cho paging (nếu cần)
Lưu ý: Với Firestore realtime listener (onSnapshot) vẫn dùng custom hook, không dùng TanStack Query.


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
  - Firebase Auth: đăng ký, đăng nhập, quên mật khẩu
  - Firestore: lưu trữ dữ liệu chính (users, tasks, products, conversations...)
  - Firebase Storage: lưu ảnh (avatar, task, product)
  - Firebase Cloud Messaging: push notification
Lý do chọn: Free tier hào phóng, có realtime listener, không cần viết server.
Chi phí: Miễn phí với giới hạn (50k auth/tháng, 50k đọc Firestore/ngày, 5GB Storage).

Map — react-native-maps + Google Directions API
Vai trò: Hiển thị bản đồ, marker, vẽ tuyến đường.
Lý do chọn: react-native-maps là thư viện chuẩn cho map trong RN. Google Directions API cung cấp polyline của tuyến đường.
Chi phí: react-native-maps miễn phí. Google Directions API có 200 USD credit/tháng, đủ cho đồ án.

Geospatial — geofire-common
Vai trò: Sinh geohash từ tọa độ, hỗ trợ truy vấn theo khu vực trên Firestore.
Lý do chọn: Firestore không hỗ trợ query không gian native, phải dùng geohash.


Đóng gói — EAS Build
Vai trò: Build file APK/AAB để cài lên máy thật.
Lý do chọn: Không cần cài Android Studio, build trên cloud.
Chi phí: Miễn phí cho dev cá nhân.


0.3. Cấu trúc thư mục project

unishare/
├── app/                          (hoặc src/screens/ nếu dùng React Navigation)
├── src/
│   ├── types/                    (định nghĩa TypeScript types)
│   ├── features/
│   │   ├── auth/                 (services/, hooks/, components/)
│   │   ├── tasks/
│   │   ├── chat/
│   │   ├── market/
│   │   ├── tutor/
│   │   ├── map/
│   │   └── admin/
│   ├── components/               (UI dùng chung: Button, Input, Card...)
│   ├── lib/
│   │   ├── firebase/             (config, auth, firestore, storage, fcm)
│   │   ├── maps/                 (polyline, distance, geocoding)
│   │   └── utils/                (format, date, currency)
│   ├── store/                    (Zustand stores)
│   ├── theme/                    (tokens.ts - export từ Figma)
│   └── constants/
├── docs/
│   ├── feature-list.md           (file này)
│   ├── design/                   (ảnh export từ Figma)
│   └── wireframes.md
├── functions/                    (nếu cần Cloud Functions sau này)
├── .env                          (không push - chứa Firebase config)
├── .env.example                  (push - template cho người khác)
├── .gitignore
├── app.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json


0.4. Quy tắc sử dụng stack

- Không tự ý thêm thư viện mới ngoài danh sách này mà không báo người còn lại.
- Nếu cần thêm, phải: (1) giải thích lý do, (2) cả 2 đồng ý, (3) cập nhật file này.
- Không đổi framework, ngôn ngữ, hoặc backend giữa chừng.
- Không tự viết StyleSheet thuần, luôn dùng NativeWind.
- Không tự viết fetch API, luôn dùng service + hook.


PHẦN 1 — HỢP ĐỒNG CHUNG (CHỐT TRƯỚC KHI CODE)

Đây là phần quan trọng nhất. Phúc và Khôi phải thống nhất toàn bộ phần này trước khi viết bất kỳ dòng code nào. Sau khi chốt, không ai được đổi tên field, tên component, tên hàm, tên type mà không báo người còn lại.

1.1. Tên collection Firestore

- users
- tasks
- products
- tutors
- conversations
- messages (subcollection của conversations)
- reviews

1.2. Tên field trong từng collection

users
- uid, email, displayName, avatarUrl, bio, phone
- role: "user" hoặc "admin"
- trustScore, totalReviews
- status: "active" hoặc "banned"
- createdAt, updatedAt

tasks
- taskId, title, description
- requesterId, requesterName
- bounty, paymentMethod
- pickupLocation, deliveryLocation (mỗi cái là object gồm latitude, longitude, geohash, address)
- status: "open", "matched", "completed", "cancelled"
- estimatedTime, imageUrls
- workerId, workerName
- createdAt, updatedAt

products
- productId, title, description, price, isFree
- category, condition
- imageUrls, sellerId, sellerName
- location (latitude, longitude, geohash, address)
- status: "available", "sold", "hidden"
- createdAt, updatedAt

conversations
- conversationId, participants (mảng 2 uid), participantNames (mảng 2 tên)
- lastMessage, lastMessageAt
- relatedType, relatedId
- createdAt

messages
- messageId, senderId, senderName, content, imageUrl, createdAt

reviews
- reviewId, reviewerId, reviewerName, targetUserId
- rating, comment
- relatedType, relatedId
- createdAt

1.3. Tên component React Native dùng chung

Layout và cơ bản
- ScreenContainer
- SafeAreaWrapper
- Header

Form và input
- PrimaryButton
- SecondaryButton
- InputField
- SearchBar
- FilterModal

Hiển thị
- Avatar
- Card
- Badge
- EmptyState
- LoadingSpinner
- ErrorMessage
- BottomSheet

Domain-specific
- TaskCard
- ProductCard
- ConversationItem
- MessageBubble
- ReviewItem
- TutorCard
- MapMarker

1.4. Tên hàm service

authService
- register(input: RegisterInput): Promise<User>
- login(email: string, password: string): Promise<User>
- logout(): Promise<void>
- sendPasswordReset(email: string): Promise<void>
- getCurrentUser(): Promise<User | null>
- updateProfile(uid: string, input: UpdateProfileInput): Promise<void>

taskService
- createTask(input: CreateTaskInput): Promise<string>
- getTasksNearby(lat: number, lng: number, radiusKm: number): Promise<Task[]>
- getTaskById(taskId: string): Promise<Task | null>
- acceptTask(taskId: string, workerId: string): Promise<void>
- updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>
- searchTasks(keyword: string): Promise<Task[]>
- filterTasks(filters: TaskFilter): Promise<Task[]>
- uploadImages(localUris: string[], folder: "tasks" | "products" | "avatars"): Promise<string[]>

chatService
- getOrCreateConversation(input: StartConversationInput): Promise<string>
- getConversations(userId: string): Promise<Conversation[]>
- sendMessage(conversationId, senderId, senderName, content, imageUrl?): Promise<void>
- subscribeMessages(conversationId, callback): () => void
- subscribeConversations(userId, callback): () => void

productService
- createProduct(input: CreateProductInput): Promise<string>
- getProductsNearby(lat, lng, radiusKm, category?): Promise<Product[]>
- getProductById(productId: string): Promise<Product | null>
- markProductAsSold(productId: string): Promise<void>

locationService
- getCurrentLocation(): Promise<Coordinates>
- generateGeohash(lat: number, lng: number): string
- getDistanceInMeters(c1: Coordinates, c2: Coordinates): number

mapService
- getDirections(origin: Coordinates, destination: Coordinates): Promise<RouteResult>
- decodePolyline(encoded: string): Coordinates[]
- filterTasksOnRoute(tasks, routePath, maxDistanceMeters): Array<{ task, distanceToRoute }>

adminService
- getAllUsers(): Promise<User[]>
- banUser(uid: string): Promise<void>
- hideTask(taskId: string): Promise<void>
- hideProduct(productId: string): Promise<void>

1.5. Tên hook

- useAuth
- useTasks
- useTaskDetail
- useChat
- useConversations
- useProducts
- useTutors
- useLocation
- useRouteMatching
- useAdmin

1.6. Tên type TypeScript (đặt trong src/types)

- User, RegisterInput, UpdateProfileInput
- Task, TaskStatus, CreateTaskInput, GeoLocation, PaymentMethod
- Product, ProductCategory, ProductCondition, CreateProductInput
- Tutor, CreateTutorProfileInput
- Conversation, Message, StartConversationInput
- Review, CreateReviewInput
- Coordinates, RouteResult

1.7. Tên Zustand store

- useAuthStore: user, isLoggedIn, setUser, clearUser
- useFilterStore: taskFilter, productFilter, setTaskFilter, setProductFilter
- useChatStore: activeConversationId, setActiveConversation

1.8. Quy tắc sau khi chốt

- Không sửa file trong src/types mà không báo người kia.
- Không tự viết Firestore query trong component UI, phải gọi qua hook hoặc service.
- Không đổi tên field sau khi chốt. Nếu buộc phải đổi, dùng Find and Replace toàn project và commit 1 lần duy nhất.
- Mỗi PR review chéo trước khi merge.


PHẦN 2 — P1 BẮT BUỘC (26 tính năng)


Nhóm A — Tài khoản và Xác thực
Phân tầng nội bộ:
- Tier A (core auth): Đăng ký, Đăng nhập, Đăng xuất, Quên mật khẩu
- Tier B (support): Cập nhật hồ sơ, Xem điểm uy tín

1. Đăng ký bằng email .edu.vn
Mô tả: User đăng ký tài khoản, hệ thống chỉ chấp nhận email đuôi .edu.vn.
Ghi chú: Nếu email không đuôi .edu.vn thì báo lỗi ngay trên form. Validate ở client và Firestore rule.
Người làm: Phúc (service), Khôi (UI)
Input: email string, password string, displayName string, phone string
Output: Firebase Auth user + doc users/{uid} với role mặc định "user"

2. Đăng nhập
Mô tả: User đăng nhập bằng email và password.
Ghi chú: Firebase tự sinh ID token, tự refresh, tự đính kèm vào request Firestore.
Người làm: Phúc, Khôi
Input: email string, password string
Output: Session Firebase Auth + thông tin user load về app

3. Đăng xuất
Mô tả: User bấm đăng xuất, xóa session, quay về màn hình Login.
Ghi chú: Tính năng cơ bản, không cắt.
Người làm: Khôi
Input: không
Output: Firebase Auth signOut, app reset về Login

4. Quên mật khẩu
Mô tả: User nhập email, hệ thống gửi link reset mật khẩu qua email.
Ghi chú: Dùng hàm sendPasswordResetEmail của Firebase. Miễn phí, không cần SMTP riêng.
Người làm: Khôi
Input: email string
Output: Firebase gửi mail có link reset

5. Cập nhật hồ sơ
Mô tả: User đổi tên, avatar, bio, SĐT.
Ghi chú: Avatar upload lên Firebase Storage, lấy URL lưu vào Firestore.
Người làm: Khôi
Input: UpdateProfileInput gồm displayName?, bio?, phone?, avatarUrl?
Output: users/{uid} được update

6. Xem điểm uy tín
Mô tả: Hiển thị điểm trung bình từ các review, thang 0.0 đến 5.0.
Ghi chú: Không cần thuật toán, chỉ tính trung bình cộng từ collection reviews.
Người làm: Khôi
Input: uid string
Output: trustScore number, totalReviews number


Nhóm B — Bảng việc vặt
Phân tầng nội bộ:
- Tier A (core): Đăng việc, Xem feed, Xem chi tiết, Nhận việc
- Tier B (support): Tìm kiếm, Lọc

7. Đăng việc mới
Mô tả: User đăng việc với tiêu đề, mô tả, thù lao, địa điểm lấy, địa điểm giao, ảnh.
Ghi chú: Ảnh upload lên Storage trước, sau đó lưu URL vào doc. Sinh geohash cho 2 địa điểm.
Người làm: Phúc (service + geohash), Khôi (form UI)
Input: CreateTaskInput
Output: Doc mới trong tasks, kèm geohash

8. Xem feed việc vặt
Mô tả: Hiển thị danh sách việc gần vị trí hiện tại, bán kính 5km.
Ghi chú: Dùng geofire-common để query bounding box trước, lọc chính xác sau bằng Haversine.
Người làm: Phúc (query), Khôi (UI card)
Input: latitude number, longitude number, radiusKm number
Output: Danh sách Task sắp xếp theo khoảng cách

9. Xem chi tiết việc
Mô tả: Hiển thị đầy đủ thông tin 1 task, nút Nhận việc hoặc Nhắn tin.
Ghi chú: Nếu task đã matched thì ẩn nút Nhận việc.
Người làm: Khôi
Input: taskId string
Output: Màn hình chi tiết với đầy đủ field

10. Nhận việc
Mô tả: User bấm Nhận việc, hệ thống cập nhật status thành matched, gán workerId.
Ghi chú: Dùng transaction để tránh 2 người nhận cùng lúc.
Người làm: Phúc
Input: taskId string, workerId string, workerName string
Output: tasks/{taskId} update status = "matched"

11. Tìm kiếm việc
Mô tả: Search theo từ khóa trong title và description.
Ghi chú: Firestore không hỗ trợ full-text search. Chỉ search prefix.
Người làm: Phúc (query), Khôi (UI)
Input: keyword string
Output: Danh sách Task khớp

12. Lọc việc
Mô tả: Lọc theo thù lao khoảng giá và khoảng cách.
Ghi chú: Filter đơn giản.
Người làm: Phúc (query), Khôi (UI modal)
Input: TaskFilter gồm minBounty?, maxBounty?, radiusKm?
Output: Danh sách Task đã lọc


Nhóm D — Chợ đồ cũ
Phân tầng nội bộ:
- Tier A (core): Đăng bán, Xem danh sách, Xem chi tiết

13. Đăng bán đồ cũ
Mô tả: User đăng sản phẩm với tiêu đề, mô tả, giá, danh mục, tình trạng, ảnh.
Ghi chú: Khôi làm trọn gói cả UI và service.
Người làm: Khôi
Input: CreateProductInput
Output: Doc mới trong products

14. Xem danh sách đồ cũ
Mô tả: Grid view các sản phẩm gần đây.
Ghi chú: Tái sử dụng logic geohash query của mục 8.
Người làm: Khôi
Input: latitude number, longitude number
Output: Danh sách Product

15. Xem chi tiết sản phẩm
Mô tả: Hiển thị đầy đủ thông tin sản phẩm, nút Nhắn tin cho người bán.
Ghi chú: Không cần logic phức tạp.
Người làm: Khôi
Input: productId string
Output: Màn hình chi tiết


Nhóm E — Chat
Phân tầng nội bộ:
- Tier A (core): Nhắn tin 1-1, Danh sách trò chuyện

16. Nhắn tin 1-1 realtime
Mô tả: 2 user nhắn tin qua lại, tin nhắn hiện realtime không cần reload.
Ghi chú: Dùng Firestore onSnapshot. Không cần typing indicator, không cần seen status.
Người làm: Phúc (service + listener), Khôi (UI)
Input: conversationId, senderId, senderName, content, imageUrl?
Output: Message mới trong Firestore, listener đẩy về client

17. Danh sách cuộc trò chuyện
Mô tả: Tab Chat hiển thị danh sách các conversation user đang tham gia.
Ghi chú: Cache lastMessage vào conversation doc để không phải query messages.
Người làm: Phúc (listener), Khôi (UI list)
Input: userId string
Output: Danh sách Conversation sắp xếp theo lastMessageAt giảm dần


Nhóm F — Bản đồ và Vị trí
Phân tầng nội bộ:
- Tier A (core): Lấy GPS, Hiển thị map, Vẽ tuyến đường, Gợi ý việc dọc tuyến (bài toán khó)

18. Lấy vị trí GPS
Mô tả: Lấy tọa độ hiện tại của thiết bị.
Ghi chú: Dùng expo-location. Xin quyền khi user mở app lần đầu.
Người làm: Phúc
Input: không
Output: latitude number, longitude number

19. Hiển thị bản đồ với marker
Mô tả: Bản đồ Google Maps hiển thị marker các task hoặc product gần đây.
Ghi chú: Dùng react-native-maps.
Người làm: Phúc (query), Khôi (UI map)
Input: danh sách tọa độ Coordinates[]
Output: Màn hình map với marker

20. Vẽ tuyến đường từ A đến B
Mô tả: User nhập điểm đến, app vẽ đường đi từ vị trí hiện tại.
Ghi chú: Dùng Google Directions API. Decode polyline bằng @mapbox/polyline.
Người làm: Phúc
Input: origin Coordinates, destination Coordinates
Output: RouteResult gồm polyline, decodedPath, distanceMeters, durationSeconds

21. Gợi ý việc dọc tuyến đường (BÀI TOÁN KHÓ)
Mô tả: Sau khi có tuyến đường, hệ thống lọc ra các task nằm dọc tuyến trong bán kính 300m, sắp xếp theo khoảng cách.
Ghi chú: Dùng Point-to-Segment Distance. Đây là điểm nhấn chính của đồ án.
Người làm: Phúc (thuật toán), Khôi (bottom sheet UI)
Input: tasks Task[], routePath Coordinates[], maxDistanceMeters number
Output: Array gồm task Task và distanceToRoute number


Nhóm G — Uy tín
Phân tầng nội bộ:
- Tier A (core): Đánh giá 1-5 sao

22. Đánh giá 1-5 sao
Mô tả: Sau khi giao dịch xong, 2 bên đánh giá nhau 1-5 sao kèm nhận xét.
Ghi chú: Trust Score = trung bình cộng rating.
Người làm: Khôi
Input: CreateReviewInput
Output: Doc mới trong reviews, cập nhật trustScore của target user


Nhóm H — Thông báo
Phân tầng nội bộ:
- Tier A (core): Push khi có việc mới gần đây

23. Push notification khi có việc mới gần đây
Mô tả: Khi có task mới trong bán kính 1km, gửi push notification cho user.
Ghi chú: Dùng Firebase Cloud Messaging. Chỉ làm 1 loại notification.
Người làm: Phúc
Input: task mới vừa tạo
Output: Notification hiện trên thiết bị


Nhóm I — Quản trị (Admin)
Phân tầng nội bộ:
- Tier B (support): Toàn bộ nhóm I (không ảnh hưởng demo chính nhưng cần cho điểm phân quyền)

24. Admin xem danh sách user
Mô tả: Admin xem danh sách toàn bộ user trong hệ thống.
Ghi chú: Chỉ user có role = "admin" mới thấy tab này. Dùng conditional rendering.
Người làm: Khôi
Input: role của user hiện tại
Output: Danh sách User gồm email, displayName, role, status, createdAt

25. Admin xóa user vi phạm
Mô tả: Admin xóa tài khoản user vi phạm.
Ghi chú: Chỉ đánh dấu status = "banned" trong Firestore. Không cần xóa khỏi Firebase Auth.
Người làm: Khôi
Input: uid string
Output: users/{uid} update status = "banned"

26. Admin xóa task hoặc product vi phạm
Mô tả: Admin xóa các bài đăng vi phạm.
Ghi chú: Dùng status = "hidden" để tránh mất dữ liệu.
Người làm: Khôi
Input: taskId hoặc productId
Output: Doc update status = "hidden"


PHẦN 3 — P2 NÊN CÓ (11 tính năng)


Nhóm A — Auth
Phân tầng nội bộ:
- Tier B: Cả nhóm (không ảnh hưởng P1)

27. Xác thực OTP qua email
Mô tả: Sau khi đăng ký, gửi mã OTP 6 số về email, user nhập để xác thực.
Ghi chú: Có thể mock bằng hard-code "123456" cho demo.
Người làm: Khôi
Input: email string, otp string
Output: users/{uid} update isVerified = true


Nhóm B — Bảng việc vặt
Phân tầng nội bộ:
- Tier B: Hủy/hoàn thành việc

28. Hủy hoặc hoàn thành việc
Mô tả: User hủy task đang làm, hoặc đánh dấu hoàn thành sau khi giao xong.
Ghi chú: Nếu hủy thì status = "cancelled". Nếu hoàn thành thì status = "completed".
Người làm: Phúc
Input: taskId string, newStatus TaskStatus
Output: tasks/{taskId} update status


Nhóm C — Gia sư
Phân tầng nội bộ:
- Tier B: Toàn bộ nhóm C (không ảnh hưởng demo)

29. Đăng ký làm gia sư
Mô tả: User đăng ký làm gia sư, chọn môn, khối, giá mỗi giờ.
Ghi chú: Lưu vào collection tutors với tutorId = uid.
Người làm: Khôi
Input: CreateTutorProfileInput
Output: Doc mới trong tutors

30. Xem danh sách gia sư
Mô tả: Hiển thị danh sách các gia sư đã đăng ký.
Ghi chú: Có thể filter theo môn.
Người làm: Khôi
Input: subject? string, gradeLevel? string
Output: Danh sách Tutor

31. Xem profile gia sư
Mô tả: Hiển thị thông tin chi tiết của 1 gia sư.
Ghi chú: Bao gồm điểm uy tín và review.
Người làm: Khôi
Input: tutorId string
Output: Màn hình profile gia sư


Nhóm D — Chợ đồ cũ
Phân tầng nội bộ:
- Tier B: Đánh dấu đã bán, Lọc danh mục

32. Đánh dấu đã bán
Mô tả: Người bán đánh dấu sản phẩm đã bán.
Ghi chú: Chỉ người bán mới có quyền đánh dấu.
Người làm: Khôi
Input: productId string
Output: products/{productId} update status = "sold"

33. Lọc sản phẩm theo danh mục
Mô tả: Lọc chợ đồ cũ theo danh mục sách, đồ điện tử, nội thất, quần áo, khác.
Ghi chú: Dùng query đơn giản với where category == X.
Người làm: Khôi
Input: category ProductCategory
Output: Danh sách Product đã lọc


Nhóm E — Chat
Phân tầng nội bộ:
- Tier B: Gửi ảnh, Make Offer

34. Gửi ảnh trong chat
Mô tả: User gửi ảnh trong khung chat.
Ghi chú: Upload ảnh lên Storage trước, sau đó gửi message kèm imageUrl.
Người làm: Khôi
Input: imageUri string, conversationId string
Output: Message với imageUrl khác null

35. Make Offer thù lao
Mô tả: User đề nghị mặc cả thù lao cho 1 task.
Ghi chú: Có thể làm đơn giản bằng cách gửi tin nhắn có format đặc biệt.
Người làm: Khôi
Input: taskId string, offeredBounty number
Output: Tin nhắn đề nghị trong conversation


Nhóm G — Lịch sử
Phân tầng nội bộ:
- Tier B: Xem lịch sử giao dịch

36. Xem lịch sử giao dịch
Mô tả: User xem lại các task đã nhận hoặc đã đăng trong quá khứ.
Ghi chú: Query tasks where workerId == uid hoặc requesterId == uid.
Người làm: Khôi
Input: userId string
Output: Danh sách Task đã completed hoặc cancelled


Nhóm H — Thông báo
Phân tầng nội bộ:
- Tier B: Push khi có tin nhắn mới

37. Push notification khi có tin nhắn mới
Mô tả: Khi nhận tin nhắn mới, gửi push notification.
Ghi chú: Chỉ làm nếu còn thời gian. Không ảnh hưởng P1.
Người làm: Phúc
Input: message mới
Output: Notification hiện trên thiết bị


PHẦN 4 — P3 CẮT BỎ (3 tính năng)

38. Check-in trạng thái đang rảnh (Kịch bản A)
Lý do cắt: Tập trung vào Kịch bản B là bài toán khó chính. Kịch bản A cần thêm UI check-in và logic push theo thời gian thực, không cần thiết cho đồ án cơ sở ngành.

39. Report user vi phạm
Lý do cắt: Cần hệ thống moderation phức tạp, không cần cho demo. Admin đã có chức năng xóa user hoặc task vi phạm thủ công ở mục 24, 25, 26.

40. Chặn user khác
Lý do cắt: Không cần cho demo. Không ảnh hưởng đến luồng chính.


PHẦN 5 — CÁC MỤC ĐÃ GỘP HOẶC TRÙNG

Các mục dưới đây có trong danh sách 40 gốc nhưng đã được gộp vào mục khác, không làm riêng:

- Tìm gia sư theo môn (gốc #16) — Gộp vào mục 30. Chỉ cần filter theo môn, không cần tính năng riêng.
- Tìm việc quanh vị trí (gốc #29) — Gộp vào mục 8. Feed việc vặt đã tự động lọc theo vị trí.
- Xóa tài khoản tự động (gốc #39) — Gộp vào mục 25. Chỉ admin xóa được, không cho user tự xóa.


PHẦN 6 — MA TRẬN ƯU TIÊN

Impact cao, Effort cao
- Gợi ý việc dọc tuyến (mục 21)
- Nhắn tin 1-1 realtime (mục 16)

Impact cao, Effort thấp
- Đăng nhập, đăng ký, đăng xuất (mục 1, 2, 3)
- Feed việc vặt (mục 8)
- Xem chi tiết việc (mục 9)
- Đánh giá 1-5 sao (mục 22)

Impact thấp, Effort cao
- Push notification (mục 23)
- Admin panel (mục 24, 25, 26)

Impact thấp, Effort thấp
- Tìm kiếm, lọc việc (mục 11, 12)
- Đăng bán đồ cũ (mục 13)


PHẦN 7 — CAM KẾT

- P1 sẽ hoàn thành 100% trước 15/12/2026.
- P2 sẽ làm nếu còn thời gian, không ảnh hưởng P1.
- P3 không làm, không bàn thêm.
- Nếu giảng viên yêu cầu thêm tính năng ngoài danh sách này, cả nhóm họp lại và cập nhật file này trước khi code.
- Không thêm thư viện mới ngoài stack ở Phần 0 mà không báo người còn lại.

Ký tên:
- Hoàng Phúc: ___________
- Minh Khôi: ___________