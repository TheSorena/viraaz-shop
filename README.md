# Viraaz (ویراژ) — فروشگاه کتاب و مجله آنلاین

> طراحی و توسعه: [تیم شهباز](https://shahbazteam.ir)

یک نمونه‌کار حرفه‌ای فول‌استک: فروشگاه آنلاین کتاب و مجله با تم فارسی و راست‌چین، در حوزه‌های تاریخ، علم، فناوری، فلسفه و دانش عمومی.

## معماری

```
viraaz shop/
├── client/                  # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # common, layout, sections
│   │   ├── context/         # Cart, Toast, Bookmarks, Settings
│   │   ├── hooks/           # useLocalStorage, useReadingProgress, useMediaQuery
│   │   ├── pages/           # صفحات سایت + pages/admin
│   │   ├── services/        # لایه API
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # ابزارهای فارسی‌سازی
│   └── public/              # لوگو، فونت، تصاویر جلد، sitemap، robots
└── server/                  # Node.js + Express + TypeScript
    ├── src/
    │   ├── controllers/     # لایه کنترلر
    │   ├── services/        # منطق تجاری
    │   ├── repositories/    # لایه دسترسی داده (JSON)
    │   ├── routes/          # تعریف مسیرها
    │   ├── middleware/      # خطا، لاگ، احراز هویت مدیریت
    │   ├── utils/           # کمکی‌ها و مدیریت خطا
    │   └── data/            # فایل‌های JSON داده
    └── tests/               # تست واحد
```

## پیش‌نیازها

- Node.js نسخه ۱۸ یا بالاتر
- npm

## نصب و اجرای سریع

### ۱. راه‌اندازی بک‌اند

```bash
cd server
npm install
cp .env.example .env     # در ویندوز: copy .env.example .env
npm run build
npm run dev              # اجرا روی http://localhost:4000
```

### ۲. راه‌اندازی فرانت‌اند

```bash
cd client
npm install
npm run dev              # اجرا روی http://localhost:5173
```

در حالت توسعه، Vite درخواست‌های `/api` را به بک‌اند پراکسی می‌کند، بنابراین نیازی به تنظیم CORS اضافی نیست.

## اطلاعات حساب آزمایشی

پنل مدیریت (`/admin`) از یک رمز توسعه‌ای استفاده می‌کند:

- رمز پیش‌فرض: `dev-admin-1234` (در فایل `server/.env` قابل تغییر است)

## دستورات

| بک‌اند | فرانت‌اند |
|---|---|
| `npm run dev` — اجرای توسعه با watch | `npm run dev` — سرور توسعه Vite |
| `npm run build` — کامپایل TypeScript | `npm run build` — ساخت نسخه تولیدی |
| `npm start` — اجرای تولیدی | `npm run preview` — پیش‌نمایش بیلد |
| `npm test` — تست واحد | — |

## استقرار تولیدی

۱. بک‌اند را بیلد و اجرا کنید:

```bash
cd server
npm install --omit=dev
npm run build
npm start
```

۲. فرانت‌اند را بیلد کنید:

```bash
cd client
npm install
npm run build
```

۳. بک‌اند Express، فایل‌های استاتیک `client/dist` را سرو می‌کند (اگر پوشه وجود داشته باشد). بنابراین می‌توانید فقط بک‌اند را اجرا کنید و سایت کامل روی پورت ۴۰۰۰ در دسترس باشد.

برای استقرار جداگانه، `client/dist` را روی هر وب‌سرور استاتیک (Nginx، Netlify، Vercel) بگذارید و متغیر `VITE_API_URL` را به آدرس API تنظیم کنید.

## استقرار روی Vercel (فرانت + API یکجا)

ریپو از قبل برای Vercel آماده است (`vercel.json` + تابع `api/handler.js` + اسکریپت `vercel-build`):

۱. ریپو را به گیت‌هاب پوش کنید و در [vercel.com/new](https://vercel.com/new) ایمپورت کنید. Vercel خودش بیلد (`npm run vercel-build`) و خروجی (`client/dist`) را تشخیص می‌دهد.
۲. در تنظیمات پروژه → Environment Variables این‌ها را بگذارید:

| متغیر | مقدار پیشنهادی |
|---|---|
| `ADMIN_PASSWORD` | یک رمز قوی دلخواه (ورود `/admin`) |
| `NODE_ENV` | `production` |

۳. دیپلوی کنید. فرانت‌اند روی دامنه اصلی و API روی همان دامنه با مسیر `/api/v1/...` بالا می‌آید (نیازی به `VITE_API_URL` نیست؛ CORS همان‌دامنه خودکار مجاز است).

> ⚠️ محدودیت مهم Vercel: فایل‌سیستم serverless فقط‌خواندنی است. سفارش‌ها و تغییرات پنل مدیریت فقط در حافظه همان نمونه (تا سرد شدن) می‌مانند و با دیپلوی بعدی به داده اولیه برمی‌گردند. برای فروشگاه واقعی، بک‌اند را روی هاست Node دائمی (VPS/Render/Railway) اجرا کنید و فقط فرانت را روی Vercel بگذارید (با `VITE_API_URL` به آدرس بک‌اند).

## متغیرهای محیطی

فایل `server/.env.example` را کپی کرده و تنظیم کنید:

| متغیر | توضیح | پیش‌فرض |
|---|---|---|
| `PORT` | پورت بک‌اند | `4000` |
| `NODE_ENV` | محیط اجرا | `development` |
| `CORS_ORIGINS` | مبدأهای مجاز (جداشده با کاما) | `http://localhost:5173` |
| `ADMIN_PASSWORD` | رمز پنل مدیریت (فقط توسعه) | `dev-admin-1234` |
| `DATA_DIR` | مسیر پوشه داده‌ها | `src/data` |

## وضعیت نسخه فعلی و محدودیت‌ها

- **داده‌ها:** بدون دیتابیس؛ همه داده‌ها در فایل‌های JSON محلی ذخیره می‌شوند. نوشتن فایل‌ها اتمیک (temp + rename) و صف‌بندی‌شده است.
- **پرداخت:** پیاده‌سازی نشده. سفارش‌ها صرفاً آزمایشی هستند و هیچ پولی دریافت نمی‌شود.
- **احراز هویت:** پنل مدیریت از رمز محیطی + نشست در حافظه استفاده می‌کند. **این امنیت تولیدی نیست.**
- **ایمیل و پیامک:** فرم خبرنامه صرفاً نمایشی است.
- **محتوا:** همه مقالات و دیدگاه‌ها «محتوای آزمایشی» هستند.

### قبل از انتشار عمومی باید تکمیل شود

- احراز هویت پایدار (bcrypt/argon2 + JWT/session دائمی)
- مدیریت نشست امن (HttpOnly cookie، CSRF)
- محدودسازی نرخ درخواست (rate limiting)
- کنترل دسترسی مبتنی بر نقش
- HTTPS اجباری
- جایگزینی لایه Repository با دیتابیس واقعی
- پیاده‌سازی درگاه پرداخت

## API

همه APIها با پیشوند `/api/v1` هستند. نمونه مسیرها:

- `GET /api/v1/books` — فهرست کتاب‌ها (فیلتر، جست‌وجو، مرتب‌سازی، صفحه‌بندی)
- `GET /api/v1/books/:slug` — جزئیات کتاب
- `GET /api/v1/articles` — فهرست مقالات
- `GET /api/v1/articles/:slug` — جزئیات مقاله
- `GET /api/v1/categories` — دسته‌بندی‌ها
- `GET /api/v1/search?q=...` — جست‌وجوی سراسری
- `POST /api/v1/orders` — ثبت سفارش آزمایشی (محاسبه قیمت در بک‌اند)
- `POST /api/v1/auth/login` — ورود مدیریت
- `GET /api/v1/admin/dashboard` — آمار داشبورد
- `POST/PUT/DELETE /api/v1/admin/books` — CRUD کتاب
- `POST/PUT/DELETE /api/v1/admin/articles` — CRUD مقاله
- `GET/PATCH /api/v1/admin/orders` — مدیریت سفارش‌ها

## تست

```bash
cd server
npm test
```

تست‌ها شامل محاسبه قیمت و تخفیف، نرمال‌سازی فارسی، جست‌وجو و فیلتر هستند.

## لایه Repository

لایه `server/src/repositories/` انتزاعی برای دسترسی داده فراهم می‌کند. برای اتصال دیتابیس در آینده، کافی است پیاده‌سازی JSON را با پیاده‌سازی MongoDB/PostgreSQL جایگزین کنید؛ سرویس‌ها تغییری نمی‌کنند.

## مجوز

نمونه‌کار نمایشی — بدون گارانتی.
