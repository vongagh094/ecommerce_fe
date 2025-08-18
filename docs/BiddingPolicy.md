# BÁO CÁO CHI TIẾT: QUY TRÌNH, QUY ĐỊNH VÀ CHÍNH SÁCH BIDDING CỦA AIRBNB CLONE

## I. MỤC TIÊU

* Tối ưu doanh thu cho chủ nhà (host)
* Đảm bảo sự công bằng và minh bạch cho khách đặt phòng (guest)
* Cho phép nhiều chiến lược bidding để phù hợp với các kịch bản thực tế

---

## II. CHÍNH SÁCH BIDDING CHÍNH THỨC ÁP DỤNG

### PAY-WHAT-YOU-BID + PARTIAL AWARD (LỰA CHỌN MẶC ĐỊNH)

### 1. Cơ chế bid:

* Mỗi khách gửi một bid với thông tin:

  * `check_in`, `check_out`
  * `total_amount`
  * `allow_partial` (boolean): cho biết khách có chấp nhận booking một phần không
  * thời gian gửi bid
* Mỗi bid được tính thành giá/đêm = `total_amount ÷ số đêm`

### 2. Thuật toán chọn người thắng (Winner Selection)

#### Bước 1: Tính toán giá trị mỗi bid

* Với mỗi bid: `price_per_night = total_amount / (check_out - check_in)`

#### Bước 2: Giải bài toán Weighted Interval Scheduling (WIS)

* Chọn tập các bid **không chồng lấn (non-overlapping)** và có **tổng giá trị cao nhất**
* Đây là tập "người thắng chính thức" — được cấp đúng các đêm đã bid, không chồng nhau

#### Bước 3: Xử lý Partial Award cho người thua

* Với các bid bị loại, nếu khách có `allow_partial = true`:

  * Tìm các đêm còn trống (không bị chồng lấn với người thắng)
  * Nếu đủ một chuỗi đêm liên tiếp → cấp partial booking
  * Giá giữ nguyên theo bid gốc (pay-what-you-bid)

#### Lưu ý:

* Nếu khách không nhận full range, hệ thống sẽ yêu cầu xác nhận trước khi ghi booking
* Nếu khách không cho phép partial, thì bid bị loại hoàn toàn nếu không thắng nguyên range

### 3. Second Chance Offer (Cơ hội thứ hai)

#### Mục tiêu:

* Tối ưu các đêm bị trả lại do khách từ chối partial hoặc timeout

#### Quy trình:

##### Bước 1: Phát hiện đêm bị trả lại

* Khi khách từ chối partial hoặc không phản hồi sau thời gian cho phép

##### Bước 2: Tìm ứng viên nhận lại

* Lọc các bid thỏa điều kiện:

  * Có `allow_partial = true`
  * Có các đêm trùng với đêm bị trả lại
  * Không overlap với các booking đã xác nhận
  * Chưa từng nhận offer cho đêm đó hoặc đã timeout

##### Bước 3: Sắp xếp và gửi offer

* Sắp xếp theo `price_per_night` giảm dần
* Gửi offer cho từng ứng viên theo thứ tự, mỗi lượt có thời gian phản hồi (ví dụ 2 phút)

##### Bước 4: Phản hồi và hành động

| Phản hồi          | Hành động                               |
| ----------------- | --------------------------------------- |
| Accept            | Tạo booking, cập nhật calendar          |
| Decline / Timeout | Gửi tiếp cho ứng viên tiếp theo         |
| Không ai nhận     | Mở đêm đó cho đặt thường hoặc giữ trống |

#### Ví dụ minh hoạ:

* C bid cho T3–T6, thắng nhưng từ chối T5–T6
* Đêm T5–T6 được offer lại cho B (bid thấp hơn nhưng còn hợp lệ)
* B nhận → booking mới cho B được tạo

---

## III. CHÍNH SÁCH TỐI ƯU DOANH THU (REVENUE STRATEGIES)

### 1. Maximizing Total Revenue (Tối đa tổng doanh thu)

#### Mô tả:

* Chọn tập người thắng có **tổng tiền bid cao nhất** (không cần ưu tiên theo đêm)

#### Thuật toán cài đặt:

* Input: Danh sách tất cả các bid
* Với mỗi bid, tính `price_per_night = total_amount / number_of_nights`
* Áp dụng thuật toán **Weighted Interval Scheduling** theo `total_amount` làm trọng số (weight)
* Giải WIS để tìm tập bid không chồng lấn có tổng `total_amount` lớn nhất

#### Kết quả:

* Cấp các đêm đúng như bid (nếu được chọn)
* Nếu còn trống, tiếp tục xét partial hoặc second chance như bình thường

### 2. Maximizing Revenue by Night (Tối đa doanh thu theo từng đêm)

#### Mô tả:

* Ưu tiên lấp đầy từng đêm với giá cao nhất
* Không nhất thiết phải giữ nguyên full booking request nếu chia nhỏ tối ưu hơn

#### Thuật toán cài đặt:

* Với mỗi đêm cụ thể, tìm bid có `price_per_night` cao nhất và không bị xung đột với booking đã chọn
* Duyệt từ T2 → CN, greedily chọn bid tốt nhất cho từng đêm
* Nếu 2 đêm liên tiếp cùng nằm trong một bid, thì ưu tiên chọn nguyên đoạn nếu toàn bộ đều là highest
* Cho phép gộp thành partial booking nếu liên tiếp

#### Kết quả:

* Tổng doanh thu có thể nhỏ hơn nhưng mỗi đêm được khai thác tối đa
* Một khách có thể chỉ nhận một phần các đêm đã bid

### 3. So sánh hai policy qua các trường hợp

| Trường hợp ví dụ                                                | Maximize Total Revenue                      | Maximize Revenue by Night                        |
| --------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| A bid T2–T6: 10M, B bid T5–T7: 6M                               | A thắng toàn bộ, B bị loại                  | A thắng T2–T4, B thắng T5–T6, T7 được offer tiếp |
| A bid T3–T5: 5M, B bid T5–CN: 9M, C bid T6–CN: 4M               | B được chọn, C bị loại hoàn toàn            | A được T3–T4, B T5, C T6–CN                      |
| A bid full week: 15M, B bid T6–CN: 6M, A allow\_partial = false | A thắng nếu cao nhất                        | B vẫn có thể được cấp T6–CN nếu cao hơn          |
| A bid T2–T4: 5M, B bid T5–CN: 5M (ngắn nhưng giá/đêm cao hơn)   | Nếu A+B = 10M là cao nhất, cả hai được chọn | Ưu tiên B nếu từng đêm B > A                     |
| A bid T2–CN: 14M, B bid T2–T3: 6M, C bid T4–CN: 10M             | A thắng toàn bộ nếu tổng cao nhất           | Có thể chia: B thắng T2–T3, C thắng T4–CN        |

### 4. Hybrid Strategy (Chiến lược kết hợp)

* Host có thể chọn giữa hai policy hoặc đặt trọng số (VD: 60% doanh thu tổng + 40% giá theo đêm)
* Giải bài toán WIS hoặc Greedy tuỳ biến theo chiến lược đã chọn

### 5. UI Cảnh báo minh bạch:

* Hiển thị thông tin mỗi đêm: giá trị cao nhất, số người đã bid, giá thắng hiện tại
* Cảnh báo khi khách bid thấp hơn giá có khả năng thắng

### 6. Phân tích lợi ích & gợi ý chọn chiến lược cho Host

| Mục tiêu của Host                                | Nên chọn Policy                       |
| ------------------------------------------------ | ------------------------------------- |
| Tối đa tổng thu nhập cho kỳ nghỉ dài             | Maximize Total Revenue                |
| Lấp đầy từng đêm với giá cao nhất                | Maximize Revenue by Night             |
| Phòng thường xuyên có khách lưu ngắn hạn         | Maximize Revenue by Night             |
| Host không thích chia nhỏ booking                | Maximize Total Revenue                |
| Host có nhiều slot trống ngắn rời rạc            | Maximize Revenue by Night hoặc Hybrid |
| Host muốn dễ quản lý (ít thay đổi, ít phân mảnh) | Maximize Total Revenue                |
| Mùa cao điểm, muốn tối ưu từng đêm               | Maximize Revenue by Night             |

---

## IV. TỔNG KẾT QUY TẮC HỆ THỐNG

| Tình huống                                | Hệ thống xử lý                                            |
| ----------------------------------------- | --------------------------------------------------------- |
| Khách bid cao nhưng thiếu 1 đêm → bị loại | Nếu allow\_partial: cấp các đêm còn lại                   |
| Người thắng từ chối nhận partial          | Ghi đêm trả lại → gửi second chance offer                 |
| Khách từ chối second chance hoặc timeout  | Gửi tiếp cho người có bid thấp hơn tiếp theo              |
| Đêm không ai nhận sau second chance       | Mở lại cho đặt thường                                     |
| Khách chọn không nhận partial             | Nếu không thắng nguyên vẹn, hệ thống sẽ không cấp đêm nào |

---

## V. CẤU TRÚC HỆ THỐNG XỬ LÝ BIDDING

### Thành phần:

* **Frontend**: Next.js (hiển thị bid, countdown, offer…)
* **Backend**: FastAPI (business logic)
* **Redis**: lưu trạng thái bidding tạm thời, cache calendar
* **RabbitMQ**: trigger async cho second chance, timeout
* **PostgreSQL**: dữ liệu chính về bids, calendar, bookings

### Workflow chi tiết:

1. **User gửi bid**:

   * Next.js gửi API call tới FastAPI
   * FastAPI kiểm tra hợp lệ ➝ ghi vào PostgreSQL (bảng `bids`), cache vào Redis

2. **Kết thúc phiên bidding (mỗi 30s–2 phút):**

   * Cronjob hoặc sự kiện timeout từ Redis/RabbitMQ gọi logic chọn người thắng
   * FastAPI chạy WIS hoặc thuật toán Greedy tùy theo policy hiện tại
   * Cập nhật booking (`bookings`), calendar (`calendar`), Redis

3. **Xử lý partial hoặc second chance**:

   * Nếu từ chối, RabbitMQ gửi job async đến FastAPI
   * FastAPI tìm các bid còn phù hợp, gửi offer mới qua Redis pub/sub hoặc lưu trạng thái offer vào DB

4. **User nhận offer (qua WebSocket hoặc polling)**

   * Nếu accept ➝ booking mới được tạo ➝ cập nhật calendar, Redis

### PostgreSQL Schema:

* `bids`: lưu thông tin mỗi bid (checkin, checkout, total\_amount, allow\_partial...)
* `bookings`: lưu các booking đã xác nhận (user\_id, room\_id, ngày, price...)
* `calendar`: bảng tổng hợp, cho biết ngày nào đã có booking, ai đang giữ
* `offers`: lưu trạng thái second chance (bid\_id, ngày, trạng thái: waiting/accepted/declined...)

### Redis:

* Cache trạng thái `calendar`, mapping ngày ➝ bid\_id tạm thời
* Lưu thời gian timeout cho offer
* Pub/sub cho client để nhận update realtime

### RabbitMQ:

* Gửi job:

  * Khi cần xử lý partial offer (delayed task)
  * Khi bid timeout cần chuyển lượt offer
  * Khi khách từ chối → gửi tiếp cho người kế tiếp

---

Bạn có thể tiếp tục mở rộng thêm:

* Chính sách hoàn tiền / hủy bid
* Cảnh báo spam bid, tính điểm tín nhiệm người dùng
* Bidding UI minh bạch theo từng đêm ("hiện đang cần 180k để giữ đêm này")
* Tùy chỉnh chính sách bidding theo property
