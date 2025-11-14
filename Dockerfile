# ใช้ python บน Linux
FROM python:3.11-slim

# สร้าง working directory
WORKDIR /app

# คัดลอก requirements และติดตั้ง
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกไฟล์โปรเจกต์ทั้งหมด
COPY . .

# เปิดพอร์ต Flask
EXPOSE 5000

# รัน Flask ด้วย gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
