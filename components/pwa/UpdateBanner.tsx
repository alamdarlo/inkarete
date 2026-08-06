"use client";

import { useEffect, useState } from "react";

export default function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
navigator.serviceWorker.addEventListener(
"controllerchange",
()=>{

 window.location.reload();

});
    const checkUpdate = async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();

      if (registration.waiting) {
        setWaitingWorker(registration.waiting);

        setShow(true);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;

        if (!worker) return;

        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(worker);

            setShow(true);
          }
        });
      });
    };

    checkUpdate();
  }, []);

  const update = () => {
    if (!waitingWorker) return;

    waitingWorker.postMessage({
      type: "SKIP_WAITING",
    });

    //window.location.reload();
  };

  if (!show) return null;

  return (
    <div
      className="
      fixed
      bottom-4
      left-4
      right-4
      z-50
      mx-auto
      max-w-md
      rounded-2xl
      bg-indigo-600
      p-4
      text-white
      shadow-xl
      "
      dir="rtl"
    >
      <div
        className="
        flex
        items-center
        justify-between
        gap-3
        "
      >
        <div>
          <h3
            className="
            font-bold
            "
          >
            🔄 نسخه جدید آماده است
          </h3>

          <p
            className="
            mt-1
            text-sm
            text-indigo-100
            "
          >
            برای دریافت آخرین تغییرات بروزرسانی کنید.
          </p>
        </div>

        <button
          onClick={update}
          className="
          shrink-0
          rounded-xl
          bg-white
          px-4
          py-2
          text-sm
          font-medium
          text-indigo-700
          "
        >
          بروزرسانی
        </button>
      </div>
    </div>
  );
}
