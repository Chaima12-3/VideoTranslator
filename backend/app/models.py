from pydantic import BaseModel
from typing import Optional

class UploadRequest(BaseModel):
    target_language: str

class JobStatus(BaseModel):
    status: str
    result: Optional[str] = None
    error: Optional[str] = None