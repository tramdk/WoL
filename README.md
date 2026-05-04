# 🖥️ Wake-on-LAN Dashboard

Giao diện hiện đại giúp quản lý và khởi động máy tính từ xa thông qua giao thức **Wake-on-LAN (WoL)**. Dự án được xây dựng với hiệu ứng mượt mà, hỗ trợ lưu trữ thiết bị cục bộ và tích hợp cả Backend để gửi Magic Packets.


## ✨ Tính năng nổi bật

- **Quản lý thiết bị**: Thêm, xóa và lưu trữ danh sách máy tính của bạn trực tiếp trong trình duyệt (LocalStorage).
- **Wake over WAN**: Hỗ trợ gửi tín hiệu qua địa chỉ IP Public hoặc Tên miền (DDNS) nếu bạn đã cấu hình Port Forwarding trên Router.
- **Giao diện hiện đại**: Sử dụng **Tailwind CSS v4** và **Framer Motion** cho trải nghiệm người dùng mượt mà, cao cấp.
- **Full-stack tích hợp**: Bao gồm sẵn Server Express để xử lý việc gửi gói tin UDP Magic Packet.

## 🛠️ Công nghệ sử dụng

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Express](https://expressjs.com/), [Node-WoL](https://www.npmjs.com/package/wake_on_lan)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- Máy tính cần khởi động phải hỗ trợ và đã bật tính năng **Wake-on-LAN** trong BIOS/UEFI và Windows/Linux settings.

### 2. Cài đặt và chạy cục bộ
```bash
# Clone dự án (nếu có) hoặc tải về
# Cài đặt các thư viện
npm install

# Khởi chạy chế độ phát triển (bao gồm cả Server và Vite)
npm run dev
```

Mặc định, ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📡 Cấu hình mạng (Lưu ý quan trọng)

Để tính năng Wake-on-LAN hoạt động từ môi trường Internet (như website này):

1. **Trên Router**: Bạn cần cấu hình **Port Forwarding** cổng UDP (thường là cổng 7 hoặc 9) trỏ về địa chỉ IP của máy tính cần bật (hoặc địa chỉ Broadcast của mạng LAN).
2. **IP Public**: Sử dụng IP Public của nhà mạng hoặc dịch vụ DDNS (như No-IP, DuckDNS).
3. **Địa chỉ MAC**: Cung cấp chính xác địa chỉ MAC của card mạng LAN trên máy tính mục tiêu.

## 📁 Cấu trúc thư mục

- `server.ts`: Entry point cho Express server, xử lý API `/api/wake`.
- `src/App.tsx`: Giao diện chính của ứng dụng.
- `package.json`: Chứa các script và dependencies.
- `.github/workflows/`: Workflow tự động hóa việc deploy.

---

*Phát triển bởi [tramdk](https://github.com/tramdk)*
