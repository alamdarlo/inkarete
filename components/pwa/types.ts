export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export interface PwaState {
  canInstall: boolean;

  isIOS: boolean;

  isAndroid: boolean;

  isDesktop: boolean;

  isInstalled: boolean;

  showBanner: boolean;
}

export interface PwaContextType extends PwaState {
  install: () => Promise<void>;

  dismiss: () => void;

  permanentlyDismiss: () => void;
}