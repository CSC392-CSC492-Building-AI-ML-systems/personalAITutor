# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY api_service/ api_service/
COPY assets/ assets/
COPY migrations/ migrations/
COPY entrypoint.sh .
COPY test.py .

# Ensure the entrypoint script is executable
RUN chmod +x entrypoint.sh

# Set environment variables
ENV FLASK_APP=api_service/app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Expose the port the app runs on
EXPOSE 7001

# Use the shell script as the entry point
ENTRYPOINT ["./entrypoint.sh"]