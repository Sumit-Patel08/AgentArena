import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { ArrowUpRight } from "lucide-react";

export interface Card4Props {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function Card4({
  title,
  description,
  imageSrc,
  imageAlt = title,
  badge,
  className,
}: Card4Props) {
  return (
    <Card
      className={`group max-w-md overflow-hidden border border-border/60 bg-[var(--color-surface-2)] p-2 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        className ?? ""
      }`}
    >
      <div className="relative overflow-hidden rounded-xl aspect-[16/10] w-full bg-muted">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-2)]/60 to-transparent opacity-80" />
      </div>
      <CardHeader className="space-y-2 px-3 pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
            <span>{title}</span>
            <ArrowUpRight className="size-4 shrink-0 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-primary" />
          </CardTitle>
          {badge}
        </div>
        <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
