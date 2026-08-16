"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PwaContextType } from "./types";
import { usePwa } from "./usePwa";
import { APP_ROUTES } from "@/lib/routes";

const PwaContext = createContext<PwaContextType | null>(null);

type Props = {
  children: ReactNode;
};

export default function PwaProvider({ children }: Props) {
  const pwa = usePwa();
  const router = useRouter();

  useEffect(() => {
    APP_ROUTES.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  return <PwaContext.Provider value={pwa}>{children}</PwaContext.Provider>;
}

export function usePwaContext() {
  const context = useContext(PwaContext);

  if (!context) {
    throw new Error("usePwaContext must be used inside PwaProvider");
  }

  return context;
}