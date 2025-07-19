# apps/transcription-service/src/services/split_channels.py
from pydub import AudioSegment
import tempfile
from pathlib import Path
import shutil
import aiohttp
import aiofiles
import os
import logging
import subprocess
from utils.logger import logger

async def split_channels(stereo_audio_url: str) -> tuple[str, str, str]:
    """Split a stereo audio file into separate left and right channel files."""
    logger.info(f"Attempting to download from URL: {stereo_audio_url[:100]}...")
    tmp_dir = tempfile.mkdtemp()
    try: 
        tmp_path = Path(tmp_dir)
        
        # Download audio file asynchronously
        async with aiohttp.ClientSession() as session:
            logger.info(f"Sending GET request to URL")
            async with session.get(stereo_audio_url) as response:
                logger.info(f"Received response: {response.status}")
                response.raise_for_status()
                content = await response.read()
        
        logger.info(f"Successfully downloaded file, size: {len(content)} bytes")
        
        # Determine file extension from URL or content-type
        file_extension = 'wav'  # Default
        if stereo_audio_url.lower().endswith('.mp4'):
            file_extension = 'mp4'
        elif stereo_audio_url.lower().endswith('.mp3'):
            file_extension = 'mp3'
        
        stereo_path = tmp_path / f"stereo.{file_extension}"
        
        # Save stereo file temporarily
        logger.info(f"Saving downloaded content to {stereo_path}")
        async with aiofiles.open(stereo_path, 'wb') as f:
            await f.write(content)
        
        # For MP4 files, use ffmpeg to extract audio
        if file_extension == 'mp4':
            logger.info("Detected MP4 file, using ffmpeg to extract audio")
            wav_path = tmp_path / "stereo.wav"
            
            # Use ffmpeg subprocess to convert MP4 to WAV
            try:
                ffmpeg_cmd = [
                    'ffmpeg', 
                    '-i', str(stereo_path),
                    '-ac', '2',  # Ensure stereo output
                    '-vn',       # Skip video
                    '-acodec', 'pcm_s16le',  # PCM encoding
                    '-ar', '44100',  # Sample rate
                    str(wav_path)
                ]
                logger.info(f"Running ffmpeg command: {' '.join(ffmpeg_cmd)}")
                process = subprocess.run(
                    ffmpeg_cmd, 
                    capture_output=True, 
                    text=True
                )
                
                if process.returncode != 0:
                    logger.error(f"ffmpeg error: {process.stderr}")
                    raise Exception(f"ffmpeg conversion failed: {process.stderr}")
                
                logger.info(f"ffmpeg conversion successful, created {wav_path}")
                stereo_path = wav_path
                file_extension = 'wav'
            except Exception as e:
                logger.error(f"Error converting MP4 to WAV: {str(e)}")
                raise
        
        # Load stereo audio
        logger.info(f"Loading audio from {stereo_path}")
        try:
            # Try with explicit format first
            audio = AudioSegment.from_file(str(stereo_path), format=file_extension)
            logger.info(f"Loaded audio with format {file_extension}: channels={audio.channels}, frame_rate={audio.frame_rate}, duration={len(audio)/1000}s")
        except Exception as e:
            logger.warning(f"Error loading with explicit format {file_extension}: {e}")
            # Try again without specifying format
            audio = AudioSegment.from_file(str(stereo_path))
            logger.info(f"Loaded audio without format specification: channels={audio.channels}, frame_rate={audio.frame_rate}")
        
        # Check if the audio is actually stereo
        if audio.channels != 2:
            logger.warning(f"Expected 2 channels, got {audio.channels}. Attempting to convert to stereo.")
            if audio.channels == 1:
                # If mono, duplicate the channel to create stereo
                audio = AudioSegment.from_mono_audiosegments(audio, audio)
                logger.info("Converted mono to stereo by duplicating channel")
        
        # Split into channels
        logger.info("Splitting audio into channels")
        channels = audio.split_to_mono()
        logger.info(f"Split audio into {len(channels)} channels")

        if len(channels) != 2:
            raise Exception(f"Expected 2 channels after processing, got {len(channels)}")
        
        # Save individual channels
        left_path = tmp_path / "left.wav"
        right_path = tmp_path / "right.wav"
        
        left_channel = channels[0]
        right_channel = channels[1]
        
        logger.info(f"Exporting left channel to {left_path}")
        left_channel.export(str(left_path), format="wav")
        
        logger.info(f"Exporting right channel to {right_path}")
        right_channel.export(str(right_path), format="wav")
        
        logger.info(f"Successfully exported channel files")
        return str(left_path), str(right_path), tmp_dir
    except Exception as e:
        logger.error(f"Error splitting channels: {str(e)}", exc_info=True)
        # Clean up only on failure
        try:
            shutil.rmtree(tmp_dir)
        except Exception as cleanup_error:
            logger.error(f"Error cleaning up temporary directory: {str(cleanup_error)}")
        raise e

def cleanup_temp_files(*paths: str | None) -> None:
    """Remove temporary files or directories."""
    for path in paths:
        if path is None:
            continue
        try:
            if os.path.isfile(path):
                os.remove(path)
                logger.info(f"Removed file: {path}")
            elif os.path.isdir(path):
                shutil.rmtree(path)
                logger.info(f"Removed directory: {path}")
        except Exception as e:
            logger.error(f"Error cleaning up path {path}: {e}")