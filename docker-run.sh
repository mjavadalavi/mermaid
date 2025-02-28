#!/bin/bash

# رنگ‌ها برای خروجی
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== راه‌اندازی سرویس Mermaid API با Docker Compose ===${NC}"

# بررسی وجود فایل .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}فایل .env یافت نشد. ایجاد فایل با مقادیر پیش‌فرض...${NC}"
    echo "PORT=3000" > .env
fi

# خواندن متغیرهای محیطی از فایل .env
export $(grep -v '^#' .env | xargs)

# ایجاد پوشه‌های مورد نیاز
echo -e "${YELLOW}ایجاد پوشه‌های مورد نیاز...${NC}"
mkdir -p output temp
chmod 777 output temp

# ساخت و اجرای کانتینر
echo -e "${YELLOW}ساخت و اجرای کانتینر...${NC}"
docker-compose up -d --build

# بررسی وضعیت سرویس
echo -e "${YELLOW}بررسی وضعیت سرویس...${NC}"
sleep 5 # صبر کنید تا سرویس کاملاً راه‌اندازی شود

# تست سرویس با استفاده از curl
echo -e "${YELLOW}تست سرویس با استفاده از curl...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:${PORT}/health)

if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}سرویس با موفقیت راه‌اندازی شد!${NC}"
    echo -e "${GREEN}می‌توانید به آدرس http://localhost:${PORT} مراجعه کنید.${NC}"
    
    # نمایش لاگ‌های کانتینر
    echo -e "${YELLOW}لاگ‌های کانتینر:${NC}"
    docker-compose logs
else
    echo -e "${RED}خطا در راه‌اندازی سرویس!${NC}"
    echo -e "${RED}لاگ‌های کانتینر:${NC}"
    docker-compose logs
fi

echo -e "${YELLOW}=== برای توقف سرویس، دستور زیر را اجرا کنید: ===${NC}"
echo -e "${GREEN}docker-compose down${NC}" 