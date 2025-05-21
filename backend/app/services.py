import os
import uuid
import tempfile
from moviepy.editor import VideoFileClip
import openai
from celery import Celery
from .models import JobStatus


app = Celery('tasks', broker='redis://redis:6379/0')

jobs = {}

@app.task(bind=True)
def process_video(self, job_id: str, video_bytes: bytes, target_language: str):
    try:
        jobs[job_id] = {"status": "processing"}
        
     
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp.write(video_bytes)
            video_path = tmp.name
        
        try:
          
            audio_path = f"{video_path}.wav"
            video = VideoFileClip(video_path)
            video.audio.write_audiofile(audio_path)
            
            with open(audio_path, "rb") as audio_file:
                transcript = openai.Audio.transcribe("whisper-1", audio_file)
            
         
            translation = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": f"Translate the following text to {target_language}. Keep the meaning accurate and natural."
                    },
                    {
                        "role": "user", 
                        "content": transcript["text"]
                    }
                ]
            )
            
            jobs[job_id] = {
                "status": "completed",
                "result": translation.choices[0].message.content
            }
            
        except Exception as e:
            jobs[job_id] = {
                "status": "error",
                "error": f"Processing error: {str(e)}"
            }
            
        finally:
           
            if os.path.exists(video_path):
                os.unlink(video_path)
            if os.path.exists(audio_path):
                os.unlink(audio_path)
                
    except Exception as e:
        jobs[job_id] = {
            "status": "error",
            "error": f"System error: {str(e)}"
        }

def get_job_status(job_id: str) -> JobStatus:
    job = jobs.get(job_id)
    if not job:
        return JobStatus(status="not_found", error="Job ID not found")
    return JobStatus(**job)