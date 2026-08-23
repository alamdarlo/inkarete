"use client";

import { useEffect, useState } from "react";

export default function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;

    const checkUpdate = async () => {
      try {
        registration = await navigator.serviceWorker.ready;
        if (disposed) return;

        await registration.update();
        if (disposed) return;

        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShow(true);
        }

        const handleUpdateFound = () => {
          const worker = registration?.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller &&
              !disposed
            ) {
              setWaitingWorker(worker);
              setShow(true);
            }
          });
        };

        registration.addEventListener("updatefound", handleUpdateFound);
      } catch {
        // PWA update checks are best-effort and should never break the app.
      }
    };

    checkUpdate();

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      if (registration) {
        // updatefound listeners are short-lived and harmless after disposal;
        // the disposed flag prevents state updates after unmount.
      }
    };
  }, []);

  const update = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-indigo-600 p-4 text-white shadow-xl" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">🔄 نسخه جدید آماده است</h3>
          <p className="mt-1 text-sm text-indigo-100">برای دریافت آخرین تغییرات بروزرسانی کنید.</p>
        </div>
        <button onClick={update} className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-medium text-indigo-700">
          بروزرسانی
        </button>
      </div>
    </div>
  );
}
