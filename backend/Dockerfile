FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/data/transcripts

# Run seed data script to initialize Excel files
RUN python seed_data.py

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "run.py"]
