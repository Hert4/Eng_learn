import torch
import string
from transformers import BitsAndBytesConfig
import numpy as np
import logging
import onnxruntime as ort
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoProcessor

# Logging setup
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

class TurnDetector:
    def __init__(self):
        self.HG_MODEL = "models/turn_detector"
        self.ONNX_FILENAME = (
            "models/turn_detector/model_quantized.onnx"  # Thay bằng đường dẫn thực tế
        )
        self.EOU_THRESHOLD = 0.5
        self.MAX_HISTORY = 2
        self.MAX_HISTORY_TOKENS = 512
        self.PUNCS = string.punctuation.replace("'", "")
        self.DEVICE = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
        self.load_model()

    def load_model(self):
        try:
            self.turn_tokenizer = AutoTokenizer.from_pretrained(self.HG_MODEL)
            self.onnx_session = ort.InferenceSession(
                self.ONNX_FILENAME, providers=["CPUExecutionProvider"]
            )

        except Exception as e:
            logger.error(f"Model loading error: {e}")
            raise e

    def softmax(self, logits):
        try:
            exp_logits = np.exp(logits - np.max(logits))
            return exp_logits / np.sum(exp_logits)
        except Exception as e:
            logger.error(f"Softmax error: {e}")
            return np.zeros_like(logits)

    def normalize_text(self, text):
        try:

            def strip_puncs(text):
                return text.translate(str.maketrans("", "", self.PUNCS))

            return " ".join(strip_puncs(text).lower().split())
        except Exception as e:
            logger.error(f"Normalize text error: {e}")
            return text

    def format_chat_ctx(self, chat_ctx):
        try:
            new_chat_ctx = []
            for msg in chat_ctx:
                if msg["role"] in ("user", "assistant"):
                    content = self.normalize_text(msg["content"])
                    if content:
                        msg["content"] = content
                        new_chat_ctx.append(msg)
            convo_text = self.turn_tokenizer.apply_chat_template(
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

    def calculate_eou(self, chat_ctx):
        try:
            formatted_text = self.format_chat_ctx(chat_ctx[-self.MAX_HISTORY:])
            inputs = self.turn_tokenizer(
                formatted_text,
                return_tensors="np",
                truncation=True,
                max_length=self.MAX_HISTORY_TOKENS,
            )
            input_ids = inputs["input_ids"].astype(np.int64)
            outputs = self.onnx_session.run(["logits"], {"input_ids": input_ids})
            logits = outputs[0][0, -1, :]
            probs = self.softmax(logits)
            eou_token_id = self.turn_tokenizer.encode("<|im_end|>")[0]
            logger.debug(
                f"Input text: {formatted_text}, EOU token ID: {eou_token_id}, Probs: {probs}"
            )
            return probs[eou_token_id]
        except Exception as e:
            logger.error(f"EOU calculation error: {e}")
            return 0.0