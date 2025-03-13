# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY app.py .
COPY auth.py .
COPY flowchart.txt .
COPY main.py .
COPY models.py .
COPY Dockerfile .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Expose the port the app runs on
EXPOSE 7000

# Run the application with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:7000", "app:app"]