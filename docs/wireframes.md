# UNISHARE — TÀI LIỆU WIREFRAME VÀ ĐẶC TẢ GIAO DIỆN (UI/UX)
**Dự án:** Ứng dụng hỗ trợ sinh viên đa tiện ích UniShare  
**Giai đoạn:** Giai đoạn 3 — Thiết kế giao diện (UI/UX)  
**Người phụ trách:** Minh Khôi (UI/UX Designer & Frontend)  
**Quy chuẩn thiết kế:**
- **Thiết bị chuẩn (Frame Figma):** iPhone 14/15 (390 x 844 px) và Android Large (360 x 800 px)
- **Hệ thống lưới (Grid):** 8-point Grid System (Padding lề 16px, khoảng cách khối 8px/16px/24px)
- **Design Tokens:** Sử dụng bảng token từ `src/theme/tokens.ts` và `docs/design/tokens.json`

---

## 1. Bản đồ tổng thể cấu trúc điều hướng (Information Architecture)

```
[Khởi động App]
       │
       ▼
 ┌───────────────┐
 │ Auth Navigator│
 ├───────────────┤
 │ 1. Login      │
 │ 2. Register   │
 │ 3. Forgot PW  │
 │ 4. Verify Edu │
 └───────┬───────┘
         │ (Đăng nhập thành công)
         ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    Main Bottom Tab Navigator                │
 ├─────────────┬─────────────┬─────────────┬───────────────────┤
 │  [Tab 1]    │  [Tab 2]    │  [Tab 3]    │     [Tab 4]       │
 │   Khám phá  │   Bản đồ    │   Tin nhắn  │     Cá nhân       │
 │ (Feed/Chợ)  │ (Matching)  │  (Chat 1-1) │ (Profile & Trust) │
 └──────┬──────┴──────┬──────┴──────┬──────┴─────────┬─────────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
 - Chi tiết việc  - Vẽ tuyến   - Chat Room     - Sửa hồ sơ
 - Chi tiết hàng  - Bottom     - Make Offer    - Đánh giá sao
 - Tạo việc mới     Sheet        thù lao       - Lịch sử việc
 - Đăng bán đồ      gợi ý                      - [Admin Panel]
```

---

## 2. Đặc tả Wireframe từng màn hình

### 2.1. Nhóm Xác thực (Auth Flow)

#### Màn hình 1: Đăng nhập (LoginScreen)
- **Mục đích:** Người dùng đăng nhập vào hệ thống UniShare.
- **Thành phần UI:**
  - Logo UniShare + Tên app
  - Input: Email sinh viên (`@*.edu.vn`)
  - Input: Mật khẩu (kèm icon ẩn/hiện)
  - Link: "Quên mật khẩu?"
  - Button: "Đăng nhập" (Primary, màu `#2563EB`)
  - Link điều hướng: "Chưa có tài khoản? Đăng ký ngay"
- **Wireframe Layout:**
```
+-----------------------------------+
|  [Status Bar]                     |
|                                   |
|             [LOGO]                |
|            UniShare               |
|      Chào mừng bạn trở lại!       |
|                                   |
|   +---------------------------+   |
|   | [icon] Email sinh viên    |   |
|   +---------------------------+   |
|   +---------------------------+   |
|   | [icon] Mật khẩu      [eye]|   |
|   +---------------------------+   |
|                                   |
|              [Quên mật khẩu?]     |
|                                   |
|   +---------------------------+   |
|   |       ĐĂNG NHẬP           |   |
|   +---------------------------+   |
|                                   |
|     Chưa có tài khoản? Đăng ký    |
+-----------------------------------+
```

#### Màn hình 2: Đăng ký tài khoản (RegisterScreen)
- **Mục đích:** Đăng ký tài khoản sinh viên với ràng buộc đuôi `.edu.vn`.
- **Thành phần UI:**
  - Header: Nút Back + Tiêu đề "Tạo tài khoản"
  - Input: Họ và tên
  - Input: Email sinh viên (Placeholder: `user@hcmus.edu.vn`)
  - Input: Số điện thoại liên hệ
  - Input: Mật khẩu & Nhập lại mật khẩu
  - Checkbox: "Tôi đồng ý với Điều khoản sinh viên UniShare"
  - Button: "Đăng ký"
- **Wireframe Layout:**
```
+-----------------------------------+
| [<-]  Đăng ký tài khoản           |
|                                   |
|   +---------------------------+   |
|   | [icon] Họ và tên          |   |
|   +---------------------------+   |
|   +---------------------------+   |
|   | [icon] Email (.edu.vn)    |   |
|   +---------------------------+   |
|   +---------------------------+   |
|   | [icon] Số điện thoại      |   |
|   +---------------------------+   |
|   +---------------------------+   |
|   | [icon] Mật khẩu           |   |
|   +---------------------------+   |
|   +---------------------------+   |
|   | [icon] Nhập lại mật khẩu  |   |
|   +---------------------------+   |
|   [x] Đồng ý điều khoản           |
|                                   |
|   +---------------------------+   |
|   |        ĐĂNG KÝ            |   |
|   +---------------------------+   |
+-----------------------------------+
```

---

### 2.2. Nhóm Bảng tin & Chợ sinh viên (Feed & Market)

#### Màn hình 3: Bảng tin việc vặt & Chợ đồ cũ (HomeFeedScreen)
- **Mục đích:** Màn hình chính sau khi đăng nhập, chia 2 phân hệ Việc vặt và Chợ thanh lý qua Segmented Tabs.
- **Thành phần UI:**
  - Top Bar: Avatar cá nhân, Tên trường/Vị trí hiện tại, Icon Chuông thông báo
  - Search Bar: "Tìm việc vặt, giáo trình, đồ dùng..."
  - Tab Switcher: `[ Việc vặt ] | [ Chợ đồ cũ ]`
  - Filter Chips: `[Gần nhất < 5km] [Thù lao cao] [Giao nhận] [Mua đồ ăn]`
  - Danh sách bài đăng (FlatList) dạng thẻ Card:
    - TaskCard: Avatar người đăng, Tiêu đề, Badge thù lao (Màu xanh Emerald), Địa điểm lấy -> Địa điểm giao, Khoảng cách (VD: `1.2 km`)
  - Nút Floating Action Button (+): Tạo bài đăng mới
- **Wireframe Layout:**
```
+-----------------------------------+
| [Avatar] ĐH Quốc Gia TP.HCM  [🔔] |
|                                   |
| [ 🔍 Tìm kiếm việc, tài liệu... ] |
|                                   |
| +-------------------------------+ |
| |   [VIỆC VẶT]  |   [CHỢ CŨ]    | |
| +-------------------------------+ |
| [Gần tôi 5km] [Thù lao >30k] [Lọc]|
|-----------------------------------|
| +-------------------------------+ |
| | [Avatar] Nguyễn Văn A   15p trước|
| | Nhận hộ đồ Shopee tại KTX B   | |
| | 📍 Điểm lấy: Cổng KTX Khu B   | |
| | 🏁 Điểm giao: Phòng 402 - B3  | |
| | 💰 25.000 đ          1.2 km  | |
| +-------------------------------+ |
| +-------------------------------+ |
| | [Avatar] Trần Thị B     30p trước|
| | In tài liệu môn Giải tích 1   | |
| | 📍 Quán photo Cổng ĐH KHTN   | |
| | 💰 20.000 đ          0.8 km  | |
| +-------------------------------+ |
|                                   |
|                             [(+)] |
|-----------------------------------|
| [🏠 Khám phá] [🗺 Bản đồ] [💬 Chat] [👤 Tôi] |
+-----------------------------------+
```

#### Màn hình 4: Chợ đồ cũ (Market Grid View)
- Khi người dùng chuyển sang Tab `[ Chợ đồ cũ ]`:
- Bố cục chuyển sang hiển thị lưới 2 cột (Grid 2 columns).
- ProductCard gồm: Ảnh sản phẩm tỉ lệ 1:1, Giá tiền (hoặc Badge "Tặng miễn phí"), Tình trạng (`Mới 95%`, `Like New`), Danh mục (`Giáo trình`, `Đồ gia dụng`).
```
+-----------------------------------+
| [ 🔍 Tìm kiếm đồ cũ sinh viên... ]|
| [Tất cả] [Sách/Giáo trình] [Đồ điện]|
|-----------------------------------|
| +---------------+ +---------------+ |
| |   [ ẢNH ]     | |   [ ẢNH ]     | |
| | Giáo trình C++| | Nồi cơm mini  | |
| | 35.000 đ      | | 120.000 đ     | |
| | Mới 90% • 1km | | Dùng tốt • 2km| |
| +---------------+ +---------------+ |
| +---------------+ +---------------+ |
| |   [ ẢNH ]     | |   [ ẢNH ]     | |
| | Bàn học gấp   | | Vợt cầu lông  | |
| | Miễn phí (0đ) | | 80.000 đ      | |
| +---------------+ +---------------+ |
+-----------------------------------+
```

---

### 2.3. Nhóm Chi tiết & Đăng bài mới (Detail & Create)

#### Màn hình 5: Chi tiết việc vặt (TaskDetailScreen)
- **Mục đích:** Hiển thị chi tiết việc cần nhờ, vị trí trên bản đồ thu nhỏ, thù lao và nút Nhận việc.
- **Thành phần UI:**
  - Header: Nút Quay lại + Tiêu đề "Chi tiết việc vặt" + Nút Chia sẻ
  - Card Người yêu cầu: Avatar, Tên, Đánh giá uy tín (`⭐ 4.9 (24 đánh giá)`), Nút nhắn tin nhanh
  - Thông tin việc: Tiêu đề, Mô tả chi tiết, Thời gian cần hoàn thành
  - Bản đồ MiniMap hiển thị Route từ Điểm lấy -> Điểm giao
  - Card Thù lao & Hình thức thanh toán (`Tiền mặt` / `Chuyển khoản`)
  - Bottom Bar cố định:
    - Nếu là người ngoài: Nút **"Nhận việc này"** (Primary Action)
    - Nếu đã nhận hoặc là chủ bài: Trạng thái hiện tại
- **Wireframe Layout:**
```
+-----------------------------------+
| [<-] Chi tiết việc vặt        [➦] |
|-----------------------------------|
| [Avatar] Lê Hoàng Phúc    [Nhắn tin]|
| ⭐ 4.9 (28 đánh giá) • KTX Khu A  |
|-----------------------------------|
| Cần lấy hộ đồ giặt ủi tại cổng KTX |
| "Mình bị sốt nhờ bạn nào lấy hộ   |
| túi đồ giặt khoảng 3kg mang lên..."|
|                                   |
| [=== BẢN ĐỒ MINI ROUTE LẤY-GIAO ==] |
| 📍 Lấy: Tiệm Giặt Sấy 24/7        |
| 🏁 Giao: P.305 Nhà A12 KTX        |
|                                   |
| Thù lao: 30.000 đ (Chuyển khoản)  |
| Hạn chót: Trước 18:30 hôm nay     |
|-----------------------------------|
| [💬 Chat trước]  [ NHẬN VIỆC NGAY ]|
+-----------------------------------+
```

#### Màn hình 6: Form tạo việc mới (CreateTaskScreen)
- **Mục đích:** Người dùng nhập thông tin công việc cần hỗ trợ.
- **Thành phần UI:**
  - Tiêu đề việc vặt
  - Điểm lấy (Chọn vị trí hiện tại hoặc gõ địa chỉ)
  - Điểm giao (Tương tự)
  - Mức thù lao đề xuất (VNĐ)
  - Phương thức thanh toán (Radio: Tiền mặt / Chuyển khoản)
  - Upload ảnh (Hóa đơn, gói hàng, vị trí)
  - Nút "Đăng tin ngay"
- **Wireframe Layout:**
```
+-----------------------------------+
| [X] Đăng việc vặt mới             |
|-----------------------------------|
| Tiêu đề việc (*)                  |
| [VD: Nhận đồ Shopee cổng phụ...]  |
|                                   |
| Địa điểm lấy hàng (*)             |
| [ 📍 Cổng 1 ĐH Khoa học Tự nhiên ] |
|                                   |
| Địa điểm giao hàng (*)            |
| [ 🏁 Phòng 501 Tòa H KTX ĐHQG   ] |
|                                   |
| Thù lao (VNĐ) (*)                 |
| [ 25.000                       đ ] |
|                                   |
| Hình thức: (o) Chuyển khoản  ( ) Tiền mặt
|                                   |
| Ảnh minh họa (Tối đa 3 ảnh)       |
| [+ Thêm ảnh] [Ảnh 1] [Ảnh 2]      |
|                                   |
| Mô tả thêm:                       |
| [Gói hàng nhỏ, khoảng 1kg...]     |
|                                   |
| +-------------------------------+ |
| |        ĐĂNG VIỆC NGAY         | |
| +-------------------------------+ |
+-----------------------------------+
```

---

### 2.4. Bản đồ & Gợi ý việc dọc tuyến đường (Map & Route Matching — Feature P1 trọng tâm)

#### Màn hình 7: Bản đồ và gợi ý tiện đường (RouteMatchingScreen)
- **Mục đích:** Người dùng nhập điểm xuất phát và điểm đến của mình (ví dụ từ trường về KTX); hệ thống dùng thuật toán Point-to-Segment tìm các việc tiện đường (lệch tối đa 300m).
- **Thành phần UI:**
  - Map View (Google Maps / Mapbox) toàn màn hình
  - Khung nhập lộ trình: `[Điểm đi: ĐH CNTT] -> [Điểm đến: KTX Khu B]`
  - Đường Polyline màu xanh biển thể hiện lộ trình chính
  - Các Marker màu cam/xanh là các task tiện đường
  - **Draggable BottomSheet (Ngăn kéo vuốt lên):**
    - Tiêu đề: "Tìm thấy 3 việc tiện đường đi của bạn"
    - Danh sách Task kèm thông tin độ lệch đường (VD: `Tiện đường • Lệch chỉ 120m • +25.000đ`)
- **Wireframe Layout:**
```
+-----------------------------------+
| +-------------------------------+ |
| | 🟢 Điểm đi: ĐH CNTT (UIT)     | |
| | 🔴 Điểm đến: KTX Khu B        | |
| +-------------------------------+ |
|                                   |
|           / \   [Task 1 📍]       |
|          /   \                    |
|   ======/=====\================   |
|        /  Polyline Lộ trình       |
|       /        [Task 2 📍]        |
|                                   |
| +===============================+ |
| |  === [DRAGGABLE HANDLE] ===   | |
| | 🔥 3 việc tiện lộ trình này   | |
| | ----------------------------- | |
| | 📦 Nhận trà sữa mang về KTX B | |
| |    +20.000đ • Lệch 80m        | |
| | ----------------------------- | |
| | 📄 Lấy tài liệu tại thư viện  | |
| |    +15.000đ • Lệch 150m       | |
| +===============================+ |
| [🏠 Khám phá] [🗺 Bản đồ] [💬 Chat] [👤 Tôi] |
+-----------------------------------+
```

---

### 2.5. Nhóm Tin nhắn & Hội thoại (Chat 1-1)

#### Màn hình 8: Danh sách cuộc trò chuyện (ConversationListScreen)
- **Mục đích:** Quản lý các hội thoại đang diễn ra liên quan đến việc vặt hoặc trao đổi đồ cũ.
- **Thành phần UI:**
  - Header: "Tin nhắn"
  - Search bar lọc danh sách người chat
  - Item Hội thoại: Avatar, Tên, Badge liên quan (`[Việc #102]`), Tin nhắn cuối, Giờ gửi, Badge tin nhắn chưa đọc
- **Wireframe Layout:**
```
+-----------------------------------+
| Tin nhắn                      [🔍]|
|-----------------------------------|
| [Avatar] Lê Hoàng Phúc      10:24 |
| 🏷 Việc: Lấy hộ trà sữa            |
| "Mình đang đứng ở cổng quán rồi..."|
|                                [2]|
|-----------------------------------|
| [Avatar] Trần Thị Mai       Hôm qua|
| 🏷 Chợ: Giáo trình C++            |
| "Bạn còn sách này không ạ?"       |
|-----------------------------------|
| [Avatar] Nguyễn Văn C       12/10 |
| 🏷 Việc: Photo tài liệu           |
| "Cảm ơn bạn nhiều nhé!"           |
+-----------------------------------+
```

#### Màn hình 9: Khung chat 1-1 & Mặc cả thù lao (ChatRoomScreen)
- **Mục đích:** Chat realtime giữa 2 sinh viên, có gắn thẻ thông tin giao dịch ở đầu trang và tính năng Make Offer.
- **Thành phần UI:**
  - Header: Back, Avatar, Tên đối tác, Nút gọi điện / menu
  - Pinned Context Card: Tóm tắt Task/Product đang trao đổi (`Thù lao: 30k`)
  - Vùng chat: MessageBubble (Bên trái: đối phương; Bên phải: người dùng)
  - Card đề nghị thù lao mới (Make Offer Card): `Đề xuất giá mới: 35.000đ [Đồng ý] [Từ chối]`
  - Input Bar: Nút gửi ảnh (+), Ô nhập nội dung, Nút Offer ($), Nút Send
- **Wireframe Layout:**
```
+-----------------------------------+
| [<-] [Avatar] Lê Hoàng Phúc   [⋮] |
|-----------------------------------|
| 📌 Đang bàn về: Lấy đồ giặt (30k) |
|-----------------------------------|
|        [10:15 - Hôm nay]          |
|                                   |
| (Đối tác): Chào bạn, bạn tiện     |
| đường mang qua tòa A12 giúp mình? |
|                                   |
|          (Tôi): Được bạn nhé,     |
|          nhưng đồ hơi nặng...     |
|                                   |
| +-------------------------------+ |
| | 🤝 ĐỀ NGHỊ THÙ LAO MỚI        | |
| | Hoàng Phúc đề xuất: 35.000 đ  | |
| |   [ TỪ CHỐI ]   [ ĐỒNG Ý ]    | |
| +-------------------------------+ |
|                                   |
|-----------------------------------|
| [+] [ $ ] [ Nhập tin nhắn...  ] [➤]|
+-----------------------------------+
```

---

### 2.6. Nhóm Hồ sơ cá nhân & Đánh giá uy tín (Profile & Trust)

#### Màn hình 10: Hồ sơ cá nhân & Điểm uy tín (ProfileScreen)
- **Mục đích:** Xem và chỉnh sửa thông tin cá nhân, xem Trust Score (thang 0.0 - 5.0) và lịch sử đánh giá từ bạn học.
- **Thành phần UI:**
  - Card User Profile: Avatar, Họ tên, Mã trường (`ĐH CNTT - ĐHQG`), Badge "Đã xác thực email Edu"
  - Trust Score Card: Điểm sao lớn (`⭐ 4.9 / 5.0`), Số lượng review (`32 đánh giá`), Tỉ lệ hoàn thành (`98%`)
  - Menu chức năng:
    - Lịch sử việc đã nhận (Worker)
    - Lịch sử việc đã đăng (Requester)
    - Bài đăng chợ đồ cũ của tôi
    - Cài đặt tài khoản / Đổi mật khẩu
    - Nút "Đăng xuất"
- **Wireframe Layout:**
```
+-----------------------------------+
| Cá nhân                       [⚙] |
|-----------------------------------|
|              [AVATAR]             |
|          Nguyễn Minh Khôi         |
|      khoi.nm@uit.edu.vn           |
|      [✔ Đã xác thực Edu]          |
|                                   |
| +-------------------------------+ |
| |  ĐIỂM UY TÍN SINH VIÊN        | |
| |    ⭐ 4.9 / 5.0                | |
| |    32 Đánh giá • 100% Hoàn tất| |
| +-------------------------------+ |
|                                   |
| [📋] Việc tôi đã nhận         (14)|
| [📤] Việc tôi đã đăng          (8)|
| [🛍] Đồ cũ đang rao bán        (3)|
| [⭐] Xem tất cả đánh giá       (32)|
|                                   |
| [🔴 Đăng xuất]                    |
|-----------------------------------|
| [🏠 Khám phá] [🗺 Bản đồ] [💬 Chat] [👤 Tôi] |
+-----------------------------------+
```

#### Màn hình 11: Màn hình Đánh giá đối tác (ReviewRatingScreen)
- **Mục đích:** Đánh giá chất lượng sau khi giao dịch/hoàn thành việc.
- **Thành phần UI:**
  - Avatar & Tên đối tác cần đánh giá
  - Chọn sao: 5 ngôi sao lớn tương tác chạm (1 đến 5 sao)
  - Quick Tags: `[Đúng giờ] [Thân thiện] [Nhiệt tình] [Cẩn thận]`
  - Ô nhận xét cảm nghĩ (TextArea)
  - Nút "Gửi đánh giá"
- **Wireframe Layout:**
```
+-----------------------------------+
| [X] Đánh giá giao dịch            |
|-----------------------------------|
|             [AVATAR]              |
|        Lê Hoàng Phúc              |
|      "Giao nhận gói đồ Shopee"    |
|                                   |
|     Bạn thấy trải nghiệm thế nào? |
|         ⭐ ⭐ ⭐ ⭐ ⭐             |
|            (5 / 5 sao)            |
|                                   |
|  [Đúng giờ] [Thân thiện] [Cẩn thận]|
|                                   |
|  Nhận xét thêm:                   |
|  +-----------------------------+  |
|  | Bạn giao rất nhanh và đúng   |  |
|  | hẹn, cảm ơn bạn nhiều nhé!  |  |
|  +-----------------------------+  |
|                                   |
|  +-----------------------------+  |
|  |        GỬI ĐÁNH GIÁ         |  |
|  +-----------------------------+  |
+-----------------------------------+
```

---

## 3. Quy chuẩn Design Tokens và Hướng dẫn Figma cho Designer

### 3.1. Hướng dẫn thiết lập trong Figma
1. **Khởi tạo Variables trong Figma:**
   - Tạo Collection: `UniShare Design Tokens`.
   - Import trực tiếp file `docs/design/tokens.json` bằng plugin **Tokens Studio for Figma** hoặc tạo các Color/Number Variables theo đúng cấu trúc mã hex đã định nghĩa.
2. **Khởi tạo Typography Styles:**
   - Font family: `Inter` (hoặc System font)
   - Title/Display: `24px - Bold`
   - Subtitle: `18px - Semibold`
   - Body text: `16px - Regular`
   - Caption: `12px - Medium`
3. **Thư viện Components tái sử dụng (Atomic Design):**
   - **Atoms:** `PrimaryButton`, `SecondaryButton`, `InputField`, `Avatar`, `Badge`, `TagChip`.
   - **Molecules:** `SearchBar`, `FilterModal`, `MessageBubble`, `RatingBar`.
   - **Organisms:** `TaskCard`, `ProductCard`, `BottomSheet`, `ConversationItem`.

---
*Tài liệu này là căn cứ để Minh Khôi dựng bản mockup chi tiết trên Figma và để Hoàng Phúc căn cứ triển khai mã nguồn Component & Navigation.*
