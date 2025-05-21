FROM python:3.9-slim

WORKDIR /app


RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


ENV PYTHONPATH=/app
ENV C_FORCE_ROOT=1  

CMD sh -c "celery -A app.services.app worker --loglevel=info & uvicorn app.main:app --host 0.0.0.0 --port 8000"