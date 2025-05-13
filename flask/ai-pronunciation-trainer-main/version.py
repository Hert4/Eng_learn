import torchaudio

torchaudio.set_audio_backend("ffmpeg")
print(torchaudio.get_audio_backend())
# info = torchaudio.info("tmp918dxnxp.ogg")
# print(info.sample_rate)