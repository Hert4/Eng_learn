from transformers import (
    SpeechT5Processor,
    SpeechT5ForTextToSpeech,
    AutoProcessor,
    AutoModelForCausalLM,
)
import torch
import scipy
import numpy as np
import librosa
import IPython.display as ipd
import sys
from huggingface_hub import snapshot_download

sys.path.append("Spark-TTS")
from sparktts.models.audio_tokenizer import BiCodecTokenizer
import asyncio
import numpy as np
import re
from typing import AsyncGenerator, Optional, Callable, Dict, Any

import time
import re
import torchaudio.transforms as T
import sounddevice as sd


# Ensure CUDA is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Download model snapshot
# snapshot_download("beyoru/Spark-TTS-0.5B-with-KafkaSpark", local_dir="Spark-TTS-0.5B")

onnx_model_dir = "models/SparkTTS_onnx/SparkTTS/LLM"

# Instantiate tokenizer on CUDA
audio_tokenizer = BiCodecTokenizer(
    "models/Spark-TTS-0.5B-with-KafkaSpark", device=device
)

from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForCausalLM


# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(onnx_model_dir)

# Load ONNX model (note: CUDA execution requires ONNX Runtime w/ GPU enabled)
import onnxruntime
from onnxruntime import SessionOptions
import os

so = SessionOptions()
so.intra_op_num_threads = os.cpu_count()
so.graph_optimization_level = onnxruntime.GraphOptimizationLevel.ORT_ENABLE_ALL

model = ORTModelForCausalLM.from_pretrained(
    onnx_model_dir, provider="CPUExecutionProvider", session_options=so
)

# # Load Qwen model
# try:
#     qwen_tokenizer = AutoTokenizer.from_pretrained("models/Qwen2.5-0.5B-Instruct", use_fast=False)
#     qwen_model = ORTModelForCausalLM.from_pretrained(
#         "models/Qwen2.5-0.5B-Instruct",
#         subfolder = "onnx",
#         providers=["CPUExecutionProvider"],
#         session_options=so
#     )
#     print("Qwen model loaded successfully")
# except Exception as e:
#     print(f"Failed to load Qwen model: {e}")
#     qwen_model = None

# print("Model loaded successfully...")


def split_text_into_sentences(text: str) -> list[str]:
    """Chia văn bản thành từng câu ngữ nghĩa dựa trên dấu câu. =))"""
    return re.split(r"(?<=[.!?])\s+", text.strip())


async def generate_stream_from_text(
    text: str, chunk_fn: Optional[Callable[[str], list[str]]] = None, delay: float = 0.0
) -> AsyncGenerator[np.ndarray, None]:
    """
    Giống speak_stream_async của FlashTTS, nhưng custom cho mô hình của bạn.

    Trả về từng đoạn wav (np.ndarray) sinh ra từ từng câu hoặc đoạn văn bản.
    """
    if chunk_fn is None:
        chunk_fn = split_text_into_sentences

    chunks = chunk_fn(text)

    for chunk_text in chunks:
        if not chunk_text.strip():
            continue

        print(f"🔊 Generating chunk: {chunk_text}")
        audio_chunk = generate_speech_from_text(chunk_text)

        if audio_chunk is not None and len(audio_chunk) > 0:
            yield audio_chunk.astype(np.float32)

        if delay > 0:
            await asyncio.sleep(delay)  # để mô phỏng delay giữa các đoạn


chosen_voice = None  # None for single-speaker


@torch.inference_mode()
def generate_speech_from_text(
    text: str,
    temperature: float = 0.9,  # Generation temperature
    top_k: int = 50,  # Generation top_k
    top_p: float = 0.95,  # Generation top_p
    max_new_audio_tokens: int = 32000,  # Max tokens for audio part
    device: torch.device = torch.device("cuda" if torch.cuda.is_available() else "cpu"),
) -> np.ndarray:
    """
    Generates speech audio from text using default voice control parameters.

    Args:
        text (str): The text input to be converted to speech.
        temperature (float): Sampling temperature for generation.
        top_k (int): Top-k sampling parameter.
        top_p (float): Top-p (nucleus) sampling parameter.
        max_new_audio_tokens (int): Max number of new tokens to generate (limits audio length).
        device (torch.device): Device to run inference on.

    Returns:
        np.ndarray: Generated waveform as a NumPy array.
    """

    prompt = "".join(
        [
            "<|task_tts|>",
            "<|start_content|>",
            text,
            "<|end_content|>",
            "<|start_global_token|>",
        ]
    )

    print("Generating token sequence...")
    model_inputs = tokenizer([prompt], return_tensors="pt").to(device)

    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=max_new_audio_tokens,  # Limit generation length
        do_sample=False,
        # temperature=temperature,
        top_k=top_k,
        # top_p=top_p,
        use_cache=True,
        repetition_penalty=1.2,
        eos_token_id=tokenizer.eos_token_id,  # Stop token
        pad_token_id=tokenizer.pad_token_id,  # Use models pad token id
    )
    print("Token sequence generated.")

    generated_ids_trimmed = generated_ids[:, model_inputs.input_ids.shape[1] :]

    predicts_text = tokenizer.batch_decode(
        generated_ids_trimmed, skip_special_tokens=False
    )[0]
    # print(f"\nGenerated Text (for parsing):\n{predicts_text}\n") # Debugging

    # Extract semantic token IDs using regex
    semantic_matches = re.findall(r"<\|bicodec_semantic_(\d+)\|>", predicts_text)
    if not semantic_matches:
        print("Warning: No semantic tokens found in the generated output.")
        # Handle appropriately - perhaps return silence or raise error
        return np.array([], dtype=np.float32)

    pred_semantic_ids = (
        torch.tensor([int(token) for token in semantic_matches]).long().unsqueeze(0)
    )  # Add batch dim

    # Extract global token IDs using regex (assuming controllable mode also generates these)
    global_matches = re.findall(r"<\|bicodec_global_(\d+)\|>", predicts_text)
    if not global_matches:
        print(
            "Warning: No global tokens found in the generated output (controllable mode). Might use defaults or fail."
        )
        pred_global_ids = torch.zeros((1, 1), dtype=torch.long)
    else:
        pred_global_ids = (
            torch.tensor([int(token) for token in global_matches]).long().unsqueeze(0)
        )  # Add batch dim

    pred_global_ids = pred_global_ids.unsqueeze(0)  # Shape becomes (1, 1, N_global)

    print(f"Found {pred_semantic_ids.shape[1]} semantic tokens.")
    print(f"Found {pred_global_ids.shape[2]} global tokens.")

    # 5. Detokenize using BiCodecTokenizer
    print("Detokenizing audio tokens...")
    # Ensure audio_tokenizer and its internal model are on the correct device

    # Squeeze the extra dimension from global tokens as seen in SparkTTS example
    wav_np = audio_tokenizer.detokenize(
        pred_global_ids.to(device).squeeze(0),  # Shape (1, N_global)
        pred_semantic_ids.to(device),  # Shape (1, N_semantic)
    )
    print("Detokenization complete.")

    return wav_np


async def play_audio_in_order(output_queue: asyncio.Queue, total: int):
    next_index = 0
    buffer: Dict[int, np.ndarray] = {}
    played = 0

    while played < total:
        idx, audio = await output_queue.get()
        buffer[idx] = audio

        while next_index in buffer:
            current_audio = buffer.pop(next_index)
            print(f"🔈 Playing index {next_index}")
            sd.play(
                current_audio,
                samplerate=audio_tokenizer.config.get("sample_rate", 16000),
                blocking=True,
            )
            next_index += 1
            played += 1


async def play_streaming(text: str):
    sentences = split_text_into_sentences(text)
    output_queue = asyncio.Queue()
    tasks = []

    for idx, sentence in enumerate(sentences):
        if sentence.strip():
            task = asyncio.create_task(
                generate_audio_task(idx, sentence.strip(), output_queue)
            )
            tasks.append(task)

    # Chạy phát và sinh audio song song
    await asyncio.gather(play_audio_in_order(output_queue, len(tasks)), *tasks)


from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)  # hoặc nhiều hơn nếu máy khỏe


async def generate_speech_from_text_async(text: str) -> np.ndarray:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, generate_speech_from_text, text)


import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)  # Số lượng luồng chạy song song


async def generate_audio_task(index: int, text: str, output_queue: asyncio.Queue):
    loop = asyncio.get_running_loop()
    # Chạy blocking function trong thread riêng
    audio = await loop.run_in_executor(executor, generate_speech_from_text, text)
    await output_queue.put((index, audio))


# Gọi hàm:


# def generate_text_with_qwen(text: str, max_length: int = 50) -> str:
#     """Generate or refine text using Qwen model."""
#     if qwen_model is None or qwen_tokenizer is None:
#         return text  # Fallback to original text if Qwen is unavailable
#     inputs = qwen_tokenizer(text, return_tensors="pt").to(device)
#     outputs = qwen_model.generate(
#         **inputs, max_length=max_length, do_sample=True, temperature=0.7
#     )
#     return qwen_tokenizer.decode(outputs[0], skip_special_tokens=True)


import asyncio

start = time.time()
asyncio.run(
    play_streaming(
        "Hello there! How are you doing today? I hope you're enjoying your time."
    )
)
print(f"Total time taken: {time.time() - start:.2f} seconds")
