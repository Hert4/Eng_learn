import torch
import soundfile as sf
import numpy as np
import subprocess
import librosa
import io
import wave
import json
import requests
import time
from datetime import datetime
from zoneinfo import ZoneInfo
from transformers import (
    AutoProcessor,
    AutoModelForSpeechSeq2Seq,
)
import torchaudio
from kokoro_onnx import KokoroTTS

OLLAMA_BASE_URL = "http://107.124.124.71:11434"

class SpeechProcessingPipeline:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.initialize_models()

    def initialize_models(self):
        """Khởi tạo model với Kokoro ONNX thay vì API"""
        print("Initializing Whisper model...")
        self.whisper_processor = AutoProcessor.from_pretrained("models/whisper-large-v3-turbo")
        self.whisper_model = AutoModelForSpeechSeq2Seq.from_pretrained(
            "models/whisper-large-v3-turbo",
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            use_safetensors=True,
        ).to(self.device)
        
        print("Warnup STT...")
        self.warmup_whisper()
        
        print("Initializing Text-to-Speech model...")
        # Thay đổi thành Kokoro ONNX
        self.tts_engine = KokoroTTS()
        
    def warmup_whisper(self, warmup_steps=3):
        # Tạo dummy input chuẩn Whisper
        dummy_input = torch.randn(
            1,  # batch_size
            128,  # num_mel_bins
            3000  # sequence_length (tương đương ~30s audio)
        ).to(self.device, dtype=torch.float16)

        # Warmup cả encoder và decoder
        with torch.no_grad():
            for _ in range(warmup_steps):
                # Chạy full pipeline
                generated_ids = self.whisper_model.generate(
                    dummy_input,
                    max_new_tokens=128,
                    temperature=0.0,
                    return_timestamps=False,
                    language='en'
                )
                
                # Giải phóng bộ nhớ ngay lập tức
                del generated_ids
                torch.cuda.empty_cache()        

    @torch.inference_mode()
    def generate_speech(self, text):
        """Sử dụng Kokoro ONNX để generate speech"""
        # Generate tokens and reference style
        tokens, ref_s = self.tts_engine.prepare_inputs(text, voice_file='af_bella.bin')
        
        # Synthesize audio
        audio = self.tts_engine.synthesize(tokens, ref_s)
        
        # Get the first audio array (assuming batch size 1)
        audio_data = audio[0]
        
        # Save and display the audio
        # filename = "output.wav"
        # sf.write(filename, audio_data, 24000)
        # # display(Audio(data=audio_data, rate=24000, autoplay=True))
        # print(f"Saved {filename}")
        # Tạo buffer trong memory
        with io.BytesIO() as buffer:
            sf.write(
                buffer,
                audio_data,
                24000,
                format='WAV',
                subtype='PCM_16'
            )
            wav_bytes = buffer.getvalue()
        
        return wav_bytes
        

    def load_audio_file(self, audio_data, sample_rate):
        """Load audio file and return sample rate and numpy array"""
        # audio_data, sample_rate = sf.read(file_path)
        if audio_data.ndim > 1:
            audio_data = np.mean(audio_data, axis=1)
        audio_data = audio_data.astype(np.float32)
        return audio_data, sample_rate
    
    def preprocess_audio(self, audio_data, sample_rate):
        """Preprocess audio for Whisper model"""
        audio_data = audio_data.astype("float32")
        audio_data /= np.max(np.abs(audio_data))
        
        if sample_rate != 16000:
            audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=16000)
            sample_rate = 16000
            
        return audio_data, sample_rate
    
    def transcribe_audio(self, audio_data, sample_rate):
        """Transcribe audio to text using Whisper"""
        inputs = self.whisper_processor(
            audio_data, 
            sampling_rate=sample_rate, 
            return_tensors="pt",
        ).to(self.device, torch.float16)
        
        with torch.no_grad():
            generated_ids = self.whisper_model.generate(**inputs,
                                                        language='en')
            
        transcription = self.whisper_processor.batch_decode(
            generated_ids, 
            skip_special_tokens=True
        )[0]
        return transcription
    
    def generate_response(self, chat_history):
        """Generate conversational response using Qwen model"""
        vietnam_date = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).date()
        
        SYSTEM_PROMPT = f"""\
You are an AI conversation assistant named **NEURA**.  
Your main task is to help the **user improve their English speaking skills** through casual conversation.  
You are currently talking to the user in real-time.  
Do **not** make any grammar, spelling, or formatting mistakes.  
The current time is **{vietnam_date}**.

## Role Instructions:
- Please be as brief as possible with every question.
- You are having a live, spoken-style conversation with the user.
- Your personality should be friendly, natural, and encouraging.
- Your focus is to help the user **practice English speaking fluency**.

<Requirements>
### Language:
- Always respond in **English only**.
- **Never** switch to any other language, even if the user asks you to.

### Response Style:
- Keep each response **short and simple**, like normal spoken language.
- Each response must be **only one line**.
- Do **not explain**, **define**, or **elaborate** unless specifically asked in English.
- Responses must feel like a real-time chat or spoken dialogue.


### Tone and Format:
- Talk as if you're having a **natural, face-to-face conversation** with the user.
- Use **spoken English only**, no formal writing.
- **Do not use any icons, emojis, symbols, markdown, or special characters**.

## Example:
**User:** How are you today?  
**ONE:** I'm doing great, thanks! How about you?

**User:** What's your favorite food?  
**ONE:** I really like pizza, it's always a good choice.
<Requirements/>

Make sure to follow these rules consistently for every response."""
        
        # user_prompt = "Treat the following as a message from the user. Respond in natural, spoken English with one short line: " + user_input.strip()


        # Định nghĩa URL của API
        # url_api = f"{OLLAMA_BASE_URL}/api/generate"  # Thay thế bằng URL thực tế của API Ollama
        url_api = f"{OLLAMA_BASE_URL}/api/chat"
        
        headers = {
            "Content-Type": "application/json"
        }

        # Chuẩn bị dữ liệu cho phần thân yêu cầu
        # data = {
        #     "model": "qwen2.5-coder:7b",
        #     "system": SYSTEM_PROMPT,
        #     "prompt": chat_history,
        #     "stream": False
        # }
        SYSTEM_PROMPT_TEST = """
- You are Neura a virtual assistant that helps you learn English.
- Communicate naturally like a human conversation.
- Answer as briefly as possible.
- You always respond in English no matter what language the user uses.
- Only talk and respond to English related topics. No coding, no talking about sensitive topics.
        """
        chat_history.append({"role": "system", "content": SYSTEM_PROMPT_TEST})
        
        data = {
            "model": "qwen2.5-coder:7b",
            "system": SYSTEM_PROMPT_TEST,
            "options": {
                    "num_predict": 64  # <-- Điều chỉnh độ dài response tại đây
                        },
            "messages": chat_history,
            "stream": False
        }

        # Chuyển dữ liệu sang JSON
        # body_json = json.dumps(data)

        # Gửi yêu cầu POST
        try:
            # response = requests.post(url_api, headers=headers, data=body_json)
            response = requests.post(
                url_api,
                headers=headers,
                json=data,
            )
            response.raise_for_status()  # Ném ngoại lệ nếu trạng thái HTTP không thành công

            # response_dict = json.loads(response.content)
            # response_str = str(response_dict.get("response", ""))
            result = response.json()
            print(result["message"]["content"])
            
            return result["message"]["content"]
        except requests.exceptions.RequestException as e:
            print("Lỗi gửi yêu cầu:", e)

    def process_audio_file(self, audio_bytes):
        """Complete pipeline: audio file -> text -> response -> speech"""
        # Step 1: Load and preprocess audio
        # with open("test.wav", "wb") as f:
        #     f.write(audio_bytes)
        audio_buffer = io.BytesIO(audio_bytes)
        audio_buffer.seek(0)
        audio_data, original_sr = sf.read(audio_buffer, channels=1, samplerate=16000, subtype="PCM_16", format='RAW')
        if original_sr != 16000:
            audio_data = librosa.resample(audio_data, orig_sr=original_sr, target_sr=16000)
        
        if len(audio_data.shape) > 1:
            audio_data = librosa.to_mono(audio_data.T)
            
        audio_data, sample_rate = self.load_audio_file(audio_data, original_sr)
        audio_data, sample_rate = self.preprocess_audio(audio_data, sample_rate)
        # wav_buffer = io.BytesIO()
        # sf.write(wav_buffer, audio_data, 16000, format='wav', subtype='PCM_16')
        # wav_buffer.seek(0)
        
        
        # Step 2: Transcribe audio to text
        transcription = self.transcribe_audio(audio_data, sample_rate)
        print(f"Transcription: {transcription}")
        
        # Step 3: Generate response
        # response = self.generate_response(transcription)
        # print(f"Response: {response}")
        
        # Step 4: Convert response to speech
        # self.generate_speech(response)
        
        return transcription

# # Phần sử dụng và test giữ nguyên
# if __name__ == "__main__":
#     # pipeline = SpeechProcessingPipeline()
#     file_path = "/kaggle/input/kafka-voice/kafka.wav" # audio send from frontend
#     import time
#     start = time.time()
#     transcription, response = pipeline.process_audio_file(file_path)
#     print(time.time() - start)