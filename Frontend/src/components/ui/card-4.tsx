import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

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
      className={`max-w-md border border-border/60 bg-[var(--color-surface-2)] p-2 shadow-xs transition-all hover:shadow-md hover:scale-[1.01] duration-300 ${
        className ?? ""
      }`}
    >
      <CardHeader className="space-y-1 px-4 pb-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
          {badge}
        </div>
        <CardDescription className="max-w-sm text-xs leading-normal text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      </CardContent>
    </Card>
  );
}
