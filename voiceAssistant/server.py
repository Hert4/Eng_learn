from aiortc import RTCPeerConnection, RTCSessionDescription, RTCDataChannel
import json
import asyncio
import logging
from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForCausalLM
import numpy as np
import sounddevice as sd

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aiortc")

# Load your TTS model (same as before)
onnx_model_dir = "models/SparkTTS_onnx/SparkTTS/LLM"
tokenizer = AutoTokenizer.from_pretrained(onnx_model_dir)
model = ORTModelForCausalLM.from_pretrained(
    onnx_model_dir, provider="CPUExecutionProvider"
)


class VoiceAssistantServer:
    def __init__(self):
        self.pcs = set()

    async def handle_offer(self, offer_sdp: str):
        """Handle WebRTC offer from client"""
        pc = RTCPeerConnection()
        self.pcs.add(pc)

        @pc.on("datachannel")
        def on_datachannel(channel: RTCDataChannel):
            logger.info(f"Data channel opened: {channel.label}")

            @channel.on("message")
            def on_message(message):
                try:
                    data = json.loads(message)
                    logger.info(f"Received message: {data}")

                    if data.get("type") == "transcript" and data.get("transcript"):
                        # Process the transcript and generate response
                        self.process_transcript(channel, data["transcript"])

                except Exception as e:
                    logger.error(f"Error processing message: {e}")

        # Set up the remote description
        await pc.setRemoteDescription(
            RTCSessionDescription(sdp=offer_sdp, type="offer")
        )

        # Create answer
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return pc.localDescription.sdp

    def process_transcript(self, channel: RTCDataChannel, transcript: str):
        """Process transcript and send back response"""
        try:
            # Notify client that processing has started
            channel.send(json.dumps({"type": "processing", "is_processing": True}))

            # Generate AI response (using your existing function)
            response_text = "This is a simulated response to: " + transcript

            # Generate audio (using your existing function)
            # audio_data = generate_speech_from_text(response_text)
            # audio_base64 = base64.b64encode(audio_data.tobytes()).decode('utf-8')

            # Send response back to client
            channel.send(
                json.dumps(
                    {
                        "type": "assistant_response",
                        "response": response_text,
                        "audio": None,  # Replace with audio_base64 in real implementation
                    }
                )
            )

            # Notify client that processing is complete
            channel.send(json.dumps({"type": "processing", "is_processing": False}))

        except Exception as e:
            logger.error(f"Error processing transcript: {e}")
            channel.send(json.dumps({"type": "error", "message": str(e)}))

    async def shutdown(self):
        """Close all peer connections"""
        for pc in self.pcs:
            await pc.close()
        self.pcs.clear()


# Example usage with FastAPI
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles

app = FastAPI()
server = VoiceAssistantServer()


@app.websocket("/ws/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "offer":
                # Handle WebRTC offer
                answer_sdp = await server.handle_offer(message["sdp"])
                await websocket.send_text(
                    json.dumps({"type": "answer", "sdp": answer_sdp})
                )

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()


@app.on_event("shutdown")
async def shutdown_event():
    await server.shutdown()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
