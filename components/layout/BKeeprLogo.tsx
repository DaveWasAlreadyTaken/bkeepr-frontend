import Image from "next/image";

import { BRANDING } from "@/app/config/branding";
import { cn } from "@/lib/utils";

type BKeeprLogoProps = {
  showName?: boolean;
  className?: string;
};

export function BKeeprLogo({ showName = true, className }: BKeeprLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/bkeepr-logo.svg"
        alt={`${BRANDING.appName} Logo`}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0"
        priority
      />
      {showName && (
        <div className="min-w-0">
          <span className="block text-nowrap font-semibold">{BRANDING.appName}</span>
          <span className="hidden text-xs text-muted-foreground lg:block">
            {BRANDING.tagline}
          </span>
        </div>
      )}
    </div>
  );
}
