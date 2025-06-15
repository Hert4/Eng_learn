from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
import base64
from pipeline import SpeechProcessingPipeline
from turn_detector import TurnDetector

app = FastAPI()

# tranh lio cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

text_buffer = []
turn_detector = TurnDetector()
_is_turn = False

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        chat_history = []
        while True:
            data = await websocket.receive()
            
            if "text" in data:
                text = data["text"]
                await websocket.send_json({"type": "transcription", "text": text})
                # Turn Detector
                if not _is_turn:
                    text_buffer.append(text_buffer)
                    current_text = " ".join(text_buffer)
                    print(current_text)
                    messages = [{"role": "user", "content": current_text}]
                    eou_prob = turn_detector.calculate_eou(messages)
                    if eou_prob >= turn_detector.EOU_THRESHOLD:
                        _is_turn = True
                
                        response = pipeline.generate_response(text)
                        await websocket.send_json({"type": "response", "text": response})
                        
                        audio_data = pipeline.generate_speech(response)
                        # print(f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}")
                        await websocket.send_json({
                                    "type": "audio",
                                    "audioUrl": f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}"
                                })
                    
            elif "bytes" in data:

                audio_data = data["bytes"]
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                    temp_file.write(audio_data)
                    temp_file_path = temp_file.name
                
                transcription, response = pipeline.process_audio_file(temp_file_path)
                await websocket.send_json({"type": "transcription", "text": transcription})
                await websocket.send_json({"type": "response", "text": response})
                
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                    pipeline.generate_speech(response)
                    temp_file.close()
                    with open(temp_file.name, "rb") as audio_file:
                        audio_data = audio_file.read()
                        await websocket.send_json({
                            "type": "audio",
                            "audioUrl": f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}"
                        })
                    os.unlink(temp_file.name)
                os.unlink(temp_file_path)
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
        print(f"Error: {e}")

def run_server():
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=7575,
        ssl_certfile="ssl-localhost/server_cert.pem",
        ssl_keyfile="ssl-localhost/server_key.pem",
        log_level="debug",
    )

if __name__ == "__main__":
    pipeline = SpeechProcessingPipeline()
    run_server()