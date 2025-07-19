import os
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from utils.logger import logger
from services.transcribe import transcribe_with_deepgram
from services.split_channels import split_channels, cleanup_temp_files
from services.create_transcript import create_transcript_from_deepgram
from utils.auth import authenticate_request
import sentry_sdk
import logging

# Configure more detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

sentry_sdk.init(
    dsn="https://ccc6149baca6c3b53fefa466c6396d4a@o4508718274969600.ingest.us.sentry.io/4508718278639616",
    traces_sample_rate=1.0,
    _experiments={
        "continuous_profiling_auto_start": True,
    },
)

load_dotenv()

app = FastAPI()
security = HTTPBearer()

# Add CORS middleware to allow requests from the node server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your actual domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

class TranscribeRequest(BaseModel):
    stereo_audio_url: str
    language: Optional[str] = "en"

class StartWebsocketCallOfOneRequest(BaseModel):
    device_id: str
    assistant_id: str
    assistant_overrides: dict
    base_url: str

@app.get("/", dependencies=[Depends(authenticate_request)])
async def health():
    logger.info("Health check endpoint called")
    return {"status": "ok", "env": {
        "PYTHON_SERVER_SECRET": os.getenv("PYTHON_SERVER_SECRET", "")[:3] + "..." if os.getenv("PYTHON_SERVER_SECRET") else None,
        "DEEPGRAM_API_KEY": os.getenv("DEEPGRAM_API_KEY", "")[:3] + "..." if os.getenv("DEEPGRAM_API_KEY") else None,
        "PORT": os.getenv("PORT", "8000"),
    }}

@app.get("/sentry-debug")
async def trigger_error():
    logger.info("Sentry debug endpoint called")
    division_by_zero = 1 / 0

@app.post("/transcribe-deepgram", dependencies=[Depends(authenticate_request)])
async def transcribe(request: TranscribeRequest):
    user_audio_path, agent_audio_path, tmp_dir = None, None, None
    try:
        logger.info(f"Received transcription request for URL: {request.stereo_audio_url[:100]}...")
        
        # First, test if we can access the URL at all
        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                async with session.head(request.stereo_audio_url) as response:
                    logger.info(f"URL HEAD check response: {response.status}")
                    if response.status != 200:
                        logger.error(f"URL not accessible: {response.status}")
                        raise HTTPException(status_code=400, detail=f"Audio URL not accessible: {response.status}")
        except Exception as url_error:
            logger.error(f"Error checking URL: {str(url_error)}")
            # Continue anyway, as HEAD might not be supported
        
        # Split channels
        logger.info("Splitting audio channels...")
        user_audio_path, agent_audio_path, tmp_dir = await split_channels(request.stereo_audio_url)
        logger.info(f"Split channels completed: user={user_audio_path}, agent={agent_audio_path}")
        
        # Transcribe
        logger.info("Transcribing with Deepgram...")
        transcriptions = await transcribe_with_deepgram([user_audio_path, agent_audio_path], request.language or "en")
        logger.info(f"Transcription completed: user_words={len(transcriptions[0])}, agent_words={len(transcriptions[1])}")
        
        # Create transcript
        logger.info("Creating transcript from transcriptions...")
        transcript = await create_transcript_from_deepgram(transcriptions[0], transcriptions[1], user_audio_path, agent_audio_path)
        logger.info(f"Transcript created: {len(transcript.get('segments', []))} segments")
        
        return transcript
    except Exception as e:
        logger.error(f"Deepgram transcription failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_dir:
            logger.info(f"Cleaning up temporary directory: {tmp_dir}")
            cleanup_temp_files(tmp_dir)

@app.post("/websocket-call-ofone", dependencies=[Depends(authenticate_request)])
async def start_websocket_call_ofone(request: StartWebsocketCallOfOneRequest):
    try:
        import httpx
        logger.info(f"Received websocket call request for device: {request.device_id}")

        # Prepare the request payload
        payload = {
            "device_id": request.device_id,
            "assistant_id": request.assistant_id,
            "assistant_overrides": request.assistant_overrides,
            "base_url": request.base_url
        }

        # Make the POST request to the kiosk endpoint
        endpoint = os.getenv('RUN_OFONE_KIOSK_ENDPOINT')
        if not endpoint:
            logger.error("RUN_OFONE_KIOSK_ENDPOINT environment variable not set")
            raise HTTPException(status_code=500, detail="RUN_OFONE_KIOSK_ENDPOINT is not set")
        
        logger.info(f"Making request to kiosk endpoint: {endpoint}")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                endpoint,
                json=payload,
            )
            
            logger.info(f"Kiosk endpoint response: {response.status_code}")
            if response.status_code != 200:
                logger.error(f"Kiosk endpoint request failed: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Request failed: {response.text}"
                )

            response_data = response.json()
            logger.info(f"Websocket call initiated with callId: {response_data.get('callId')}")
            return {
                "callId": response_data.get("callId")
            }

    except Exception as e:
        logger.error(f"Error in websocket call: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/test-auth", dependencies=[Depends(authenticate_request)])
async def test_auth():
    """Test endpoint to verify authentication is working"""
    return {"status": "authenticated"}

@app.get("/env-check")
async def env_check():
    """Check environment variables (redacted for security)"""
    return {
        "PYTHON_SERVER_SECRET_CONFIGURED": bool(os.getenv("PYTHON_SERVER_SECRET")),
        "DEEPGRAM_API_KEY_CONFIGURED": bool(os.getenv("DEEPGRAM_API_KEY")),
        "AWS_CREDENTIALS_CONFIGURED": bool(os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")),
        "PORT": os.getenv("PORT", "8000"),
    }
    
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"Starting transcription service on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)