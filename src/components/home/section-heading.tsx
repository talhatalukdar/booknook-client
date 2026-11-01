import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  text,
  className,
  light,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <p className={cn("eyebrow mb-3", light && "!text-teal")}>{eyebrow}</p>}
      <h2 className={cn("section-title", light && "text-canvas [&_em]:!text-teal")}>{title}</h2>
      {text && <p className={cn("mt-4 text-lg", light ? "text-canvas/70" : "text-muted")}>{text}</p>}
    </div>
  );
}
