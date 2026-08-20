# Inkarete — Architecture & Current Status

> این فایل وضعیت معماری پروژه و تصمیم‌های مهم refactor را ثبت می‌کند تا reviewهای بعدی از همین نقطه ادامه پیدا کنند.

## وضعیت فعلی

- Branch اصلی این refactor: `refactor/notification-simplification`
- Build فعلی: موفق
- Preview Vercel: تست شده و موفق
- هدف refactor: ساده‌سازی notification subsystem، حذف timezone تنظیم‌شدنی، حذف باقی‌مانده‌های priority و قابل‌اعتماد کردن notification روی موبایل/PWA.
- `priority` از مدل task، UI و schema حذف شده است.
- تنظیم `showCategories` برای کنترل نمایش CategorySelect اضافه شده است.

## معماری notification فعلی

Notification باید بر اساس این مدل کار کند:

```text
GitHub Actions (~5 min wake-up)
        |
        v
Vercel API / push wake-up
        |
        v
Redis -> active Web Push subscriptions
        |
        v
Web Push -> Service Worker on device
        |
        +--> IndexedDB: tasks
        +--> IndexedDB: notification settings
        +--> local device clock
        |
        v
check reminder window
        |
        v
showNotification()
```

### اصل مهم

Web Push فقط یک **wake-up signal** است. Push نباید schedule کامل task را از server دریافت کند. Service Worker روی دستگاه taskهای local را از IndexedDB می‌خواند و بر اساس ساعت local دستگاه تصمیم می‌گیرد که notification باید نمایش داده شود یا نه.

این طراحی عمداً به `setInterval` داخل `page.tsx` وابسته نیست، چون صفحه ممکن است روی موبایل بسته یا suspend شود.

## Timezone

Timezone قابل تنظیم توسط کاربر حذف شده است.

- task time یک local wall-clock time است؛ مثل `18:00`.
- زمان فعلی باید بر اساس ساعت local خود دستگاه خوانده شود.
- بنابراین اگر کاربر ساعت دستگاه را دستی تنظیم کرده باشد، همان ساعت مبنای notification است.
- نباید دوباره `settings.timeZone` یا تبدیل‌های `Intl` برای timezone تنظیم‌شده توسط کاربر اضافه شود.

## Reminder window

Backend/cron قرار نیست دقیقاً در یک ثانیه مشخص notification را اجرا کند. GitHub Actions تقریباً هر ۵ دقیقه wake-up می‌کند.

Service Worker باید یک پنجره زمانی داشته باشد تا تأخیر cron باعث از دست رفتن reminder نشود. در عین حال هر occurrence باید فقط یک بار notification بدهد.

کلید deduplication باید بر اساس occurrence باشد، مانند:

```text
taskId + localDate + taskTime
```

## Page / UI

`app/page.tsx` نباید مسئول scheduler یا timer notification باشد.

مسئولیت page:

- task CRUD
- UI state
- settings UI
- local persistence
- نمایش `CategorySelect` فقط وقتی `showCategories` فعال است

Category behavior:

- `showCategories = true` → CategorySelect در فرم task نمایش داده می‌شود.
- `showCategories = false` → dropdown انتخاب category اصلاً render نمی‌شود و task جدید بدون category ذخیره می‌شود.
- category موجود روی taskهای قبلی پاک نمی‌شود.
- اگر task category داشته باشد، label همان category روی task نمایش داده می‌شود؛ task بدون category هیچ label دسته‌بندی ندارد.

## IndexedDB

Taskها و settings در IndexedDB محلی نگهداری می‌شوند.

Schema باید با حذف priority و timezone هماهنگ باشد. Migration فعلی باید داده‌های قدیمی `priority` و `timeZone` را پاک کند و index قدیمی priority را حذف کند.

`showCategories` یک setting پایدار است و migration آن با مقدار پیش‌فرض `true` اضافه شده است تا کاربران موجود رفتار قبلی UI را از دست ندهند.

## Web Push / Vercel / Redis

پروژه روی Vercel deploy شده است.

Redis به پروژه Vercel متصل است و environment variables مربوط به Redis در Vercel تنظیم شده‌اند. کد server-side از environment برای اتصال Redis استفاده می‌کند؛ credentialهای Redis نباید داخل repository قرار بگیرند.

Web Push با VAPID کار می‌کند:

- VAPID public key: client-side برای subscription
- VAPID private key: فقط server-side
- subscriptionهای فعال در Redis نگهداری می‌شوند.

### Secret مربوط به wake-up

برای endpoint wake-up یک secret مشترک بین Vercel و GitHub Actions استفاده می‌شود:

```text
Vercel:
PUSH_WAKEUP_SECRET

GitHub Actions:
INKARETE_APP_URL
PUSH_WAKEUP_SECRET
```

مقادیر واقعی secret نباید در این فایل نوشته شوند.

## GitHub Actions

دو workflow برای پروژه در نظر گرفته شده/اضافه شده‌اند:

1. **CI** — روی push/PR برای نصب dependency و اجرای build.
2. **Push wake-up** — اجرای cron تقریباً هر ۵ دقیقه و ارسال request امن به endpoint Vercel برای wake-up کردن Web Push.

GitHub Actions فقط trigger/scheduler است؛ منطق notification و Push باید در Vercel/server و Service Worker باقی بماند.

نکته: cronهای GitHub Actions زمان دقیق تضمین‌شده ندارند؛ بنابراین Service Worker باید reminder window داشته باشد.

## PWA install prompt

Install prompt باید فقط یک بار برای هر browser/device نشان داده شود وقتی کاربر هنوز برنامه را نصب نکرده است.

بعد از `appinstalled` یا قبول نصب، وضعیت نصب باید persist شود تا refresh یا navigation باعث نمایش دوباره banner نشود.

## Priority — حذف‌شده

Feature `priority` عمداً از پروژه حذف شده است.

نباید دوباره این موارد برگردند:

- `Priority` type
- `PrioritySelect`
- priority field در task model
- priority index در IndexedDB
- priority logic در UI یا scheduling

## فایل‌ها / نواحی مهم برای review بعدی

- `app/page.tsx` — task UI و CRUD؛ نباید scheduler داخلی داشته باشد.
- `app/settings/page.tsx` — تنظیمات نمایش و notification.
- `lib/db.ts` — schema و migration IndexedDB.
- `lib/notifications.ts` — permission/local notification/Push helpers.
- Service Worker / `worker/` — محل بررسی schedule و نمایش notification در background.
- APIهای `app/api/push/*` — subscription و wake-up server endpoints.
- `store/settingsStore.ts` — settings بدون timezone و با `showCategories`.
- `.github/workflows/*` — CI و wake-up cron.
- Vercel environment — Redis، VAPID و `PUSH_WAKEUP_SECRET`.

## وضعیت و کارهای باقی‌مانده

### انجام‌شده

- ساده‌سازی `page.tsx`
- حذف scheduler وابسته به page/timer
- حذف timezone setting
- حذف priority
- migration برای داده‌های قدیمی
- اضافه شدن/تنظیم GitHub Actions
- استفاده از Redis/Vercel برای subscriptionهای Push
- اصلاح install prompt one-time
- اضافه شدن تنظیم نمایش CategorySelect
- حفظ categoryهای قبلی هنگام خاموش کردن انتخاب category
- build موفق در CI و Vercel
- Preview تست شده

### قبل از merge نهایی باید بررسی شود

- اجرای واقعی wake-up از GitHub Actions
- دریافت Push در حالت PWA بسته/background
- task با reminder کمتر از پنجره ۵ دقیقه‌ای
- جلوگیری از duplicate notification
- تغییر/حذف task بعد از ایجاد subscription
- رفتار با ساعت دستی دستگاه
- پاک شدن subscriptionهای نامعتبر از Redis
- بررسی نهایی Service Worker روی Android/iOS
- تست خاموش/روشن کردن category visibility و taskهای دارای/فاقد category

## قانون برای refactorهای بعدی

سادگی اولویت دارد. برای هر feature جدید، قبل از اضافه کردن abstraction باید بررسی شود که آیا همان رفتار را می‌توان با Service Worker + IndexedDB + Web Push موجود پیاده کرد یا نه.
