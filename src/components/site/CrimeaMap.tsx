"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapObject {
  name: string;
  type: string;
  loc: string;
  img: string;
  price: string;
  tags?: string[];
  area?: string;
}

interface CrimeaMapProps {
  objects: MapObject[];
  onSelect?: (name: string) => void;
}

/* Координаты — доли РЕНДЕРА карты (1672×941), в % от картинки.
   Карта рендерится в своём соотношении без обрезки (см. aspect-box ниже),
   поэтому точки всегда садятся в одно и то же место на любом экране.
   up: подпись над точкой (чтобы соседние не сливались). */
const COORDS: Record<string, { x: number; y: number; label: string; up?: boolean }> = {
  МЕДДИРТ: { x: 26, y: 46, label: "Саки", up: true }, // Саки — рядом с Птицей (подпись вверх)
  ПТИЦА: { x: 30, y: 50, label: "Саки" }, // Саки — рядом, ниже-правее, подпись вниз
  ОЛИМПИЯ: { x: 44, y: 41, label: "Симферополь", up: true }, // центр полуострова, подпись вверх
  САНТЕРРА: { x: 54, y: 53, label: "с. Весёлое" }, // южный берег
  SKYSOUL: { x: 64, y: 51, label: "Коктебель", up: true }, // юго-восток, подпись вверх
};

export function CrimeaMap({ objects, onSelect }: CrimeaMapProps) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-sky-50 to-white">
      {/* заголовок над картой — только на мобиле */}
      <div className="px-5 pb-2 pt-6 md:hidden">
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-brand-blue/55">Интерактивная карта</p>
        <h3 className="mt-2 font-display text-[clamp(26px,7.5vw,40px)] font-extrabold uppercase leading-[0.9] text-foreground">
          Проекты на карте Крыма
        </h3>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground">
          Нажмите на точку — откроется проект с фото и деталями.
        </p>
      </div>

      {/* aspect-box: картинка и точки в одной системе координат — карта НЕ обрезается */}
      <div className="relative w-full" style={{ aspectRatio: "1672 / 941" }}>
        <img src="assets/generated/crimea-map.png" alt="Карта Крыма" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,76,129,0.05)_1px,transparent_1px),linear-gradient(rgba(15,76,129,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
        {/* белый scrim под заголовок — только на десктопе */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/92 via-white/25 to-transparent md:block" />

        {/* заголовок поверх карты — только на десктопе */}
        <div className="absolute left-10 top-10 z-10 hidden max-w-lg md:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-blue/55">Интерактивная карта</p>
          <h3 className="mt-3 font-display text-[clamp(34px,4vw,64px)] font-extrabold uppercase leading-[0.86] text-foreground">
            Проекты на карте Крыма
          </h3>
          <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">
            Нажмите на точку — откроется проект с фото, деталями и переходом на сайт.
          </p>
        </div>

        {objects.map((o, i) => {
          const c = COORDS[o.name] ?? { x: 50, y: 50, label: o.loc };
          const isActive = hover === i;
          return (
            <button
              key={o.name}
              onClick={() => onSelect?.(o.name)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              aria-label={`${o.name} · ${c.label}`}
            >
              <span className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/20", isActive ? "h-14 w-14 animate-ping" : "h-0 w-0")} />
              <span
                className={cn(
                  "relative grid place-items-center rounded-full border-2 border-white text-white shadow-[0_10px_30px_rgba(15,76,129,0.45)] transition-all duration-300",
                  isActive ? "h-9 w-9 scale-110 bg-brand-blue md:h-12 md:w-12" : "h-7 w-7 bg-brand-blue/90 group-hover:scale-110 md:h-10 md:w-10"
                )}
              >
                <MapPin className="h-3.5 w-3.5 md:h-5 md:w-5" />
              </span>
              <span
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 inline-flex items-baseline gap-1 whitespace-nowrap rounded-full bg-white px-2 py-1 shadow-lg md:gap-1.5 md:px-3 md:py-1.5",
                  c.up ? "bottom-full mb-2" : "top-full mt-2"
                )}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-brand-blue md:text-[12px] md:tracking-[0.12em]">{o.name}</span>
                <span className="hidden text-[9px] font-semibold uppercase tracking-wide text-brand-blue/45 sm:inline">{c.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
