import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteLogo({
  className,
  size = 36,
  withWordmark = true,
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img
        src={siteConfig.logo}
        alt={`Logo ${siteConfig.name}`}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-xl bg-card object-contain p-0.5 ring-1 ring-border dark:bg-foreground/5"
      />
      {withWordmark && (
        <span className="font-display text-lg font-bold text-foreground">{siteConfig.name}</span>
      )}
    </span>
  );
}
