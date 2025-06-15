import requests
import onnxruntime as rt

print(rt.get_available_providers())

# SYSTEM_PROMPT = """
# Bạn là Neura, một lập trình viên vip pro.
# """

# chat_history = [
#     {"role": "user", "content": "Xin chào"},
#     {"role": "assistant", "content": "Chào bạn! Bạn cần hỗ trợ gì?"},
#     {"role": "user", "content": "Giúp mình giải thích đoạn code này nhé"}
# ]

# # Thêm prompt mới vào history
# new_prompt = "Đây là hàm của mình: function add(a, b) { return a - b }"
# chat_history.append({"role": "user", "content": new_prompt})

# # Tạo request data
# data = {
#     "model": "qwen2.5-coder:7b",
#     "system": SYSTEM_PROMPT,
#     "messages": chat_history,  # <-- Gửi cả history
#     "stream": False
# }


# response = requests.post(
#     "http://107.124.124.71:11434/api/chat",  # <-- Đúng endpoint cho chat
#     json=data,
#     headers={"Content-Type": "application/json"}
# )

# result = response.json()
# print(result["message"]["content"])
