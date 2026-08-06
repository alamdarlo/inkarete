"use client";

import { APP_DESCRIPTION, APP_NAME } from "./constants";
import { usePwaContext } from "./PwaProvider";
import IOSInstallGuide from "./IOSInstallGuide";

export default function InstallBanner() {
  const {
    showBanner,
    isIOS,
    canInstall,
    install,
    dismiss,
    permanentlyDismiss,
  } = usePwaContext();

  if (!showBanner) {
    return null;
  }

  if (isIOS) {
    return (
      <IOSInstallGuide
        onClose={permanentlyDismiss}
      />
    );
  }

  if (!canInstall) {
    return null;
  }

  return (
    <div
      className="
      mb-4
      overflow-hidden
      rounded-2xl
      bg-gradient-to-l
      from-indigo-600
      to-blue-600
      p-5
      text-white
      shadow-xl
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>

          <h2
            className="
            text-lg
            font-bold
            "
          >
            📲 {APP_NAME}
          </h2>

          <p
            className="
            mt-2
            text-sm
            text-indigo-100
            "
          >
            {APP_DESCRIPTION}
          </p>

        </div>

        <button
          onClick={permanentlyDismiss}
          aria-label="بستن"
          className="
          rounded-full
          p-2
          transition
          hover:bg-white/20
          "
        >
          ✕
        </button>
      </div>

      <div
        className="
        mt-5
        flex
        justify-end
        gap-2
        "
      >

        <button
          onClick={dismiss}
          className="
          rounded-xl
          bg-white/15
          px-4
          py-2
          text-sm
          transition
          hover:bg-white/25
          "
        >
          بعداً
        </button>

        <button
          onClick={install}
          className="
          rounded-xl
          bg-white
          px-5
          py-2
          text-sm
          font-semibold
          text-indigo-700
          transition
          hover:bg-indigo-50
          "
        >
          نصب برنامه
        </button>

      </div>
    </div>
  );
}