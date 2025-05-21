from fastapi import FastAPI, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .models import UploadRequest, JobStatus
from .services import process_video, get_job_status
import uuid
from typing import Optional

app = FastAPI(title="Video Translation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_video(file: UploadFile, target_language: str):
   
    if not file.filename.lower().endswith('.mp4'):
        raise HTTPException(
            status_code=400,
            detail="Only MP4 files are supported"
        )
    
    try:
        job_id = str(uuid.uuid4())
        
       
        file_content = await file.read()
        
        process_video.delay(job_id, file_content, target_language)
        
        return {"job_id": job_id, "message": "Processing started"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

@app.get("/{job_id}", response_model=JobStatus)
async def get_results(job_id: str):
    return get_job_status(job_id)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}