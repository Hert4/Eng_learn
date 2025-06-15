from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
import base64
import soundfile as sf
import io
from pipeline import SpeechProcessingPipeline

app = FastAPI()

# tranh lio cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
                chat_history.append({"role": "user", "content": text})
                
                response = pipeline.generate_response(chat_history)
                chat_history.append({"role": "assistant", "content": response})
                
                
                await websocket.send_json({"type": "response", "text": response})
                
                audio_data = pipeline.generate_speech(response)
                # print(f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}")
                await websocket.send_json({
                            "type": "audio",
                            "audioUrl": f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}"
                        })
                    
            elif "bytes" in data:

                audio_bytes = data["bytes"]    
                
                transcription = pipeline.process_audio_file(audio_bytes)
                
                chat_history.append({"role": "user", "content": transcription})
                response = pipeline.generate_response(chat_history)
                print(f"Response: {response}")
                chat_history.append({"role": "assistant", "content": response})
                
                await websocket.send_json({"type": "transcription", "text": transcription})
                await websocket.send_json({"type": "response", "text": response})
                

                # with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                #     pipeline.generate_speech(response)
                #     temp_file.close()
                #     with open(temp_file.name, "rb") as audio_file:
                #         audio_data = audio_file.read()
                #         await websocket.send_json({
                #             "type": "audio",
                #             "audioUrl": f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}"
                #         })
                #     os.unlink(temp_file.name)
                # os.unlink(temp_file_path)
                
                audio_data = pipeline.generate_speech(response)
                # print(f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}")
                await websocket.send_json({
                            "type": "audio",
                            "audioUrl": f"data:audio/wav;base64,{base64.b64encode(audio_data).decode('utf-8')}"
                        })
                
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