import torch 
from transformers import pipeline
from ModelInterfaces import IASRModel
from typing import Union
import numpy as np 

class WhisperASRModel(IASRModel):
    def __init__(self, model_name="openai/whisper-base"):
        self.asr = pipeline("automatic-speech-recognition", model=model_name, return_timestamps="word")
        self._transcript = ""
        self._word_locations = []
        self.sample_rate = 16000

    def processAudio(self, audio:Union[np.ndarray, torch.Tensor]):
        # 'audio' can be a path to a file or a numpy array of audio samples.
        if isinstance(audio, torch.Tensor):
            audio = audio.detach().cpu().numpy()
        result = self.asr(audio[0])
        self._transcript = result["text"]
        print(result["chunks"])
        self._word_locations = []
        for word_info in result["chunks"]:
            timestamp = word_info.get("timestamp", (0, 0))  # Giá trị mặc định nếu timestamp thiếu
            start_ts = timestamp[0] * self.sample_rate if timestamp[0] is not None else 0
            end_ts = timestamp[1] * self.sample_rate if timestamp[1] is not None else (
                start_ts + 0.1 * self.sample_rate  # Thêm 0.1 giây nếu end_ts là None
            )
            self._word_locations.append({
                "word": word_info["text"],
                "start_ts": start_ts,
                "end_ts": end_ts
            })

    def getTranscript(self) -> str:
        return self._transcript

    def getWordLocations(self) -> list:
        
        return self._word_locations