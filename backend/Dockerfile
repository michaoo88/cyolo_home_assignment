FROM python:3.9.13-slim-buster

ADD main.py .
ADD requirements.txt .

RUN pip install -r requirements.txt

CMD ["python", "main.py"]

EXPOSE 8080
