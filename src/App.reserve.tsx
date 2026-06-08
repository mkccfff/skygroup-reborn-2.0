"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
  type Variants,
} from "framer-motion";
import Lenis from "lenis";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Phone,
  Send,
  X,
  Check,
  Menu,
  Landmark,
  Ruler,
  Building2,
  Hotel,
  Waves,
  Stethoscope,
  UtensilsCrossed,
  Sun,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CrimeaMap } from "@/components/site/CrimeaMap";
import { Building3D } from "@/components/site/Building3D";

/* mounts heavy WebGL child only when near viewport */
function LazyMount({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(e.isIntersecting), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {show && children}
    </div>
  );
}

/* ============================================================
   DATA
   ============================================================ */
interface ProjectObj {
  name: string;
  type: string;
  loc: string;
  img: string;
  tags: string[];
  price: string;
  desc: string;
  area: string;
  units: string;
}

const OBJECTS: ProjectObj[] = [
  {
    name: "SKYSOUL",
    type: "Туристическо-рекреационный комплекс",
    loc: "Коктебель",
    img: "/assets/skysoul.jpg",
    tags: ["Первая линия", "СПА", "Набережная"],
    price: "от 180 000 ₽/м²",
    desc: "Курортный комплекс премиум-класса с панорамными видами на бухту Коктебеля и собственной набережной у подножия Кара-Дага. Плавные линии и террасы, обращённые к морю.",
    area: "86 000 м²",
    units: "640 резиденций",
  },
  {
    name: "САНТЕРРА",
    type: "Резиденции премиум-класса",
    loc: "с. Весёлое",
    img: "/assets/santerra.jpg",
    tags: ["Первая линия", "Террасы", "Бассейны"],
    price: "от 320 000 ₽/м²",
    desc: "Флагман: курватурные башни с террасами, приватные бассейны между корпусами и прямой выход к морю. Эталон премиальной курортной жизни на Южном берегу.",
    area: "124 000 м²",
    units: "880 резиденций",
  },
  {
    name: "ПТИЦА",
    type: "Курортно-оздоровительный комплекс",
    loc: "Саки",
    img: "/assets/ptica.jpg",
    tags: ["Санаторий", "Бальнеология", "Первая линия"],
    price: "от 205 000 ₽/м²",
    desc: "Оздоровительный курорт с собственным бальнеологическим санаторием на первой линии у моря. Медицина, СПА и грязелечение мирового уровня в сочетании с премиальным жильём.",
    area: "72 000 м²",
    units: "санаторий + резиденции",
  },
  {
    name: "ОЛИМПИЯ",
    type: "Премиум-квартал «Жигулина Роща»",
    loc: "Симферополь",
    img: "/assets/olympia.jpg",
    tags: ["Наследие", "Архитектура", "Приватность"],
    price: "по запросу",
    desc: "Достойное наследие на поколения: премиум-квартал с монументальной архитектурой, приватной средой и продуманным благоустройством в сердце полуострова.",
    area: "78 000 м²",
    units: "премиум-квартал",
  },
  {
    name: "МЕДДИРТ",
    type: "Семейный кластер комфорт-класса",
    loc: "Саки",
    img: "/assets/meddirt.jpg",
    tags: ["Для семьи", "Зелёные дворы", "Школа рядом"],
    price: "от 120 000 ₽/м²",
    desc: "Уютный приморский квартал для семейной жизни и отдыха: дворы без машин, детская и спортивная инфраструктура, шаговая доступность моря и лечебных грязей Сакского озера.",
    area: "64 000 м²",
    units: "1 200 квартир",
  },
];

const NAV = [
  { label: "Проекты", href: "#projects" },
  { label: "О компании", href: "#about" },
  { label: "Команда", href: "#team" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contacts" },
];

const ADVANTAGES = [
  {
    t: "Полный цикл девелопмента",
    d: "Собственная генподрядная организация «Интеграл» — от земли и проектирования до строительства и эксплуатации в одних руках.",
  },
  {
    t: "Собственный отельный оператор",
    d: "SKYSOUL HOTEL GROUP — сервис уровня пять звёзд и доходность для собственников недвижимости круглый год.",
  },
  {
    t: "Гармония с природой",
    d: "Осознанное облагораживание территорий: море, горы и зелень становятся частью архитектуры каждого проекта.",
  },
  {
    t: "Медицина и оздоровление",
    d: "Бальнеология и санатории на базе уникальных природных ресурсов Крыма — здоровье как часть курортной среды.",
  },
  {
    t: "Архитектура будущего",
    d: "Современные формы, террасы, свет, воздух и технологии проектируются так, чтобы объекты не устаревали визуально и функционально.",
  },
  {
    t: "Инвестиционная логика",
    d: "Каждый проект рассматривается как долгосрочный актив: локация, сервис, номерной фонд и спрос складываются в понятную экономику.",
  },
];

const TEAM = [
  { name: "Алексей Шацких", role: "Вице-президент группы компаний", img: "/assets/team/shatskih.jpg" },
  { name: "Каринэ Шацких", role: "Коммерческий директор", img: "/assets/team/karine.jpg" },
  { name: "Ирина Смирнова", role: "Заместитель директора", img: "/assets/team/smirnova.jpg" },
  { name: "Сергей Киселев", role: "Директор отельного оператора", img: "/assets/team/kiselev.jpg" },
  { name: "Алексей Лысаков", role: "Директор по строительству", img: "/assets/team/lysakov.jpg" },
  { name: "Евгений Еременко", role: "Директор ИТ и защиты информации", img: "/assets/team/eremenko.jpg" },
  { name: "Елена Сухорукова", role: "Директор по персоналу", img: "/assets/team/suhorukova.jpg" },
  { name: "Ширак Багдасарян", role: "Директор по безопасности", img: "/assets/team/bagdasaryan.jpg" },
];

const NEWS = [
  {
    tag: "Строительство",
    date: "12 мая 2026",
    title: "Сантерра: завершён монолит второй башни",
    excerpt: "Флагманский проект идёт с опережением графика — приступаем к остеклению и фасадным работам.",
    img: "/assets/santerra.jpg",
  },
  {
    tag: "Награды",
    date: "28 апреля 2026",
    title: "SKYSOUL — «Курортный проект года»",
    excerpt: "Проект отмечен отраслевой премией за вклад в развитие курортной инфраструктуры Крыма.",
    img: "/assets/skysoul.jpg",
  },
  {
    tag: "Продажи",
    date: "15 апреля 2026",
    title: "Старт продаж нового квартала Меддирт",
    excerpt: "Открыто бронирование квартир в новой очереди семейного кластера у моря на стартовых условиях.",
    img: "/assets/meddirt.jpg",
  },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;
const ru = (n: number) => Math.round(n).toLocaleString("ru-RU");
const initials = (n: string) =>
  n.split(" ").map((p) => p[0]).join("").slice(0, 2);

/* ============================================================
   PRIMITIVES
   ============================================================ */
function Eyebrow({
  children,
  light,
  center,
  className,
}: {
  children: React.ReactNode;
  light?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.34em]",
        light ? "text-white/75" : "text-brand-blue/70",
        center && "justify-center",
        className
      )}
    >
      <span
        className={cn(
          "h-px w-10",
          light ? "bg-white/50" : "bg-gradient-to-r from-brand-blue to-brand-teal"
        )}
      />
      {children}
    </span>
  );
}

function Reveal({
  children,
  y = 28,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  y?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ to, format }: { to: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1700;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{format ? format(val) : Math.round(val).toString()}</span>;
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar({ onCta }: { onCta: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      className={cn(
        "fixed inset-x-0 top-0 z-[200] transition-all duration-500",
        scrolled
          ? "border-b border-brand-blue/10 bg-white/85 backdrop-blur-xl shadow-[0_6px_30px_-16px_rgba(15,76,129,0.3)]"
          : "bg-gradient-to-b from-black/30 to-transparent"
      )}
    >
      <div className="relative mx-auto flex h-[70px] max-w-[1360px] items-center px-5 md:px-8">
        <a href="#top" className="flex shrink-0 items-baseline gap-1.5 font-display leading-none">
          <span
            className={cn(
              "text-[16px] font-extrabold tracking-tight transition-colors md:text-[18px]",
              scrolled ? "text-brand-blue" : "text-white"
            )}
          >
            СКАЙГРУПП
          </span>
          <span
            className={cn(
              "text-[16px] font-semibold tracking-tight transition-colors md:text-[18px]",
              scrolled ? "text-foreground/45" : "text-white/55"
            )}
          >
            ДЕВЕЛОПМЕНТ
          </span>
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={cn(
                "relative text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-brand-blue after:to-brand-teal after:transition-transform after:duration-300 hover:after:scale-x-100",
                scrolled ? "text-foreground/70 hover:text-brand-blue" : "text-white/80 hover:text-white"
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <a
            href="tel:+79180293999"
            className={cn(
              "hidden text-[13px] font-semibold tracking-wide transition-colors xl:block",
              scrolled ? "text-foreground/70 hover:text-brand-blue" : "text-white/85 hover:text-white"
            )}
          >
            +7 (918) 029-39-99
          </a>
          <button
            onClick={onCta}
            className={cn(
              "hidden h-10 items-center rounded-full px-5 text-[12px] font-bold uppercase tracking-[0.12em] transition-all sm:inline-flex",
              scrolled ? "bg-brand-blue text-white hover:bg-brand-teal" : "bg-white text-brand-blue hover:bg-sky-50"
            )}
          >
            Связаться
          </button>
          <button
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border transition-colors lg:hidden",
              scrolled ? "border-brand-blue/15 text-brand-blue" : "border-white/30 text-white"
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-brand-blue/10 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground/75 transition-colors hover:bg-brand-blue/5 hover:text-brand-blue"
                >
                  {n.label}
                </a>
              ))}
              <a href="tel:+79180293999" className="mt-1 rounded-xl bg-brand-blue px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-white">
                +7 (918) 029-39-99
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ============================================================
   HERO — scroll-scrubbed video (the building constructs as you scroll)
   ============================================================ */
const heroWord: Variants = {
  hidden: { opacity: 0, y: "110%" },
  show: (i: number) => ({
    opacity: 1,
    y: "0%",
    transition: { duration: 1, delay: 0.45 + i * 0.13, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Hero({ onCta }: { onCta: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} id="top" className="relative h-screen min-h-[640px] w-full overflow-hidden bg-brand-ink">
      <motion.div style={{ scale: videoScale }} className="absolute inset-0 origin-center">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/hero.jpg"
        >
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-ink/85 via-brand-ink/35 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-transparent to-brand-ink/40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-blue/45 via-transparent to-brand-teal/25 mix-blend-multiply" />
      </motion.div>

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col justify-end px-6 pb-[16vh] md:px-10"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <Eyebrow light>Девелопер будущего · Крым</Eyebrow>
          </motion.div>

          <h1 className="mt-6 font-display font-extrabold uppercase leading-[0.95] tracking-tight">
            <span className="block overflow-hidden pt-[0.18em]">
              <motion.span custom={0} variants={heroWord} initial="hidden" animate="show" className="block pb-[0.04em] text-white text-[clamp(44px,10vw,140px)] drop-shadow-[0_6px_40px_rgba(13,17,23,0.5)]">
                СКАЙГРУПП
              </motion.span>
            </span>
            <span className="block overflow-hidden pt-[0.12em]">
              <motion.span custom={1} variants={heroWord} initial="hidden" animate="show" className="block pb-[0.06em] bg-gradient-to-r from-white via-sky-200 to-brand-teal/80 bg-clip-text text-transparent text-[clamp(26px,5.6vw,82px)]">
                ДЕВЕЛОПМЕНТ
              </motion.span>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95 }} className="mt-7 max-w-lg text-[15px] font-medium leading-relaxed text-white/80 md:text-[17px]">
            Создаём знаковые курортные проекты Крыма — премиальную недвижимость у моря,
            в которой хочется жить. <span className="text-sky-200">Сильные проекты — для сильной страны.</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.1 }} className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-blue shadow-[0_14px_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:bg-sky-50"
            >
              Смотреть проекты
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity: cueOpacity }} className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-white/55">Листайте</span>
          <span className="relative h-12 w-px overflow-hidden bg-white/20">
            <motion.span animate={{ y: ["-100%", "120%"] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent to-white" />
          </span>
        </motion.div>
    </section>
  );
}

/* ============================================================
   MARQUEE
   ============================================================ */
function Marquee() {
  const items = ["SKYSOUL", "САНТЕРРА", "ПТИЦА", "ОЛИМПИЯ", "МЕДДИРТ"];
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="max-w-full overflow-hidden border-y border-brand-blue/10 bg-white py-6">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-xl font-bold uppercase tracking-tight text-brand-blue/25">
            {t}
            <span className="text-brand-teal/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PROJECTS — pinned scroll storytelling (no slider)
   ============================================================ */
function Projects({ onOpen }: { onOpen: (name: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(OBJECTS.length - 1, Math.floor(v * OBJECTS.length));
    setIdx(i);
  });
  const cur = OBJECTS[idx];

  // навигация по витрине: клик переключает на проект (без поп-апа)
  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const n = OBJECTS.length;
    const y = el.offsetTop + ((i + 0.5) / n) * (el.offsetHeight - window.innerHeight);
    setIdx(i);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section id="projects" ref={ref} style={{ height: `${OBJECTS.length * 100}vh` }} className="relative bg-brand-ink">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={cur.img}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute inset-0"
          >
            <img src={cur.img} alt={cur.name} className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/55 to-brand-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/80 to-transparent" />

        <div className="absolute left-6 top-[14vh] z-10 md:left-10">
          <Eyebrow light>Портфель проектов</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(30px,5vw,64px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white">
            Наши проекты
          </h2>
        </div>

        <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-4 md:right-10 md:flex">
          {OBJECTS.map((o, i) => (
            <button
              key={o.name}
              onClick={() => goTo(i)}
              className={cn(
                "flex items-center gap-3 text-right font-display text-sm font-bold uppercase tracking-wide transition-all",
                i === idx ? "text-white" : "text-white/35 hover:text-white/70"
              )}
            >
              {o.name}
              <span className={cn("text-[11px] tabular-nums", i === idx ? "text-sky-300" : "text-white/30")}>0{i + 1}</span>
              <span className={cn("h-px transition-all", i === idx ? "w-10 bg-sky-300" : "w-4 bg-white/30")} />
            </button>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[10vh] md:px-10">
          <div className="mx-auto max-w-[1360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={cur.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="max-w-2xl"
              >
                <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-sky-300">
                  <MapPin className="h-4 w-4" /> {cur.loc}
                </p>
                <h3 className="mt-3 font-display text-[clamp(40px,8vw,110px)] font-extrabold uppercase leading-[0.85] tracking-tight text-white">
                  {cur.name}
                </h3>
                <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/70">{cur.type}</p>
                <p className="mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-white/80">{cur.desc}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button onClick={() => onOpen(cur.name)} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-blue transition-all hover:bg-sky-50">
                    Открыть проект
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  <span className="font-display text-xl text-white">{cur.price}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-[10vh] right-6 z-10 flex gap-1.5 md:hidden">
          {OBJECTS.map((o, i) => (
            <span key={o.name} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40")} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ABOUT + ADVANTAGES — real building render (parallax)
   ============================================================ */
function AboutStation({
  mv,
  range,
  pos,
  index,
  t,
  d,
}: {
  mv: import("framer-motion").MotionValue<number>;
  range: number[];
  pos: string; // "TL" | "TR" | "BL" | "BR"
  index: number;
  t: string;
  d: string;
}) {
  const isLeft = pos[1] === "L";
  const isTop = pos[0] === "T";
  const opacity = useTransform(mv, range, [0, 1, 1, 0]);
  const x = useTransform(mv, [range[0], range[1]], isLeft ? [-80, 0] : [80, 0]);
  const y = useTransform(mv, [range[0], range[1]], isTop ? [-40, 0] : [40, 0]);
  return (
    <motion.div
      style={{ opacity, x, y }}
      className={cn(
        "absolute z-20 w-[min(380px,calc(100%-2rem))] rounded-2xl border border-brand-blue/10 bg-white/85 p-5 shadow-soft backdrop-blur-xl md:p-6",
        isTop ? "top-[24%] md:top-[22%]" : "bottom-[10%]",
        isLeft ? "left-4 md:left-[6%]" : "right-4 md:right-[6%]"
      )}
    >
      <span className="font-display text-4xl font-extrabold text-brand-blue/15">0{index + 1}</span>
      <h3 className="mt-1 font-display text-lg font-bold uppercase leading-tight tracking-tight text-foreground md:text-xl">{t}</h3>
      <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground md:text-sm">{d}</p>
    </motion.div>
  );
}

// 1 верх-слева, 2 низ-справа, 3 низ-слева, 4 верх-справа, 5 и 6 — продолжая чередование
const ABOUT_POS = ["TL", "BR", "BL", "TR", "TL", "BR"];
const ABOUT_RANGES = [
  [0.02, 0.08, 0.15, 0.2],
  [0.18, 0.25, 0.32, 0.38],
  [0.36, 0.43, 0.5, 0.56],
  [0.54, 0.61, 0.68, 0.74],
  [0.72, 0.79, 0.86, 0.92],
  [0.88, 0.93, 0.98, 1.0],
];

function AboutAdvantages() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetT = useRef(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetT.current = v;
  });
  // scroll-scrub: один проход по блоку = один полный оборот здания
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    let raf = 0;
    const tick = () => {
      if (vid.duration && vid.readyState >= 2) {
        const want = Math.min(targetT.current, 1) * (vid.duration - 0.05);
        if (Math.abs(want - vid.currentTime) > 1 / 60) {
          try {
            vid.currentTime = want;
          } catch {
            /* seeking */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="about" ref={ref} className="relative h-[440vh] bg-brand-ink">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* full-screen building video, scrubbed by scroll */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          poster="/assets/hero.jpg"
        >
          <source src="/assets/about-building.mp4" type="video/mp4" />
        </video>
        {/* legibility scrims */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-ink/75 via-brand-ink/10 to-brand-ink/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-blue/30 via-transparent to-brand-teal/15 mix-blend-multiply" />

        {/* heading */}
        <div className="absolute left-1/2 top-[9%] z-20 -translate-x-1/2 px-6 text-center">
          <Reveal><Eyebrow center light>О компании</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-display text-[clamp(30px,5vw,64px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_26px_rgba(13,17,23,0.65)]">
              Строим Крым{" "}
              <span className="bg-gradient-to-r from-white via-sky-200 to-brand-teal/80 bg-clip-text text-transparent">будущего</span>
            </h2>
          </Reveal>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
            Листайте — здание поворачивается
          </p>
        </div>

        {/* flying advantage stations */}
        {ADVANTAGES.map((a, i) => (
          <AboutStation
            key={a.t}
            mv={scrollYProgress}
            range={ABOUT_RANGES[i]}
            pos={ABOUT_POS[i]}
            index={i}
            t={a.t}
            d={a.d}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   METRICS + INTERACTIVE CHART
   ============================================================ */
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const SERIES = {
  price: {
    label: "Цена за м²",
    data: [95000, 112000, 138000, 165000, 198000, 232000, 255000],
    fmt: (v: number) => ru(v) + " ₽",
  },
  demand: {
    label: "Сделок в месяц",
    data: [42, 49, 61, 78, 96, 118, 140],
    fmt: (v: number) => ru(v),
  },
};
type SeriesKey = keyof typeof SERIES;

function InteractiveChart() {
  const [key, setKey] = useState<SeriesKey>("price");
  const [active, setActive] = useState(YEARS.length - 1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-60px" });

  const W = 720, H = 300, padL = 16, padR = 16, padT = 24, padB = 36;
  const series = SERIES[key];
  const dmin = Math.min(...series.data);
  const dmax = Math.max(...series.data);
  const min = dmin - (dmax - dmin) * 0.18;
  const max = dmax + (dmax - dmin) * 0.12;
  const X = (i: number) => padL + (i * (W - padL - padR)) / (YEARS.length - 1);
  const Y = (v: number) => H - padB - ((v - min) / (max - min)) * (H - padT - padB);
  const lineD = series.data.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
  const areaD = `${lineD} L${X(YEARS.length - 1)},${H - padB} L${X(0)},${H - padB} Z`;

  const pick = (clientX: number, el: SVGRectElement) => {
    const rect = el.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    let nearest = 0, dm = Infinity;
    for (let i = 0; i < YEARS.length; i++) {
      const d = Math.abs(X(i) - px);
      if (d < dm) { dm = d; nearest = i; }
    }
    setActive(nearest);
  };

  const growth = Math.round(((series.data[active] - series.data[0]) / series.data[0]) * 100);

  return (
    <div ref={wrapRef} className="relative">
      {/* big live readout */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {series.label} · {YEARS[active]}
          </div>
          <div className="mt-1 font-display text-[clamp(34px,5vw,56px)] font-extrabold leading-none text-brand-blue tabular-nums">
            {series.fmt(series.data[active])}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-1 text-[12px] font-bold text-brand-teal">
            ▲ +{growth}% <span className="font-medium text-muted-foreground">с 2019</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(Object.keys(SERIES) as SeriesKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={cn(
                "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
                key === k ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/25" : "bg-brand-blue/8 text-brand-blue hover:bg-brand-blue/15"
              )}
            >
              {SERIES[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative touch-none">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none">
          <defs>
            <linearGradient id="cline" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0F4C81" />
              <stop offset="100%" stopColor="#185B69" />
            </linearGradient>
            <linearGradient id="carea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F4C81" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0F4C81" stopOpacity="0" />
            </linearGradient>
          </defs>

          <motion.path key={`area-${key}`} d={areaD} fill="url(#carea)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1, delay: 0.3 }} />
          <motion.path key={`line-${key}`} d={lineD} fill="none" stroke="url(#cline)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.5, ease: EASE }} />

          {/* active guideline */}
          <line x1={X(active)} y1={padT - 8} x2={X(active)} y2={H - padB} stroke="rgba(15,76,129,0.3)" strokeDasharray="4 4" />

          {/* points */}
          {series.data.map((v, i) => (
            <circle key={i} cx={X(i)} cy={Y(v)} r={active === i ? 8 : 4.5} fill={active === i ? "#0F4C81" : "#fff"} stroke="#0F4C81" strokeWidth="3" style={{ transition: "r .15s, fill .15s" }} />
          ))}

          {/* year labels */}
          {YEARS.map((yr, i) => (
            <text key={yr} x={X(i)} y={H - padB + 24} textAnchor="middle" className={cn(active === i ? "fill-brand-blue" : "fill-[#8a96a6]")} style={{ fontSize: 12, fontWeight: active === i ? 800 : 500 }}>{yr}</text>
          ))}

          <rect
            x={0} y={0} width={W} height={H} fill="transparent"
            style={{ cursor: "ew-resize" }}
            onMouseMove={(e) => pick(e.clientX, e.currentTarget)}
            onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
            onPointerMove={(e) => { if (e.buttons) pick(e.clientX, e.currentTarget); }}
          />
        </svg>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-muted-foreground">
        Ведите по графику или тяните — данные обновляются. Переключайте показатель кнопками.
      </p>
    </div>
  );
}

function Metrics() {
  return (
    <section className="bg-gradient-to-b from-white to-sky-50/50 py-24 md:py-28">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="grid items-center gap-10 rounded-3xl border border-brand-blue/10 bg-white p-7 shadow-glow md:grid-cols-[0.85fr_1.15fr] md:p-12">
          <div>
            <Eyebrow>Динамика рынка</Eyebrow>
            <h3 className="mt-5 font-display text-[clamp(26px,3vw,42px)] font-extrabold leading-tight tracking-tight text-foreground">
              Цена м² выросла в <span className="grad-text">2,7 раза</span> с 2019 года
            </h3>
            <p className="mt-4 max-w-md text-sm font-medium text-muted-foreground">
              Курортная недвижимость Крыма стабильно дорожает. Инвестируя сегодня, вы
              фиксируете цену завтрашнего дня. Исследуйте динамику — наведите на график.
            </p>
          </div>
          <InteractiveChart />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MAP
   ============================================================ */
function MapSection({ onOpen }: { onOpen: (name: string) => void }) {
  return (
    <section id="map" className="relative overflow-hidden bg-white py-10 md:py-16">
      <div className="relative mx-auto max-w-[1680px] px-0 md:px-8">
        <div className="sr-only">
          <Reveal><Eyebrow>География проектов</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
              Лучшие локации Крыма
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[15px] font-medium text-muted-foreground">
              Наведите на точку — подсветится проект. Нажмите, чтобы открыть детали.
            </p>
          </Reveal>
        </div>
        <CrimeaMap objects={OBJECTS} onSelect={onOpen} />
      </div>
    </section>
  );
}

/* ============================================================
   DIRECTOR
   ============================================================ */
function DirectorSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue to-brand-teal py-24 text-white md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1360px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[0.75fr_1.25fr]">
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <img src="/assets/team/shatskih.jpg" alt="Алексей Шацких" className="absolute inset-0 h-full w-full object-cover object-top" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/30 to-transparent p-6">
              <p className="font-display text-xl font-extrabold">Алексей Шацких</p>
              <p className="text-sm text-white/80">Вице-президент наблюдательного совета</p>
            </div>
          </div>
        </Reveal>
        <div>
          <Reveal><Eyebrow light>Слово руководителя</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <blockquote className="mt-6 font-display text-[clamp(22px,2.8vw,42px)] font-extrabold leading-[1.12] tracking-tight">
              «Мы создаём пространства, где архитектура и природа существуют в&nbsp;гармонии,
              а&nbsp;комфорт сочетается с&nbsp;высоким качеством жизни».
            </blockquote>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-[15px] font-medium leading-relaxed text-white/80">
              Потомственный девелопер, амбициозный лидер и новатор. Под его руководством
              компания формирует экосистему развития курортной среды на юге России —
              от проектирования и строительства до управления гостеприимством.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TEAM
   ============================================================ */
function Team() {
  return (
    <section id="team" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <Reveal><Eyebrow>Команда</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
              Люди, которые строят будущее
            </h2>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.06}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal">
                  <img
                    src={m.img}
                    alt={m.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top grayscale-[20%] transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-ink/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold tracking-tight text-foreground">{m.name}</h3>
                <p className="mt-1 text-[13px] font-medium leading-snug text-muted-foreground">{m.role}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   NEWS
   ============================================================ */
function News() {
  return (
    <section id="news" className="bg-gradient-to-b from-sky-50/50 to-white py-24 md:py-32">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-12">
          <Reveal><Eyebrow>Медиа</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
              Новости компании
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {NEWS.map((n, i) => (
            <Reveal key={n.title} delay={i * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-blue/10 bg-white transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={n.img} alt={n.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-brand-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{n.tag}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{n.date}</span>
                  <h3 className="mt-3 font-display text-lg font-bold leading-tight tracking-tight text-foreground">{n.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{n.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                    Читать <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA
   ============================================================ */
function CTASection() {
  const [sent, setSent] = useState(false);
  const [project, setProject] = useState(OBJECTS[0].name);
  return (
    <section id="contacts" className="relative overflow-hidden bg-sky-50/60 py-24 md:py-32">
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-brand-blue/20 blur-3xl" />
      <motion.div animate={{ x: [0, -50, 0], y: [0, 40, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-teal/20 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-[1360px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal><Eyebrow>Свяжитесь с нами</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-6 font-display text-[clamp(40px,6.5vw,96px)] font-extrabold uppercase leading-[0.9] tracking-tight text-foreground">
              Выберите свой <br /><span className="grad-text">дом у моря</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-md text-[16px] font-medium leading-relaxed text-muted-foreground">
              Оставьте заявку — подберём объект под ваши задачи: для жизни или инвестиций.
              Расскажем о проектах, ценах и условиях покупки.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <a href="tel:+79180293999" className="mt-8 inline-flex items-center gap-3 font-display text-2xl text-brand-blue transition-opacity hover:opacity-80">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-blue/10 text-brand-blue"><Phone className="h-5 w-5" /></span>
              +7 (918) 029-39-99
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div className="glass rounded-3xl p-7 shadow-soft md:p-9">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-10 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-blue text-white"><Check className="h-8 w-8" /></span>
                  <h3 className="font-display text-2xl font-extrabold text-foreground">Заявка отправлена</h3>
                  <p className="max-w-xs text-sm text-muted-foreground">Спасибо! Менеджер СКАЙГРУПП свяжется с вами в ближайшее время.</p>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-4">
                  <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-foreground">Оставить заявку</h3>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ваше имя</label>
                    <input required type="text" placeholder="Иван Иванов" className="w-full rounded-xl border border-brand-blue/15 bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Телефон</label>
                    <input required type="tel" placeholder="+7 (___) ___-__-__" className="w-full rounded-xl border border-brand-blue/15 bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Интересующий проект</label>
                    <select value={project} onChange={(e) => setProject(e.target.value)} className="w-full rounded-xl border border-brand-blue/15 bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-brand-blue">
                      {OBJECTS.map((o) => <option key={o.name} value={o.name}>{o.name} — {o.loc}</option>)}
                      <option value="Любой">Ещё не выбрал(а)</option>
                    </select>
                  </div>
                  <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-teal">
                    Отправить заявку <Send className="h-4 w-4" />
                  </button>
                  <p className="text-center text-[11px] text-muted-foreground">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer className="bg-brand-ink px-6 pb-10 pt-20 text-white/60 md:px-10">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-10 border-b border-white/10 pb-14 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-baseline gap-1.5 font-display">
              <span className="text-[18px] font-extrabold tracking-tight text-white">СКАЙГРУПП</span>
              <span className="text-[18px] font-semibold tracking-tight text-white/50">ДЕВЕЛОПМЕНТ</span>
            </div>
            <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-white/55">
              Сильные проекты — для сильной страны. Ведущий девелопер курортной недвижимости Крыма.
            </p>
          </div>
          <div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">Проекты</h4>
            <ul className="space-y-3 text-sm font-medium">
              {OBJECTS.map((o) => <li key={o.name}><a href="#projects" className="opacity-70 transition-opacity hover:opacity-100">{o.name}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">Компания</h4>
            <ul className="space-y-3 text-sm font-medium opacity-70">
              <li><a href="#about" className="hover:opacity-100">О компании</a></li>
              <li><a href="#map" className="hover:opacity-100">Карта объектов</a></li>
              <li><a href="#team" className="hover:opacity-100">Команда</a></li>
              <li><a href="#news" className="hover:opacity-100">Новости</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">Контакты</h4>
            <a href="tel:+79180293999" className="font-display text-xl text-white transition-opacity hover:opacity-80">+7 (918) 029-39-99</a>
            <p className="mt-2 text-sm font-medium text-white/55">Республика Крым · pr@skygk.ru</p>
            <a href="https://t.me/skygroupdevelop" target="_blank" rel="noopener noreferrer" className="mt-5 inline-grid h-11 w-11 place-items-center rounded-full border border-white/25 transition-all hover:-translate-y-1 hover:bg-white hover:text-brand-blue" aria-label="Telegram">
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 pt-7 text-xs text-white/45 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Скайгрупп Девелопмент. Все права защищены.</span>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="hover:text-white">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white">Правовая информация</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   PROJECT MODAL
   ============================================================ */
function ObjectModal({ obj, onClose, onRequest }: { obj: ProjectObj | null; onClose: () => void; onRequest: () => void; }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (obj) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [obj, onClose]);

  return (
    <AnimatePresence>
      {obj && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center bg-brand-ink/50 p-4 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }} transition={{ duration: 0.4, ease: EASE }} onClick={(e) => e.stopPropagation()} className="relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
            <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-brand-ink shadow-md transition-colors hover:bg-brand-blue hover:text-white" aria-label="Закрыть"><X className="h-5 w-5" /></button>
            <div className="relative h-56 md:h-auto">
              <img src={obj.img} alt={obj.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/50 to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-5 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-white"><MapPin className="h-4 w-4" />{obj.loc}</div>
            </div>
            <div className="flex flex-col overflow-y-auto p-7 md:p-9">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-teal">{obj.type}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-foreground">{obj.name}</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-foreground/70">{obj.desc}</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-sky-50 p-4"><div className="font-display text-lg text-brand-blue">{obj.area}</div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">площадь</div></div>
                <div className="rounded-2xl bg-sky-50 p-4"><div className="font-display text-lg text-brand-blue">{obj.units}</div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">формат</div></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {obj.tags.map((t) => <span key={t} className="rounded-full border border-brand-blue/15 bg-brand-blue/5 px-3 py-1 text-[11px] font-medium text-brand-blue">{t}</span>)}
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
                <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Стоимость</div><div className="font-display text-xl text-brand-blue">{obj.price}</div></div>
                <div className="flex flex-wrap gap-2">
                  <a href="https://xn--80agrc2afcv.xn--p1ai/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-blue transition-colors hover:bg-sky-50">Перейти на сайт <ArrowUpRight className="h-4 w-4" /></a>
                  <button onClick={onRequest} className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-teal">Оставить заявку <ArrowUpRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   DEVELOPER INTRO (right after hero) — mission + key figures
   ============================================================ */
const DEV_STATS = [
  { to: 324000, suff: "+", l: "м² введено в эксплуатацию" },
  { to: 265788, suff: "", l: "м² на стадии строительства" },
  { to: 278, suff: " Га", l: "собственный банк земли" },
  { to: 16000, suff: "", l: "ед. номерного фонда к 2030" },
];

function DeveloperIntro() {
  return (
    <section id="developer" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-10 h-[60vh] w-[60vh] rounded-full bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10">
        {/* thumbnail strip */}
        <Reveal>
          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {["g6", "g2", "g4", "g3"].map((g) => (
              <div key={g} className="group aspect-[4/3] overflow-hidden rounded-2xl">
                <img src={`/assets/gallery/${g}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110" />
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Reveal><Eyebrow>О девелопере</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,48px)] font-extrabold uppercase leading-[1.04] tracking-tight text-foreground">
                СКАЙГРУПП ДЕВЕЛОПМЕНТ — <span className="grad-text">ведущий девелопер Крыма</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mt-7 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-teal p-7 text-white shadow-soft md:p-8">
                <p className="text-[15px] font-medium leading-relaxed text-white/90 md:text-[16px]">
                  Наша задача — создавать пространства, где архитектура и природа существуют
                  в гармонии, а комфорт сочетается с высоким качеством жизни и заботой о каждом.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="flex items-center">
            <p className="text-[16px] font-medium leading-relaxed text-muted-foreground md:text-[18px]">
              Каждый наш проект формирует новый образ региона и становится точкой притяжения,
              задающей высокие стандарты. Крым обладает исключительным потенциалом, который важно
              раскрывать бережно и продуманно — с уважением к истории места, людям и ландшафту.
            </p>
          </Reveal>
        </div>

        {/* feature render + key figures */}
        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-2">
          <Reveal className="relative min-h-[340px] overflow-hidden rounded-3xl shadow-soft">
            <img src="/assets/gallery/g7.jpg" alt="Проект СКАЙГРУПП" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Премиум-квартал</p>
              <p className="font-display text-2xl font-extrabold uppercase">Олимпия · Симферополь</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-brand-blue/10 bg-white">
            {DEV_STATS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group h-full border-brand-blue/10 p-7 [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r md:p-8">
                  <div className="flex items-baseline font-display font-extrabold leading-none text-brand-blue">
                    <span className="text-[clamp(26px,3.4vw,44px)] tabular-nums">
                      <Counter to={s.to} format={(n) => ru(n)} />
                    </span>
                    <span className="ml-0.5 text-[clamp(13px,1.6vw,18px)] text-brand-teal">{s.suff}</span>
                  </div>
                  <div className="mt-2 text-[13px] font-medium leading-snug text-muted-foreground">{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PROCESS — full cycle
   ============================================================ */
const PROCESS = [
  { img: "/assets/gallery/g7.jpg", t: "Земельный банк", d: "278 га собственной земли на лучших локациях полуострова — у моря и лечебных источников." },
  { img: "/assets/gallery/g2.jpg", t: "Проектирование", d: "Авторская архитектура и инженерия мирового уровня. Каждый проект рассчитан на поколения." },
  { img: "/assets/gallery/g1.jpg", t: "Строительство", d: "Собственный генподрядчик «Интеграл» — контроль качества и сроков на каждом этапе." },
  { img: "/assets/gallery/g3.jpg", t: "Управление", d: "Отельный оператор SKYSOUL HOTEL GROUP: сервис 5★ и доходность для собственников." },
];

function Process() {
  return (
    <section id="process" className="relative overflow-hidden bg-brand-ink py-24 text-white md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[80vw] -translate-x-1/2 rounded-full bg-brand-blue/25 blur-[120px]" />
      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-14 max-w-2xl">
          <Reveal><Eyebrow light>Девелопмент полного цикла</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white">
              Всё в <span className="grad-text">одних руках</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[15px] font-medium text-white/65">
              От покупки земли до управления готовым курортом — мы контролируем каждый этап,
              поэтому отвечаем за результат целиком.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <motion.article
              key={p.t}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
              className="group relative h-[400px] overflow-hidden rounded-3xl md:h-[440px]"
            >
              <img src={p.img} alt={p.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/35 to-brand-ink/10 transition-colors duration-500 group-hover:from-brand-blue/90" />
              <span className="absolute left-6 top-4 font-display text-[64px] font-extrabold leading-none text-white/25 transition-colors group-hover:text-white/40">0{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white">{p.t}</h3>
                <p className="mt-2 max-h-0 overflow-hidden text-[13px] font-medium leading-relaxed text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100">
                  {p.d}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INFRASTRUCTURE
   ============================================================ */
const INFRA = [
  { img: "/assets/gallery/g6.jpg", icon: Waves, t: "Набережные и пляжи", d: "Благоустроенные пляжи и приморские променады в шаговой доступности." },
  { img: "/assets/gallery/g5.jpg", icon: Stethoscope, t: "Бальнеология и СПА", d: "Санатории и грязелечение на ресурсах Сакских озёр." },
  { img: "/assets/gallery/g3.jpg", icon: Hotel, t: "Отельный сервис 5★", d: "Гостеприимство уровня пятизвёздочного курорта круглый год." },
  { img: "/assets/gallery/g4.jpg", icon: UtensilsCrossed, t: "Рестораны и лаунж", d: "Гастрономия, lounge-зоны и сервис прямо на территории." },
  { img: "/assets/gallery/g8.jpg", icon: Sun, t: "Всесезонность", d: "Комфорт и активности в любое время года." },
  { img: "/assets/gallery/g1.jpg", icon: Building2, t: "Приватная среда", d: "Закрытые территории, благоустройство и безопасность 24/7." },
];

function Infrastructure() {
  return (
    <section id="infrastructure" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <Reveal><Eyebrow>Инфраструктура и сервис</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
              Курорт, а не просто дом
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INFRA.map((it, i) => (
            <motion.article
              key={it.t}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: EASE }}
              className="group relative h-[320px] overflow-hidden rounded-3xl"
            >
              <img src={it.img} alt={it.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/35 to-transparent transition-colors duration-500 group-hover:from-brand-blue/85" />
              <div className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur">
                <it.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white">{it.t}</h3>
                <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/80">{it.d}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   GALLERY — bento of renders
   ============================================================ */
const GALLERY = [
  { src: "/assets/gallery/g1.jpg", cap: "Сантерра · башни у моря", cls: "sm:col-span-2 sm:row-span-2" },
  { src: "/assets/gallery/g6.jpg", cap: "SKYSOUL · Коктебель", cls: "" },
  { src: "/assets/gallery/g5.jpg", cap: "Птица · санаторий", cls: "" },
  { src: "/assets/gallery/g3.jpg", cap: "Сантерра · лаунж-ресторан", cls: "sm:col-span-2" },
  { src: "/assets/gallery/g2.jpg", cap: "Сантерра · скай-вилла", cls: "" },
  { src: "/assets/gallery/g4.jpg", cap: "Сантерра · бассейны", cls: "" },
  { src: "/assets/gallery/g7.jpg", cap: "Олимпия · Симферополь", cls: "" },
  { src: "/assets/gallery/g8.jpg", cap: "Меддирт · Саки", cls: "" },
];

function Gallery() {
  return (
    <section id="gallery" className="bg-gradient-to-b from-sky-50/50 to-white py-24 md:py-32">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal><Eyebrow>Галерея</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
                Атмосфера проектов
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="max-w-xs">
            <p className="text-sm font-medium text-muted-foreground">
              Рендеры будущих курортов СКАЙГРУПП — архитектура, в которой хочется жить.
            </p>
          </Reveal>
        </div>
        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 sm:auto-rows-[230px] lg:grid-cols-4">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={(i % 4) * 0.06} className={cn("group relative overflow-hidden rounded-3xl", g.cls)}>
              <div className="h-full w-full overflow-hidden rounded-3xl">
                <img src={g.src} alt={g.cap} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 translate-y-2 text-[13px] font-bold uppercase tracking-wider text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {g.cap}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   NEW PREMIUM SECTIONS
   ============================================================ */
function DeveloperIntroPremium() {
  return (
    <section id="developer" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,76,129,0.05)_1px,transparent_1px),linear-gradient(rgba(15,76,129,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="pointer-events-none absolute right-[-20%] top-[-12%] h-[720px] w-[720px] rounded-full bg-gradient-to-br from-sky-100 via-white to-brand-teal/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="grid min-h-[78vh] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <Reveal><Eyebrow>О девелопере</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 font-display text-[clamp(40px,7vw,104px)] font-extrabold uppercase leading-[0.84] tracking-tight text-foreground">
                Девелопер будущего <span className="grad-text">для Крыма</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-7 max-w-2xl text-[17px] font-medium leading-relaxed text-muted-foreground md:text-[20px]">
                СКАЙГРУПП ДЕВЕЛОПМЕНТ соединяет землю, архитектуру, строительство,
                сервис и инвестиционную модель в одну понятную систему.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {["Архитектура", "Курорты", "Сервис", "Инвестиции"].map((item) => (
                  <div key={item} className="rounded-2xl border border-brand-blue/10 bg-white/80 px-4 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue shadow-[0_20px_60px_-42px_rgba(15,76,129,0.55)] backdrop-blur">
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <div className="relative">
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand-blue/10 via-sky-100 to-brand-teal/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.25rem] border border-brand-blue/10 bg-white shadow-soft">
                <img src="/assets/gallery/g2.jpg" alt="Архитектурный проект СКАЙГРУПП" className="h-[420px] w-full object-cover md:h-[560px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/20 to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-brand-blue/10 bg-brand-blue/10 sm:grid-cols-4">
          {DEV_STATS.map((s) => (
            <div key={s.l} className="bg-white p-6 md:p-8">
              <div className="flex items-baseline font-display font-extrabold leading-none text-brand-blue">
                <span className="text-[clamp(24px,3vw,42px)] tabular-nums">
                  <Counter to={s.to} format={(n) => ru(n)} />
                </span>
                <span className="ml-0.5 text-[clamp(13px,1.5vw,18px)] text-brand-teal">{s.suff}</span>
              </div>
              <p className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-[0.14em] text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROCESS_PREMIUM = [
  { img: "/assets/gallery/g7.jpg", icon: Landmark, t: "Земля", d: "Собственный банк участков в сильных локациях Крыма: море, лечебные ресурсы, перспективные территории." },
  { img: "/assets/gallery/g2.jpg", icon: Ruler, t: "Концепция", d: "Архитектура, экономика проекта и сценарии жизни собираются до начала стройки, чтобы объект был сильным десятилетиями." },
  { img: "/assets/gallery/g1.jpg", icon: Building2, t: "Стройка", d: "Собственный генподряд и контроль качества: сроки, материалы, инженерия и результат находятся внутри группы." },
  { img: "/assets/gallery/g3.jpg", icon: Hotel, t: "Сервис", d: "SKYSOUL HOTEL GROUP управляет курортной средой, доходностью и уровнем гостеприимства после ввода объекта." },
];

function ProcessPremium() {
  const [active, setActive] = useState(0);
  const activeItem = PROCESS_PREMIUM[active];
  const ActiveIcon = activeItem.icon;

  return (
    <section id="process" className="relative isolate overflow-hidden bg-gradient-to-b from-white via-sky-50/70 to-white py-24 md:py-32">
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Reveal><Eyebrow>Девелопмент полного цикла</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 max-w-2xl font-display text-[clamp(36px,6vw,84px)] font-extrabold uppercase leading-[0.88] tracking-tight text-foreground">
                Всё в одних руках
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="max-w-xl text-[17px] font-medium leading-relaxed text-muted-foreground">
              Это не набор подрядчиков. Это единая вертикаль: от земли и проектирования до эксплуатации
              курортной недвижимости и сервиса для резидентов.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 rounded-[2rem] border border-brand-blue/10 bg-white p-5 shadow-soft md:p-8">
          <div className="relative hidden py-10 lg:block">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-brand-blue/12" />
            <motion.div
              className="absolute left-0 top-1/2 h-px origin-left bg-gradient-to-r from-brand-blue to-brand-teal"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            <div className="relative grid grid-cols-4 gap-4">
              {PROCESS_PREMIUM.map((p, i) => (
                <button
                  key={p.t}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className="group flex flex-col items-center text-center"
                >
                  <span className={cn(
                    "grid h-16 w-16 place-items-center rounded-2xl border bg-white shadow-[0_18px_50px_-34px_rgba(15,76,129,0.7)] transition-all",
                    active === i ? "border-brand-blue text-white [background:linear-gradient(135deg,#0F4C81,#185B69)]" : "border-brand-blue/12 text-brand-blue group-hover:border-brand-blue/35"
                  )}>
                    <p.icon className="h-7 w-7" strokeWidth={1.5} />
                  </span>
                  <span className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/45">0{i + 1}</span>
                  <span className="mt-1 font-display text-xl font-extrabold uppercase text-foreground">{p.t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-3 lg:hidden">
              {PROCESS_PREMIUM.map((p, i) => (
                <button key={p.t} onClick={() => setActive(i)} className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left", active === i ? "border-brand-blue bg-brand-blue text-white" : "border-brand-blue/10 bg-sky-50/60 text-brand-blue")}>
                  <p.icon className="h-6 w-6" />
                  <span className="font-display text-lg font-extrabold uppercase">{p.t}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.t}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-blue to-brand-teal p-7 text-white md:p-9"
              >
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
                <ActiveIcon className="relative h-10 w-10" strokeWidth={1.4} />
                <h3 className="relative mt-8 font-display text-[clamp(30px,4vw,56px)] font-extrabold uppercase leading-none">{activeItem.t}</h3>
                <p className="relative mt-5 max-w-xl text-[16px] font-medium leading-relaxed text-white/78">{activeItem.d}</p>
              </motion.div>
            </AnimatePresence>
            <div className="relative min-h-[340px] overflow-hidden rounded-[1.6rem] bg-sky-50">
              <img src={activeItem.img} alt={activeItem.t} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfrastructureSlider() {
  const [active, setActive] = useState(0);
  const item = INFRA[active];
  const Icon = item.icon;
  const next = () => setActive((v) => (v + 1) % INFRA.length);
  const prev = () => setActive((v) => (v - 1 + INFRA.length) % INFRA.length);

  return (
    <section id="infrastructure" className="relative overflow-hidden bg-white py-24 text-foreground md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-sky-50/70 to-white" />
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal><Eyebrow>Инфраструктура и сервис</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 font-display text-[clamp(36px,6vw,86px)] font-extrabold uppercase leading-[0.86] tracking-tight">
                Курорт внутри проекта
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12} className="flex gap-3">
            <button onClick={prev} className="grid h-12 w-12 place-items-center rounded-full border border-brand-blue/15 text-brand-blue transition-colors hover:bg-brand-blue hover:text-white" aria-label="Предыдущий слайд">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button onClick={next} className="grid h-12 w-12 place-items-center rounded-full border border-brand-blue/15 text-brand-blue transition-colors hover:bg-brand-blue hover:text-white" aria-label="Следующий слайд">
              <ArrowRight className="h-5 w-5" />
            </button>
          </Reveal>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2.25rem] border border-brand-blue/10 bg-white shadow-soft">
            <AnimatePresence mode="wait">
              <motion.img
                key={item.img}
                src={item.img}
                alt={item.t}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/55 via-30% to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur">
                <Icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={item.t} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.4, ease: EASE }}>
                  <h3 className="font-display text-[clamp(28px,4vw,56px)] font-extrabold uppercase leading-none text-white drop-shadow-[0_2px_18px_rgba(13,17,23,0.5)]">{item.t}</h3>
                  <p className="mt-4 max-w-xl text-[16px] font-medium leading-relaxed text-white/85">{item.d}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="grid content-between gap-3">
            {INFRA.map((it, i) => (
              <button
                key={it.t}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex items-center justify-between rounded-3xl border p-5 text-left transition-all",
                  active === i ? "border-brand-blue bg-brand-blue text-white shadow-soft" : "border-brand-blue/10 bg-white text-foreground hover:border-brand-blue/25 hover:bg-sky-50"
                )}
              >
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">0{i + 1}</span>
                  <span className="mt-1 block font-display text-xl font-extrabold uppercase">{it.t}</span>
                </span>
                <ArrowRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", active === i ? "text-white" : "text-brand-blue/45")} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const GALLERY_IMAGES = [
  { src: "/assets/gallery/g1.jpg", cap: "Сантерра · башни у моря" },
  { src: "/assets/gallery/g6.jpg", cap: "SKYSOUL · Коктебель" },
  { src: "/assets/gallery/g3.jpg", cap: "Сантерра · лаунж-ресторан" },
  { src: "/assets/gallery/g7.jpg", cap: "Олимпия · Симферополь" },
  { src: "/assets/gallery/g5.jpg", cap: "Птица · санаторий" },
  { src: "/assets/gallery/g2.jpg", cap: "Сантерра · скай-вилла" },
  { src: "/assets/gallery/g8.jpg", cap: "Меддирт · Саки" },
  { src: "/assets/gallery/g4.jpg", cap: "Сантерра · бассейны" },
  { src: "/assets/skysoul.jpg", cap: "SKYSOUL · комплекс" },
  { src: "/assets/ptica.jpg", cap: "Птица · у моря" },
  { src: "/assets/olympia.jpg", cap: "Олимпия · квартал" },
  { src: "/assets/meddirt.jpg", cap: "Меддирт · кластер" },
];

function GalleryCompact() {
  const [idx, setIdx] = useState<number | null>(null);
  const close = () => setIdx(null);
  const prev = () => setIdx((v) => (v === null ? v : (v - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length));
  const next = () => setIdx((v) => (v === null ? v : (v + 1) % GALLERY_IMAGES.length));

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [idx]);

  const active = idx !== null ? GALLERY_IMAGES[idx] : null;

  return (
    <section id="gallery" className="bg-gradient-to-b from-white to-sky-50/50 py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="mb-10 max-w-2xl">
          <Reveal><Eyebrow>Галерея проектов</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(32px,5vw,72px)] font-extrabold uppercase leading-[0.9] tracking-tight text-foreground">
              Проекты в кадре
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[15px] font-medium text-muted-foreground">
              Нажмите на любой кадр — он раскроется на весь экран. Стрелки и свайп для перелистывания.
            </p>
          </Reveal>
        </div>

        <div className="columns-2 gap-4 [column-fill:_balance] md:columns-3 lg:columns-4 [&>*]:mb-4">
          {GALLERY_IMAGES.map((g, i) => (
            <motion.button
              key={g.src + i}
              onClick={() => setIdx(i)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: EASE }}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-brand-blue/10 shadow-[0_18px_50px_-38px_rgba(15,76,129,0.55)]"
            >
              <motion.img
                layoutId={`gal-${i}`}
                src={g.src}
                alt={g.cap}
                loading="lazy"
                className="block w-full rounded-2xl object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="pointer-events-none absolute bottom-4 left-4 right-4 text-left text-[12px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {g.cap}
              </span>
              <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-blue opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {active && idx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-brand-ink/92 p-4 backdrop-blur-xl"
          >
            <motion.img
              layoutId={`gal-${idx}`}
              src={active.src}
              alt={active.cap}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 120) close(); }}
              className="max-h-[86vh] max-w-[94vw] cursor-grab rounded-2xl object-contain shadow-2xl active:cursor-grabbing"
              draggable={false}
            />
            <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-white/12 px-5 py-2 text-[13px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {active.cap} · {idx + 1}/{GALLERY_IMAGES.length}
            </div>
            <button onClick={(e) => { e.stopPropagation(); close(); }} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-blue" aria-label="Закрыть">
              <X className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-blue md:left-8" aria-label="Назад">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-blue md:right-8" aria-label="Вперёд">
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function DirectorSectionPremium() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-sky-50/70 to-white py-24 text-foreground md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,76,129,0.05)_1px,transparent_1px),linear-gradient(rgba(15,76,129,0.05)_1px,transparent_1px)] bg-[size:88px_88px]" />
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-10 px-6 md:px-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-1 lg:order-1">
          <Reveal><Eyebrow>Слово руководителя</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <span className="font-display text-6xl leading-none text-brand-blue/20">“</span>
            <blockquote className="relative -mt-4 max-w-3xl font-display text-[clamp(22px,3vw,44px)] font-bold leading-[1.18] tracking-tight text-foreground">
              Мы не строим метры. Мы создаём места, которые становятся
              <span className="grad-text"> будущим Крыма</span>.
            </blockquote>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-brand-blue/12 pt-8">
              <img src="/assets/team/shatskih.jpg" alt="Алексей Шацких" className="h-20 w-20 rounded-2xl object-cover object-top ring-1 ring-brand-blue/15" />
              <div>
                <p className="font-display text-2xl font-extrabold uppercase">Алексей Шацких</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue/55">Вице-президент группы компаний</p>
              </div>
              <span className="hidden h-12 w-px bg-brand-blue/12 sm:block" />
              <p className="max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
                Курортная архитектура, сервис и инвестиционная ценность должны звучать одним языком:
                уверенно, масштабно и без случайных решений.
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.08} className="order-2 lg:order-2">
          <div className="relative mx-auto max-w-[420px] lg:max-w-[520px]">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/16 to-brand-teal/10 blur-2xl" />
            <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2.2rem] border border-brand-blue/10 bg-white shadow-2xl lg:aspect-[4/5]">
              <img src="/assets/team/shatskih.jpg" alt="Алексей Шацких" className="absolute inset-0 h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/72 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="rounded-full border border-white/25 bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-blue backdrop-blur">Видение основателя</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [activeName, setActiveName] = useState<string | null>(null);
  const activeObj = OBJECTS.find((o) => o.name === activeName) ?? null;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.6 });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  const goContacts = () => document.querySelector("#contacts")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative bg-background">
      <Navbar onCta={goContacts} />
      <main>
        <Hero onCta={goContacts} />
        <DeveloperIntroPremium />
        <Projects onOpen={setActiveName} />
        <AboutAdvantages />
        <ProcessPremium />
        <InfrastructureSlider />
        <Metrics />
        <MapSection onOpen={setActiveName} />
        <GalleryCompact />
        <DirectorSectionPremium />
        <Team />
        <News />
        <CTASection />
        <Footer />
      </main>
      <ObjectModal obj={activeObj} onClose={() => setActiveName(null)} onRequest={() => { setActiveName(null); setTimeout(goContacts, 250); }} />
    </div>
  );
}
