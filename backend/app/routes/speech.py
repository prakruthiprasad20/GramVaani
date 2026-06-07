import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from faster_whisper import WhisperModel

router = APIRouter(prefix="/speech", tags=["speech"])

_model = None


def get_whisper_model():
    global _model
    if _model is None:
        _model = WhisperModel("medium", device="cpu", compute_type="int8")
    return _model


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Please upload a valid audio file.")

    suffix = os.path.splitext(file.filename or "")[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(await file.read())
        temp_audio_path = temp_audio.name

    try:
        model = get_whisper_model()
        segments, info = model.transcribe(
            temp_audio_path,
            beam_size=5,
            task="translate",
    )
        transcript = " ".join(segment.text.strip() for segment in segments).strip()

        return {
            "text": transcript,
            "language": info.language,
            "duration": info.duration,
            "translated_to": "en",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")
    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)