from transformers import BitsAndBytesConfig
import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoProcessor
import torch
import string
import io
import time
import soundfile as sf
import base64
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketState
import json
import re
import asyncio
import sys
import logging
from fastapi.middleware.cors import CORSMiddleware

# Logging setup
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

from SparkTTS.sparktts.models.audio_tokenizer import BiCodecTokenizer

# FastAPI app
app = FastAPI()

# Enable CORS for all origins (điều chỉnh nếu cần cho production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
HG_MODEL = "models/turn_detector"
# Cập nhật đường dẫn đến file ONNX model trên máy local
ONNX_FILENAME = (
    "models/turn_detector/model_quantized.onnx"  # Thay bằng đường dẫn thực tế
)
EOU_THRESHOLD = 0.5
MAX_HISTORY = 2
MAX_HISTORY_TOKENS = 512
PUNCS = string.punctuation.replace("'", "")

DEVICE = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")

# Load models
try:
    quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_use_double_quant=True
            )
    
  
    turn_tokenizer = AutoTokenizer.from_pretrained(HG_MODEL)
    onnx_session = ort.InferenceSession(
        ONNX_FILENAME, providers=["CPUExecutionProvider"]
    )
    qwen_tokenizer = AutoTokenizer.from_pretrained("models/Qwen2.5-3B-Instruct")
    qwen_model = AutoModelForCausalLM.from_pretrained(
        "models/Qwen2.5-3B-Instruct",
        low_cpu_mem_usage=True,
        quantization_config=quantization_config,
        use_safetensors=True,
        use_cache=False
    )

    spark_model = AutoModelForCausalLM.from_pretrained(
        "models/Spark-TTS-0.5B-with-KafkaSpark/LLM"
    )

    spark_tokenizer = AutoProcessor.from_pretrained(
        "models/Spark-TTS-0.5B-with-KafkaSpark/LLM"
    )
    audio_tokenizer = BiCodecTokenizer(
        "models/Spark-TTS-0.5B-with-KafkaSpark",
        device=DEVICE
    )
    
    qwen_model.to(DEVICE)
    spark_model.to(DEVICE)
    # spark_model.eval()
except Exception as e:
    logger.error(f"Model loading error: {e}")
    raise


# Helper functions
def softmax(logits):
    try:
        exp_logits = np.exp(logits - np.max(logits))
        return exp_logits / np.sum(exp_logits)
    except Exception as e:
        logger.error(f"Softmax error: {e}")
        return np.zeros_like(logits)

def normalize_text(text):
    try:

        def strip_puncs(text):
            return text.translate(str.maketrans("", "", PUNCS))

        return " ".join(strip_puncs(text).lower().split())
    except Exception as e:
        logger.error(f"Normalize text error: {e}")
        return text

def format_chat_ctx(chat_ctx):
    try:
        new_chat_ctx = []
        for msg in chat_ctx:
            if msg["role"] in ("user", "assistant"):
                content = normalize_text(msg["content"])
                if content:
                    msg["content"] = content
                    new_chat_ctx.append(msg)
        convo_text = turn_tokenizer.apply_chat_template(
            new_chat_ctx,
            add_generation_prompt=False,
            add_special_tokens=False,
            tokenize=False,
        )
        ix = convo_text.rfind("<|im_end|>")
        return convo_text[:ix]
    except Exception as e:
        logger.error(f"Format chat context error: {e}")
        return ""

def calculate_eou(chat_ctx, session):
    try:
        formatted_text = format_chat_ctx(chat_ctx[-MAX_HISTORY:])
        inputs = turn_tokenizer(
            formatted_text,
            return_tensors="np",
            truncation=True,
            max_length=MAX_HISTORY_TOKENS,
        )
        input_ids = inputs["input_ids"].astype(np.int64)
        outputs = session.run(["logits"], {"input_ids": input_ids})
        logits = outputs[0][0, -1, :]
        probs = softmax(logits)
        eou_token_id = turn_tokenizer.encode("<|im_end|>")[0]
        logger.debug(
            f"Input text: {formatted_text}, EOU token ID: {eou_token_id}, Probs: {probs}"
        )
        return probs[eou_token_id]
    except Exception as e:
        logger.error(f"EOU calculation error: {e}")
        return 0.0

async def generate_speech_from_text(text: str) -> np.ndarray:
    try:
        prompt = "".join(
            [
                "<|task_tts|>",
                "<|start_content|>",
                text,
                "<|end_content|>",
                "<|start_global_token|>",
            ]
        )
        start_time = time.time()
        with torch.no_grad():
            print(spark_model.device)
            model_inputs = spark_tokenizer([prompt], return_tensors="pt").to(DEVICE)
            end_time = time.time()
            print(f"Tokenizer: {end_time-start_time}")
            generated_ids = spark_model.generate(
                **model_inputs,
                max_new_tokens=3000,
                do_sample = True,
                temperature = 0.8,
                top_p=0.95,
                top_k=50,   
                pad_token_id=spark_tokenizer.pad_token_id,
            )
        end_time = time.time()
        print(f"Gen time: {end_time-start_time}")
        generated_ids_trimmed = generated_ids[:, model_inputs.input_ids.shape[1] :]
        predicts_text = spark_tokenizer.batch_decode(
            generated_ids_trimmed, skip_special_tokens=False
        )[0]
        semantic_matches = re.findall(r"<\|bicodec_semantic_(\d+)\|>", predicts_text)
        if not semantic_matches:
            logger.warning("No semantic matches found in TTS output")
            return np.array([], dtype=np.float32)
        pred_semantic_ids = (
            torch.tensor([int(token) for token in semantic_matches]).long().unsqueeze(0)
        )
        global_matches = re.findall(r"<\|bicodec_global_(\d+)\|>", predicts_text)
        pred_global_ids = (
            torch.tensor([int(token) for token in global_matches]).long().unsqueeze(0)
            if global_matches
            else torch.zeros((1, 1), dtype=torch.long)
        )
        pred_global_ids = pred_global_ids.unsqueeze(0)
        wav_np = audio_tokenizer.detokenize(
            pred_global_ids.to(DEVICE).squeeze(0), 
            pred_semantic_ids.to(DEVICE)
        )
        return wav_np
    except Exception as e:
        logger.error(f"Speech generation error: {e}")
        return np.array([], dtype=np.float32)

def waveform_to_base64(waveform: np.ndarray, sample_rate=16000) -> str:
    try:
        if waveform.size == 0:
            return ""
        buf = io.BytesIO()
        sf.write(buf, waveform, sample_rate, format="WAV")
        return base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception as e:
        logger.error(f"waveform->b64 error: {e}")
        return ""


class ConversationManager:
    def __init__(self):
        self.chat_history = []
        self.sample_rate = 16000
        self.is_processing = False
        self.lock = asyncio.Lock()
        self.transcript_buffer = []

    async def process_conversation(self, transcript: str) -> tuple:
        async with self.lock:
            if self.is_processing:
                logger.info("Skipping transcript processing: already in progress")
                return transcript, 0.0, False, None, None
            self.is_processing = True
            try:
                if not transcript.strip():
                    logger.debug("Received empty transcript, skipping")
                    return transcript, 0.0, False, None, None

                # Log input
                logger.debug(f"Received transcript: {transcript}")

                # Add new transcript to buffer
                self.transcript_buffer.append(transcript)
                logger.debug(
                    f"Buffered transcript: {transcript}, Buffer: {self.transcript_buffer}"
                )

                # Calculate EOU with current chat history plus buffered transcripts
                current_transcript = " ".join(self.transcript_buffer)
                messages = self.chat_history + [
                    {"role": "user", "content": current_transcript}
                ]
                eou_prob = calculate_eou(messages, onnx_session)
                logger.debug(f"EOU score for '{current_transcript}': {eou_prob}")

                # Set is_final based on EOU score
                is_final = eou_prob >= EOU_THRESHOLD
                logger.debug(
                    f"is_final set to {is_final} based on eou_score: {eou_prob}"
                )

                # Process only if is_final is True (i.e., eou_prob >= EOU_THRESHOLD)
                if not is_final:
                    logger.debug(
                        f"EOU score {eou_prob} below threshold {EOU_THRESHOLD}, buffering"
                    )
                    return current_transcript, eou_prob, False, None, None

                # Process the concatenated transcript
                logger.info(f"Processing final transcript: {current_transcript}")
                inputs = qwen_tokenizer.apply_chat_template(
                    messages, add_generation_prompt=True, return_tensors="pt"
                ).to(qwen_model.device)
                outputs = qwen_model.generate(inputs, max_new_tokens=156)
                generated_text = qwen_tokenizer.decode(
                    outputs[0][inputs.shape[1] :], skip_special_tokens=True
                )
                logger.info(f"Generated response: {generated_text}")

                # Update chat history
                self.chat_history.append(
                    {"role": "user", "content": current_transcript}
                )
                self.chat_history.append(
                    {"role": "assistant", "content": generated_text}
                )
                if len(self.chat_history) > MAX_HISTORY * 2:
                    self.chat_history = self.chat_history[-MAX_HISTORY * 2 :]

                # Generate audio
                start_time = time.time()
                generated_waveform = await generate_speech_from_text(generated_text)
                end_time = time.time()
                print(f"Gen wave: {start_time-end_time}")
                audio_base64 = waveform_to_base64(generated_waveform, self.sample_rate)
                end_time = time.time()
                print(f"Gen Base64: {start_time-end_time}")

                # Clear buffer after processing
                self.transcript_buffer = []
                logger.debug("Cleared transcript buffer")

                return current_transcript, eou_prob, True, generated_text, audio_base64
            except Exception as e:
                logger.error(f"Conversation processing error: {e}")
                return current_transcript, eou_prob, False, None, None
            finally:
                self.is_processing = False


@app.get("/")
async def root():
    return {
        "message": "Assistant WebSocket server is running. Connect via /ws/assistant"
    }


@app.get("/test")
async def test_page():
    return """
    <!DOCTYPE html>
    <html>
    <head><title>Assistant WS Test</title></head>
    <body>
    <h1>Assistant WebSocket Test</h1>
    <textarea id="transcript" rows="4" cols="50"></textarea><br/>
    <button onclick="sendTranscript()">Send Transcript</button>
    <pre id="output"></pre>
    <script>
      const ws = new WebSocket("ws://localhost:3000/ws/assistant");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        document.getElementById('output').textContent += JSON.stringify(data, null, 2) + "\\n";
      };
      function sendTranscript() {
        const transcript = document.getElementById('transcript').value;
        ws.send(JSON.stringify({transcript: transcript}));
      }
    </script>
    </body>
    </html>
    """


@app.on_event("startup")
async def startup_event():
    logger.info("Starting Assistant server...")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Assistant server...")


@app.websocket("/ws/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cm = ConversationManager()
    try:
        while True:
            try:
                data = json.loads(await websocket.receive_text())
                transcript = data.get("transcript", "")
                logger.info(f"WebSocket input: transcript={transcript}")
                if not transcript.strip():
                    continue
                transcript, eou_score, complete, resp, audio_b64 = (
                    await cm.process_conversation(transcript)
                )
                await websocket.send_json(
                    {
                        "type": "transcript",
                        "transcript": transcript,
                        "eou_score": float(eou_score),
                        "is_complete": complete,
                    }
                )
                if resp:
                    await asyncio.sleep(0.1)
                    await websocket.send_json(
                        {
                            "type": "assistant_response",
                            "response": resp,
                            "audio": audio_b64,
                        }
                    )
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.close(code=1000, reason=str(e))
                return
    except Exception as e:
        logger.error(f"WebSocket connection closed with error: {e}")


# Run server locally
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3000,
        ssl_certfile="ssl-localhost/107.114.184.16.pem",
        ssl_keyfile="ssl-localhost/107.114.184.16-key.pem",
        log_level="info",
    )