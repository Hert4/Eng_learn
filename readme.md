# Web Tiếng Anh v0.1

## Giới thiệu

Đây là dự án đa năng tích hợp các chức năng:
- **Xử lý âm thanh**: Nhận diện giọng nói, chuyển đổi văn bản thành giọng nói (TTS) và xử lý audio.
- **Giao diện người dùng**: Ứng dụng frontend hiện đại sử dụng React, Chakra UI và các công nghệ liên quan.
- **API Backend**: Server Node.js phục vụ các endpoint xử lý dữ liệu và kết nối với các module AI.
- **Trợ lý giọng nói**: Ứng dụng trợ lý giọng nói tích hợp các module xử lý từ Python.

## Các module chính:
- AIService/pipeline.py: Xử lý chuỗi audio → text → response → speech sử dụng model Kokoro ONNX.
- backend/server.js: API backend xử lý các request từ frontend.
frontend/src/pages/: Các trang giao diện người dùng, bao gồm UserPage.jsx và TestPage.jsx.
- frontend/src/components/: Các component UI như audioVisualize.jsx và AIModel.jsx.
- voiceAssistant/app.py: Xử lý streaming audio và trợ lý giọng nói.




## Cách cài đặt và chạy dự án

### 1. Backend (Node.js)

- **Cài đặt dependencies**  
  Mở terminal tại thư mục `backend/` và chạy:
  
  ```sh
  npm install
  ```

- **Chạy server**
    ```
    npm run dev
    ```

*Khởi động các service Python để sử dụng các module*