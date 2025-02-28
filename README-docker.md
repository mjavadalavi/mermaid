# راه‌اندازی Mermaid API با Docker

این راهنما نحوه راه‌اندازی سرویس Mermaid API با استفاده از Docker و Docker Compose را توضیح می‌دهد.

## پیش‌نیازها

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## راه‌اندازی سرویس

### ۱. ساخت و اجرای کانتینر

برای ساخت و اجرای سرویس، دستور زیر را در ترمینال اجرا کنید:

```bash
docker-compose up -d
```

این دستور سرویس Mermaid API را در پس‌زمینه اجرا می‌کند. برای مشاهده لاگ‌ها می‌توانید از دستور زیر استفاده کنید:

```bash
docker-compose logs -f
```

### ۲. بررسی وضعیت سرویس

برای اطمینان از اینکه سرویس به درستی اجرا شده است، می‌توانید به آدرس زیر مراجعه کنید:

```
http://localhost:3000/health
```

اگر سرویس به درستی اجرا شده باشد، پاسخ `{"status":"ok"}` را دریافت خواهید کرد.

### ۳. استفاده از سرویس

برای استفاده از سرویس، می‌توانید به آدرس زیر مراجعه کنید:

```
http://localhost:3000
```

یا می‌توانید از اسکریپت‌های `test-curl.sh` یا `test-request.js` برای ارسال درخواست به سرویس استفاده کنید.

### ۴. توقف سرویس

برای توقف سرویس، دستور زیر را اجرا کنید:

```bash
docker-compose down
```

## ساختار پوشه‌ها

- `output`: خروجی‌های تولید شده توسط سرویس در این پوشه ذخیره می‌شوند.
- `temp`: فایل‌های موقت در این پوشه ذخیره می‌شوند.

## تنظیمات پیشرفته

### تغییر پورت

اگر می‌خواهید از پورت دیگری به جای پورت ۳۰۰۰ استفاده کنید، می‌توانید فایل `docker-compose.yml` را ویرایش کنید:

```yaml
ports:
  - "8080:3000"  # تغییر پورت از 3000 به 8080
```

### تنظیمات Puppeteer

تنظیمات Puppeteer در فایل `docker-compose.yml` قابل تغییر است:

```yaml
command: >
  node index.js --puppeteer-args="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage"
```

## عیب‌یابی

### مشکل دسترسی به فایل‌ها

اگر با مشکل دسترسی به فایل‌ها مواجه شدید، اطمینان حاصل کنید که پوشه‌های `output` و `temp` وجود دارند و دسترسی‌های لازم را دارند:

```bash
mkdir -p output temp
chmod 777 output temp
```

### مشکل اجرای Puppeteer در Docker

اگر با مشکل اجرای Puppeteer در Docker مواجه شدید، می‌توانید از آرگومان‌های بیشتری استفاده کنید:

```yaml
command: >
  node index.js --puppeteer-args="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--disable-software-rasterizer"
``` 