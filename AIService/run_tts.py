import os
import numpy as np
from onnxruntime import InferenceSession
import time
import json
from misaki import en
import sounddevice as sd

class KokoroTTS:
    def __init__(self, model_dir=None):
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_dir = model_dir or os.path.join(self.current_dir, "Kokoro-82M-ONNX")
        
        self.phoneme2id = self._load_phoneme_mapping()
        self.g2p = en.G2P(trf=False, british=False, fallback=None)
        self.session = self._load_onnx_session()

    def _load_phoneme_mapping(self):
        config_path = os.path.join(self.model_dir, "config.json")
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        
        phoneme2id = config['vocab']
        if all(k.isdigit() for k in phoneme2id.keys()):
            return {v: int(k) for k, v in phoneme2id.items()}
        return phoneme2id

    def _load_onnx_session(self):
        model_path = os.path.join(self.model_dir, "onnx", "model_uint8f16.onnx")
        return InferenceSession(model_path)

    def text_to_phonemes(self, text):
        phonemes, _ = self.g2p(text)
        return [p for p in phonemes if p in self.phoneme2id]

    def prepare_inputs(self, text, voice_file="af_bella.bin"):
        phonemes = self.text_to_phonemes(text)
        token_ids = [self.phoneme2id[p] for p in phonemes]
        
        # Load voice reference
        voice_path = os.path.join(self.model_dir, "voices", voice_file)
        voices = np.fromfile(voice_path, dtype=np.float32).reshape(-1, 1, 256)
        ref_s = voices[len(token_ids)]
        
        # Add start/end tokens
        tokens = [[0, *token_ids, 0]]
        return tokens, ref_s

    def synthesize(self, tokens, ref_s, speed=1.0):
        return self.session.run(None, {
            "input_ids": tokens,
            "style": ref_s,
            "speed": np.array([speed], dtype=np.float32)
        })[0]

    @staticmethod
    def play_audio(audio, sample_rate=24000):
        sd.play(audio, sample_rate)
        sd.wait()

if __name__ == "__main__":
    # Example usage
    tts = KokoroTTS()
    
    text = "Hello my friend, i love you, baby."
    tokens, ref_s = tts.prepare_inputs(text)
    
    start_time = time.time()
    audio = tts.synthesize(tokens, ref_s)
    print(f"Synthesis time: {time.time() - start_time:.2f}s")
    
    tts.play_audio(audio[0])
