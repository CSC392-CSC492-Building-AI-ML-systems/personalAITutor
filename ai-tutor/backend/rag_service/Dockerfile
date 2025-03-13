# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY app.py /app
COPY Dockerfile /app

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Make port 6000 available to the world outside this container
EXPOSE 6000

# Run app.py when the container launches
CMD ["flask", "run", "--host=0.0.0.0", "--port=6000"]