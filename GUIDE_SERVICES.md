# Hướng Dẫn Chỉnh Dịch Text Services Qua i18n

Tài liệu này cung cấp hướng dẫn chi tiết về cách chỉnh sửa nội dung phần "Services" (Dịch vụ) trong portfolio qua hệ thống quốc tế hóa (i18n).

## Cấu Trúc File Dịch Vụ

Những nội dung dịch vụ được lưu trữ trong các file JSON nằm ở thư mục:
```
E:\Project\nhut-portfolio\lib\i18n\
```

Mỗi ngôn ngữ có một file JSON riêng:
- `en.json` - Tiếng Anh
- `vi.json` - Tiếng Việt
- `ja.json` - Tiếng Nhật
- `zh.json` - Tiếng Trung
- `ko.json` - Tiếng Hàn
- `de.json` - Tiếng Đức
- `fr.json` - Tiếng Pháp

## Vị Trí Nội Dung Services

Trong mỗi file JSON, nội dung dịch vụ nằm trong đối tượng `"services"`:
```json
{
  "services": {
    "tag": "// dịch vụ",
    "title": "Dịch vụ",
    "titleHighlight": "Freelance & Bảng giá",
    "hourlyTitle": "Giá thuê theo giờ",
    "hourlyPrice": "$12/giờ",
    "hourlyDesc": "Linh hoạt cho các tác vụ nhỏ, sửa lỗi, review code, hoặc thêm tính năng vào dự án hiện tại của bạn.",
    "packagesTitle": "Các gói dự án",
    "package1Title": "Landing Page",
    "package1Price": "từ $100",
    "package1Time": "3–5 ngày",
    "package1Features": [
      "Trang React / Next.js responsive",
      "SEO cơ bản + analytics",
      "Tích hợp form liên hệ",
      "Thiết kế mobile-first"
    ],
    "package2Title": "Web App / MVP",
    "package2Price": "từ $550",
    "package2Time": "2–4 tuần",
    "package2Features": [
      "Full-stack React + Node.js",
      "Xác thực + phân quyền (RBAC)",
      "Thiết kế & tích hợp database",
      "Triển khai (Docker / AWS)"
    ],
    "package3Title": "E-commerce / Nền tảng",
    "package3Price": "Báo giá riêng",
    "package3Time": "4–8 tuần",
    "package3Features": [
      "Kiến trúc modular monolith",
      "Thanh toán (Stripe) + admin dashboard",
      "Testing & CI/CD",
      "Tùy chọn bảo trì lâu dài"
    ],
    "note": "Hãy gửi email với chi tiết dự án để nhận báo giá phù hợp. Tư vấn 30 phút miễn phí cho mỗi dự án mới."
  }
}
```

## Các Trường Cần Chỉnh Sửa

### 1. Thông Tin Chung
- `"tag"`: Comment để phân đoạn trong file (tùy chọn)
- `"title"`: Tiêu đề chính phần dịch vụ
- `"titleHighlight"`: Tiêu đề phụ hoặc nhấn mạnh

### 2. Giá Theo Giờ
- `"hourlyTitle"`: Tiêu đề phần giá theo giờ
- `"hourlyPrice"`: Giá theo giờ (ví dụ: "$9/giờ")
- `"hourlyDesc"`: Mô tả dịch vụ theo giờ

### 3. Gói Dự Án (Có thể có nhiều gói)
Mỗi gói có cấu trúc tương tự:
- `"packageXTitle"`: Tên gói (X là số gói)
- `"packageXPrice"`: Giá gói
- `"packageXTime"`: Thời gian hoàn thành
- `"packageXFeatures"`: Mảng các tính năng trong gói

### 4. Ghi Chú
- `"note"`: Ghi chú quan trọng hoặc hướng dẫn cho khách hàng

## Quy Trình Chỉnh Sửa

### Bước 1: Xác Định Ngôn Ngữ Cần Chỉnh Sửa
Xác định bạn muốn chỉnh sửa nội dung cho ngôn ngữ nào (tiếng Việt, tiếng Anh, etc.)

### Bước 2: Mở File JSON Ứng Dụng
Mở file JSON tương ứng trong thư mục `lib/i18n/`:
- Tiếng Việt: `vi.json`
- Tiếng Anh: `en.json`
- Và cứ thế cho các ngôn ngữ khác

### Bước 3: Tìm Đối Tượng "services"
Tìm và mở rộng đối tượng `"services"` trong file JSON

### Bước 4: Chỉnh Sửa Các Trường Cần Thay Đổi
- Thay đổi giá trị của các trường muốn sửa
- Giữ nguyên cấu trúc JSON (dấu phẩy, dấu ngoặc, etc.)
- Đối với mảng features: Thêm, xóa, hoặc sửa các chuỗi trong mảng

### Bước 5: Lưu File và Kiểm Tra
- Lưu file sau khi chỉnh sửa
- Kiểm tra xem có lỗi cú pháp JSON không (có thể dùng công cụ như JSONLint)
- Khởi động lại dev server nếu cần để thấy thay đổi

## Ví Dụ Thực Tế

### Thay Đổi Giá Theo Giờ
**Trước:**
```json
"hourlyPrice": "$12/giờ",
```

**Sau:**
```json
"hourlyPrice": "$15/giờ",
```

### Thêm Tính Năng Vào Gói
**Trước:**
```json
"package1Features": [
  "Trang React / Next.js responsive",
  "SEO cơ bản + analytics",
  "Tích hợp form liên hệ",
  "Thiết kế mobile-first"
],
```

**Sau:**
```json
"package1Features": [
  "Trang React / Next.js responsive",
  "SEO cơ bản + analytics",
  "Tích hợp form liên hệ",
  "Thiết kế mobile-first",
  "Tối ưu hiệu năng"
],
```

### Thay Đổi Tên Gói
**Trước:**
```json
"package2Title": "Web App / MVP",
```

**Sau:**
```json
"package2Title": "Ứng dụng web đầy đủ tính năng",
```

## Lưu Ý Quan Trọng

### 1. Định Dạng JSON
- Đảm bảo luôn giữ cấu trúc JSON hợp lệ
- Dấu phẩy phân cách giữa các trường (trừ trường cuối cùng trong đối tượng)
- Chuỗi phải được bao quanh bằng dấu ngoặc kép (`"`)
- Không sử dụng comentarios trong JSON chuẩn (trừ khi dùng "//" như trong dự án này)

### 2. Đồng Bộ Ngôn Ngữ
Khi chỉnh sửa cho một ngôn ngữ, nhớ thực hiện同样 thay đổi cho các ngôn ngữ khác nếu bạn muốn duy trì tính đồng bộ
- Mỗi ngôn ngữ nên có nội dung tương đương
- Cân nhắc sử dụng công cụ dịch thuật chuyên nghiệp cho nội dung quan trọng

### 3. Kiểm Tra Sau Khi Chỉnh Sửa
- Chạy `npm run dev` để xem thay đổi trong môi trường phát triển
- Kiểm tra cả chế độ sáng và tối
- Kiểm tra trên các thiết bị khác nhau (mobile, tablet, desktop)
- Đảm bảo không có lỗi hiển thị hoặc lỗi cú pháp

### 4. Bảo Trì Dài Hạn
- Ghi lại những thay đổi quan trọng để tham khảo trong tương lai
- Xem xét định kỳ nội dung dịch vụ để đảm bảo nó vẫn chính xác và cạnh tranh
- Lắng nghe phản hồi từ khách hàng để cải thiện mô tả dịch vụ

## Troubleshooting

### "Không thấy thay đổi sau khi lưu file"
1. Đảm bảo bạn đã lưu file đúng vị trí
2. Khởi động lại dev server (`npm run dev`)
3. Xóa cache trình duyệt hoặc truy cập qua cửa sổ ẩn danh
4. Kiểm tra xem có lỗi trong terminal khi khởi động không

### "Lỗi cú pháp JSON"
1. Kiểm tra lại dấu ngoặc kép, dấu ngoặc nhọn, dấu phẩy
2. Đảm bảo không có dấu phẩy thừa sau trường cuối cùng
3. Sử dụng công cụ kiểm tra JSON như JSONLint
4. So sánh với file gốc để xem sự khác biệt

### "Nội dung hiển thị không đúng"
1. Đảm bảo bạn đang chỉnh sửa file ngôn ngữ đúng
2. Kiểm tra xem có lỗi chính tả trong key không (ví dụ: "services" vs "service")
3. Kiểm tra i18n provider trong LanguageContext.tsx có đang tải file đúng không
4. Kiểm tra xem component Services.tsx có đang sử dụng key đúng không

## Liên Hệ

Nếu bạn gặp khó khăn trong quá trình chỉnh sửa hoặc có câu hỏi về hệ thống i18n, vui lòng tham khảo:
- File `lib/i18n/LanguageContext.tsx` để hiểu cách i18n được triển khai
- Component `src/components/Services.tsx` để xem cách sử dụng i18n keys
- Tài liệu Next.js về internationalization (nếu適用)