FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install geospatial dependencies
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# Create non-root user for security
RUN useradd -m appuser
USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
