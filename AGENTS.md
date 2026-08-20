# Inkarete — AI Development Rules

این فایل قوانین عملی برای AI/Coding Agent در review و تغییرات بعدی پروژه است.

## قبل از هر تغییر

1. `ARCHITECTURE.md` را بخوان.
2. وضعیت branch و آخرین commit را بررسی کن.
3. قبل از refactor، referenceهای feature موردنظر را در کل repository جستجو کن.
4. تغییرات را حداقلی نگه دار و از abstraction غیرضروری خودداری کن.
5. secretها، VAPID private key و Redis credentials را هرگز وارد source یا documentation نکن.
6. برای تغییرات Next.js، اگر API یا convention مربوط به نسخه فعلی مبهم است، راهنمای نسخه نصب‌شده در `node_modules/next/dist/docs/` را بررسی کن.

## Notification architecture rules

- `page.tsx` نباید scheduler یا `setInterval` برای notification داشته باشد.
- Web Push نقش wake-up signal را دارد؛ schedule کامل نباید از server به device push شود.
- Service Worker باید taskهای local را از IndexedDB بخواند و reminder را با local device time محاسبه کند.
- timezone قابل تنظیم توسط کاربر وجود ندارد و نباید دوباره اضافه شود.
- notification occurrence باید idempotent باشد و notification تکراری نمایش داده نشود.
- Push cron تقریبی است؛ منطق نباید به اجرای دقیق در دقیقه مشخص وابسته باشد.
- قبل از اضافه کردن scheduler جدید، Service Worker + IndexedDB + Web Push موجود را بررسی کن.

## Time rules

- `18:00` یعنی ساعت محلی دستگاه.
- از timezone setting یا تبدیل timezone برای scheduling استفاده نکن.
- ساعت دستی دستگاه باید به‌عنوان local clock مبنا قرار گیرد.

## Data rules

- Taskها و settings در IndexedDB هستند.
- migrationهای IndexedDB باید backward-compatible باشند.
- داده‌های قدیمی `priority` و `timeZone` باید در migration پاک شوند.
- feature حذف‌شده را فقط برای رفع TypeScript دوباره به model برنگردان.

## Priority rule

`priority` feature حذف شده است. موارد زیر نباید دوباره ایجاد شوند:

- `Priority` type
- `PrioritySelect`
- task.priority
- priority index
- priority scheduling/UI logic

## Vercel / Redis rules

- Redis روی Vercel به‌عنوان persistence برای Web Push subscriptions استفاده می‌شود.
- اتصال Redis باید از environment variables باشد.
- Vercel server endpoint منطق wake-up را اجرا می‌کند.
- `PUSH_WAKEUP_SECRET` باید بین Vercel و GitHub Actions هماهنگ باشد و مقدار واقعی آن در repo نوشته نشود.

## GitHub Actions rules

- CI باید روی push/PR build را بررسی کند.
- workflow مربوط به Push wake-up تقریباً هر ۵ دقیقه اجرا می‌شود.
- GitHub Actions فقط trigger/scheduler است؛ منطق business notification در Vercel و Service Worker بماند.
- cron GitHub Actions دقیق نیست؛ reminder window را در نظر بگیر.

## PWA install rules

- وضعیت install prompt باید در Zustand مدیریت شود؛ localStorage فقط persistence بین refreshها را فراهم کند.
- navigation بین صفحات نباید باعث نمایش دوباره prompt شود.
- `beforeinstallprompt` سیگنال قابل نصب بودن در مرورگرهای پشتیبان است.
- `display-mode: standalone` و `navigator.standalone` برای تشخیص اجرای نصب‌شده استفاده شوند.
- `appinstalled` وضعیت نصب را ثبت کند.
- اگر برنامه uninstall شد و browser دوباره `beforeinstallprompt` داد، state قدیمی install/seen باید قابل reset باشد تا prompt دوباره امکان نمایش داشته باشد.
- «بعداً» نباید فقط در state محلی component کنترل شود؛ باید در store/persistence ثبت شود.
- state مربوط به PWA نباید داخل `page.tsx` پخش شود؛ منطق آن در `components/pwa` و store مربوط به PWA بماند.

## Maintainability

لایه‌ها تا حد ممکن جدا و کوچک باشند:

- permission/platform detection
- service worker communication
- local notification
- push subscription
- scheduling
- PWA install state

از duplicate logic، state سراسری غیرضروری و helperهای مشابه خودداری کن.

## Validation before merge

حداقل این موارد بررسی شوند:

1. `npm run build`
2. GitHub Actions CI سبز باشد.
3. Vercel Preview build سبز باشد.
4. Web Push test دریافت شود.
5. PWA در background/closed حالت notification واقعی را تست کند.
6. reminder کمتر از پنجره wake-up از دست نرود.
7. duplicate notification ایجاد نشود.
8. ساعت دستی دستگاه رفتار مورد انتظار را داشته باشد.
9. install prompt بعد از نصب، refresh و navigation دوباره ظاهر نشود.
10. بعد از uninstall و بازگشت به browser، در صورت دریافت `beforeinstallprompt` امکان نصب دوباره وجود داشته باشد.

## Documentation rule

اگر معماری notification، PWA، storage، deployment، GitHub Actions یا environmentها تغییر کرد، `ARCHITECTURE.md` را در همان change به‌روزرسانی کن.
