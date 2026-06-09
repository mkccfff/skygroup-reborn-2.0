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
  Building2,
  Hotel,
  Waves,
  Stethoscope,
  UtensilsCrossed,
  Sun,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CrimeaMap } from "@/components/site/CrimeaMap";
import { Building3D } from "@/components/site/Building3D";
import { FloatingPaths } from "@/components/site/FloatingPaths";

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
  popupImg?: string;
  url: string;
  tags: string[];
  price: string;
  desc: string;
  /* ключевые цифры из буклета — для модалки и блока инфраструктуры */
  stats: { v: string; l: string }[];
}

/* Все описания и цифры — строго из буклета СКАЙГРУПП.
   Цена указывается только там, где подтверждена; иначе «по запросу». */
const OBJECTS: ProjectObj[] = [
  {
    name: "SKYSOUL",
    type: "Курортный комплекс бизнес-класса",
    loc: "Коктебель",
    img: "assets/skysoul.jpg",
    url: "https://skysoul.ru/",
    tags: ["Первая береговая линия", "Панорамные виды 360°", "СПА-комплекс", "Ресторан авторской кухни", "Инфраструктура 365"],
    price: "от 427 000 ₽/м²",
    desc: "Курортный комплекс бизнес-класса в одном из самых живописных мест Крыма — в Коктебеле. Проект объединяет современный отель, резиденции и развитую курортную инфраструктуру для комфортной жизни и отдыха круглый год.",
    stats: [
      { v: "14,5 га", l: "территория проекта" },
      { v: "85 000+ м²", l: "площадь застройки" },
      { v: "2 500", l: "номерной фонд" },
      { v: "2025", l: "введена I очередь" },
    ],
  },
  {
    name: "ПТИЦА",
    type: "Санаторно-курортный комплекс",
    loc: "Саки · первая линия",
    img: "assets/ptica.jpg",
    url: "https://xn----7sbxkublblhh6a.xn--p1ai/",
    tags: ["90% видовых номеров", "Панорамный ресторан", "Собственная парковка"],
    price: "по запросу",
    desc: "Премиальный курортный комплекс на первой береговой линии в одном из самых живописных мест Крыма. Гармония природы, архитектуры и сервиса высочайшего уровня. Собственный санаторный корпус — пространство восстановления сил и здоровья в гармонии с природой.",
    stats: [
      { v: "1-я линия", l: "первая береговая" },
      { v: "Санаторий", l: "XXI века, собственный" },
      { v: "365", l: "инфраструктура круглый год" },
      { v: "1 686", l: "единиц номерного фонда" },
      { v: "1 960 м²", l: "СПА-центр" },
      { v: "1 200 м", l: "собственная артезианская скважина" },
    ],
  },
  {
    name: "САНТЕРРА",
    type: "Комплекс элит-класса",
    loc: "с. Весёлое · Судак",
    img: "assets/santerra.jpg",
    popupImg: "assets/santerra-villa.jpg",
    url: "https://sunterra.com.ru/",
    tags: ["Элит-класс", "Скай-виллы", "Таунхаусы"],
    price: "по запросу",
    desc: "Туристско-рекреационный комплекс элит-класса в с. Весёлое, г. Судак. Чистый морской воздух, реликтовая природа и продуманная архитектура образуют гармоничное пространство для отдыха, восстановления сил и вдохновения.",
    stats: [
      { v: "43", l: "бассейна на территории" },
      { v: "200 м²", l: "инфинити-бассейн" },
      { v: "90%", l: "видовых номеров" },
      { v: "2 га", l: "собственный пляж" },
      { v: "1 800 м²", l: "два СПА-комплекса" },
      { v: "2 715 м²", l: "панорамный ресторан" },
    ],
  },
  {
    name: "МЕДДИРТ",
    type: "Семейный курортный кластер",
    loc: "Саки · первая линия",
    img: "assets/meddirt.jpg",
    url: "https://meddirt.ru/",
    tags: ["Для семьи", "Первая линия", "Комфорт-класс", "Аквапарк", "ТРЦ и парк аттракционов", "СПА-комплекс"],
    price: "по запросу",
    desc: "Семейный курортный кластер комфорт-класса на первой береговой линии. Всё для отдыха, оздоровления и развлечения семьи — в одном месте и круглый год.",
    stats: [
      { v: "55,9 га", l: "площадь территории" },
      { v: "5 000", l: "номерной фонд" },
      { v: "230 000+ м²", l: "продаваемой площади" },
      { v: "20 м", l: "до собственного пляжа" },
    ],
  },
  {
    name: "ОЛИМПИЯ",
    type: "Закрытый премиум-квартал",
    loc: "Симферополь",
    img: "assets/olympia.jpg",
    popupImg: "assets/olympia-popup.jpg",
    url: "https://olympiakvartal.ru/",
    tags: ["Закрытый квартал", "Для семьи", "Приватность", "Подземный тёплый паркинг", "Уход за автомобилем", "Бизнес-центр"],
    price: "по запросу",
    desc: "Олимпия — это закрытый премиум-квартал для жизни всей семьёй. Продуманная инфраструктура, приватная территория и безупречный сервис создают пространство, где каждая деталь работает на ваш комфорт, безопасность и благополучие.",
    stats: [
      { v: "950", l: "квартирный фонд" },
      { v: "2", l: "бассейна на территории" },
      { v: "ФОК", l: "собственный физкультурно-оздоровительный комплекс" },
      { v: "Часовня", l: "на территории квартала" },
      { v: "СПА", l: "комплекс для резидентов" },
      { v: "Приватный", l: "внутренний двор" },
    ],
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
    t: "Собственный банк земли",
    d: "295+ гектаров земельного банка в ключевых локациях Крыма — фундамент масштабных проектов на годы вперёд.",
  },
  {
    t: "Собственная генподрядная организация",
    d: "«Интеграл» — от земли и проектирования до строительства и эксплуатации в одних руках. Контроль сроков, материалов и качества внутри группы.",
  },
  {
    t: "Собственный отельный оператор",
    d: "SKYSOUL HOTEL GROUP — гостеприимство премиального уровня и доходность для собственников недвижимости круглый год.",
  },
  {
    t: "Собственная управляющая компания",
    d: "УК «СКАЙСОУЛ» — эксплуатация, сервис и единые стандарты качества после ввода объекта в работу.",
  },
];

const TEAM = [
  // Алексей Шацких вынесен в отдельный блок «Слово руководителя» (убран дубль фото)
  { name: "Каринэ Шацких", role: "Коммерческий директор", img: "assets/team/karine.jpg" },
  { name: "Ирина Смирнова", role: "Заместитель директора", img: "assets/team/smirnova.jpg" },
  { name: "Сергей Киселев", role: "Директор отельного оператора", img: "assets/team/kiselev.jpg" },
  { name: "Алексей Лысаков", role: "Директор по строительству", img: "assets/team/lysakov.jpg" },
  { name: "Евгений Еременко", role: "Директор ИТ и защиты информации", img: "assets/team/eremenko.jpg" },
  { name: "Елена Сухорукова", role: "Директор по персоналу", img: "assets/team/suhorukova.jpg" },
  { name: "Ширак Багдасарян", role: "Директор по безопасности", img: "assets/team/bagdasaryan.jpg" },
];

interface NewsItem {
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  img: string;
  body: string[];
}

const NEWS: NewsItem[] = [
  {
    tag: "ПМЭФ-2026",
    date: "Июнь 2026",
    title: "На ПМЭФ-2026 подписан меморандум о развитии авиационного кластера",
    excerpt: "Совет министров Республики Крым и АНО «Просторы Клементьева» договорились о создании на горе Клементьева Центра развития малой авиации и воздушных видов спорта.",
    img: "assets/news/news-1.jpg",
    body: [
      "Одним из ключевых событий второго дня ПМЭФ-2026 для СКАЙГРУПП ДЕВЕЛОПМЕНТ стало подписание меморандума о реализации на территории Республики Крым инвестиционного проекта между Советом министров Республики Крым и АНО «Центр развития малой авиации и воздушных видов спорта „Просторы Клементьева“».",
      "Проект предусматривает создание на легендарной горе Клементьева современного Центра развития малой авиации и воздушных видов спорта — многофункционального комплекса, объединяющего авиационную инфраструктуру, образовательную и научно-исследовательскую деятельность, спортивные объекты и туристические возможности региона.",
      "В его состав войдут аэродром и вертодром с сопутствующей инфраструктурой, зоны для парапланерного и парашютного спорта, объекты природно-познавательного туризма, научно-исследовательский комплекс, кампус и туристско-рекреационная инфраструктура.",
      "Свои подписи под документом поставили заместитель Председателя Совета министров Республики Крым — министр финансов Республики Крым Ирина Кивико и генеральный директор АНО «Просторы Клементьева», вице-президент СКАЙГРУПП ДЕВЕЛОПМЕНТ Алексей Шацких.",
      "Гора Клементьева занимает особое место в истории отечественной авиации. Именно здесь зарождались традиции советского планеризма, проходили первые всесоюзные соревнования и подготовка будущих авиаконструкторов, лётчиков и исследователей неба.",
      "Проект станет площадкой роста для восточного Крыма, способствуя развитию туристической отрасли, созданию новых рабочих мест и укреплению статуса региона как одного из ключевых центров авиационного и активного туризма России.",
    ],
  },
  {
    tag: "ПМЭФ-2026",
    date: "Июнь 2026",
    title: "СКАЙГРУПП ДЕВЕЛОПМЕНТ подписала на ПМЭФ меморандумы на сумму свыше 143 млрд",
    excerpt: "По итогам форума компания подписала стратегическое соглашение со Сбербанком и три меморандума с Советом министров Республики Крым, сформировав инвестиционный портфель свыше 143 млрд рублей.",
    img: "assets/news/news-2.jpg",
    body: [
      "Для СКАЙГРУПП ДЕВЕЛОПМЕНТ Петербургский международный экономический форум — 2026 стал площадкой запуска инициатив, способных изменить экономический, туристический и инфраструктурный ландшафт Республики Крым на десятилетия вперёд.",
      "По итогам форума компания подписала стратегическое соглашение со Сбербанком и три меморандума о сотрудничестве с Советом министров Республики Крым, сформировав инвестиционный портфель свыше 143 млрд рублей.",
      "В число ключевых инициатив вошли проекты по созданию новых гостиничных, санаторно-курортных и туристических комплексов по всему полуострову — от западного до восточного побережья Крыма — с общим номерным фондом, превышающим 15 тысяч.",
      "Особое место среди подписанных меморандумов занимает туристско-развлекательный комплекс «Крым Наш Парк» с объёмом инвестиций более 120 млрд рублей — одна из крупнейших туристических инициатив современной России, способная стать новой точкой притяжения федерального масштаба.",
      "Ещё одним стратегическим направлением станет создание Центра развития малой авиации и воздушных видов спорта «Просторы Клементьева» — современного центра авиационного туризма, спорта и профильной инфраструктуры федерального уровня.",
    ],
  },
  {
    tag: "Проекты",
    date: "Июнь 2026",
    title: "«Крым Наш Парк» — новый масштабный проект развития Крыма",
    excerpt: "СКАЙГРУПП ДЕВЕЛОПМЕНТ и Сбербанк подписали соглашение о финансировании туристско-развлекательного комплекса в Бахчисарайском районе с объёмом инвестиций 120 млрд рублей.",
    img: "assets/news/news-3.jpg",
    body: [
      "В рамках ПМЭФ СКАЙГРУПП ДЕВЕЛОПМЕНТ и Сбербанк подписали соглашение о стратегическом сотрудничестве, предусматривающее финансирование туристско-развлекательного комплекса «Крым Наш Парк».",
      "Проект будет реализован на территории Бахчисарайского района и станет новой точкой притяжения для жителей и гостей полуострова. 120 млрд рублей — именно такая сумма будет вложена в реализацию проекта, превращая его в крупнейший туристический комплекс России.",
      "«Крым Наш Парк» объединит культурно-инновационный кластер, тематический парк аттракционов, всесезонный аквапарк с акватермальным комплексом, конгресс-холл, экспоцентр, спортивную инфраструктуру, объекты оздоровления, рекреации и временного проживания.",
      "Это не просто новый объект на карте полуострова. Это пространство, где будут создаваться воспоминания, рождаться яркие эмоции и открываться новые горизонты семейного отдыха и развлечений.",
    ],
  },
  {
    tag: "Партнёрство",
    date: "Июнь 2026",
    title: "На ПМЭФ подписано соглашение между СКАЙГРУПП ДЕВЕЛОПМЕНТ и Сбером",
    excerpt: "Десятилетнее сотрудничество предусматривает реализацию совместных инициатив в сфере девелопмента с использованием современных финансовых, цифровых и технологических решений.",
    img: "assets/news/news-4.jpg",
    body: [
      "На XXIX Петербургском международном экономическом форуме Председатель Сибирского банка Сбера Дмитрий Солнцев и вице-президент СКАЙГРУПП ДЕВЕЛОПМЕНТ Алексей Шацких подписали соглашение о сотрудничестве.",
      "Десятилетнее партнёрство предусматривает реализацию совместных инициатив в сфере девелопмента с использованием современных финансовых, цифровых и технологических решений.",
      "Одним из ключевых направлений сотрудничества станет финансирование одного из самых масштабных проектов Республики Крым — туристско-развлекательного комплекса «Крым Наш Парк». Общий объём инвестиций в проект составляет 120 млрд рублей, что делает его одним из крупнейших туристических комплексов России.",
      "«Для нас партнёрство со Сбером — это возможность усилить развитие проектов СКАЙГРУПП ДЕВЕЛОПМЕНТ за счёт современных технологий, сильной экспертизы и новых сервисных решений. Уверены, что совместная работа позволит реализовывать ещё более качественные и масштабные проекты», — отметил Алексей Шацких, вице-президент СКАЙГРУПП ДЕВЕЛОПМЕНТ.",
    ],
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
  const [val, setVal] = useState(0);
  // Собственный IntersectionObserver вместо useInView: при нескольких инстансах
  // framer useInView иногда не срабатывает для части элементов (счётчик застревал на 0).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setVal(to);
        return;
      }
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
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    // подстраховка: если элемент уже виден на момент маунта
    const check = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        run();
        io.disconnect();
      }
    });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(check);
    };
  }, [to]);
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
              "hidden h-10 items-center rounded-full border px-5 text-[12px] font-bold uppercase tracking-[0.12em] backdrop-blur-md transition-all sm:inline-flex",
              scrolled ? "border-brand-blue/25 bg-brand-blue/80 text-white hover:bg-brand-blue" : "border-white/40 bg-white/10 text-white hover:bg-white/20"
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
          poster="assets/hero.jpg"
        >
          <source src="assets/hero.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-ink/[0.64] via-brand-ink/[0.26] to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/[0.68] via-transparent to-brand-ink/[0.30]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-blue/[0.34] via-transparent to-brand-teal/[0.19] mix-blend-multiply" />
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
            Создаём знаковые проекты Крыма — недвижимость премиум, бизнес и элит-класса
            у моря, в которой хочется жить. <span className="text-sky-200">Сильные проекты — для сильной страны.</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.1 }} className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 text-[12px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md transition-all hover:bg-white/20"
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
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/[0.75] via-brand-ink/[0.41] to-brand-ink/[0.23]" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/[0.60] to-transparent" />

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

// 4 станции: верх-слева, низ-справа, низ-слева, верх-справа
const ABOUT_POS = ["TL", "BR", "BL", "TR"];
const ABOUT_RANGES = [
  [0.03, 0.12, 0.24, 0.32],
  [0.3, 0.4, 0.52, 0.6],
  [0.56, 0.66, 0.76, 0.84],
  [0.78, 0.88, 0.96, 1.0],
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
    <section id="about" ref={ref} className="relative h-[320vh] bg-brand-ink">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* full-screen building video, scrubbed by scroll */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
          poster="assets/hero.jpg"
        >
          <source src="assets/about-building.mp4" type="video/mp4" />
        </video>
        {/* legibility scrims */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-ink/75 via-brand-ink/10 to-brand-ink/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-blue/30 via-transparent to-brand-teal/15 mix-blend-multiply" />

        {/* heading */}
        <div className="absolute left-1/2 top-[9%] z-20 -translate-x-1/2 px-6 text-center">
          <Reveal><Eyebrow center light>О компании</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-display text-[clamp(30px,5vw,64px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_26px_rgba(13,17,23,0.65)]">
              Полный цикл{" "}
              <span className="bg-gradient-to-r from-white via-sky-200 to-brand-teal/80 bg-clip-text text-transparent">девелопмента</span>
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
interface MarketPoint {
  label: string;
  value: number;
  display: string;
  note: string;
  growth: string;
  forecast?: boolean;
}

interface MarketSeries {
  points: MarketPoint[];
  currentIndex: number;
  stats: { value: string; label: string }[];
  source: string;
}

type MarketProjectKey = "skysoul" | "santerra" | "ptica";
type SkyQueueKey = "first" | "second" | "third";

const MARKET_PROJECT_TABS: { key: MarketProjectKey; label: string }[] = [
  { key: "skysoul", label: "SKYSOUL" },
  { key: "santerra", label: "САНТЕРРА" },
  { key: "ptica", label: "ПТИЦА" },
];

const MARKET_COPY: Record<MarketProjectKey, { title: string; description: string }> = {
  skysoul: {
    title: "SKYSOUL: рост стоимости по очередям",
    description: "Выберите очередь проекта, чтобы сравнить цену м² на старте, текущую стоимость и прогноз на II квартал 2027 года.",
  },
  santerra: {
    title: "САНТЕРРА: +225% к стартовой цене",
    description: "С 27 июня 2025 года цена м² выросла с 310 000 до 1 006 700 ₽ менее чем за 11 месяцев.",
  },
  ptica: {
    title: "ПТИЦА: рост цены и прогноз до 2028",
    description: "Стоимость м² выросла с 205 000 до 730 000 ₽. Прогнозируемая стоимость к сдаче в 2028 году — 1 100 000 ₽/м².",
  },
};

const SKYSOUL_QUEUES: Record<SkyQueueKey, MarketSeries> = {
  first: {
    points: [
      { label: "II кв. 2022", value: 180000, display: "180 000 ₽/м²", note: "Старт продаж", growth: "Старт" },
      { label: "июнь 2026", value: 604696, display: "604 696 ₽/м²", note: "Текущая цена", growth: "+236%" },
      { label: "II кв. 2027", value: 670000, display: "660–680 тыс. ₽/м²", note: "Прогнозный диапазон", growth: "+267–278%", forecast: true },
    ],
    currentIndex: 1,
    stats: [
      { value: "+236%", label: "рост за 4 года" },
      { value: "90%", label: "распродано · 600 из 668" },
      { value: "20,2 млн ₽", label: "минимальная цена объекта" },
    ],
    source: "1 очередь · данные обновлены в июне 2026 года",
  },
  second: {
    points: [
      { label: "II кв. 2023", value: 223000, display: "223 000 ₽/м²", note: "Старт продаж", growth: "Старт" },
      { label: "июнь 2026", value: 472251, display: "472 251 ₽/м²", note: "Текущая цена", growth: "+136%" },
      { label: "II кв. 2027", value: 535000, display: "520–550 тыс. ₽/м²", note: "Прогнозный диапазон", growth: "+133–147%", forecast: true },
    ],
    currentIndex: 1,
    stats: [
      { value: "+136%", label: "рост за 3 года" },
      { value: "76%", label: "распродано · 604 из 794" },
      { value: "11,4 млн ₽", label: "минимальная цена объекта" },
    ],
    source: "2 очередь · данные обновлены в июне 2026 года",
  },
  third: {
    points: [
      { label: "II кв. 2024", value: 255000, display: "255 000 ₽/м²", note: "Старт продаж", growth: "Старт" },
      { label: "июнь 2026", value: 427227, display: "427 227 ₽/м²", note: "Текущая цена", growth: "+80%" },
      { label: "II кв. 2027", value: 490000, display: "470–510 тыс. ₽/м²", note: "Прогнозный диапазон", growth: "+84–100%", forecast: true },
    ],
    currentIndex: 1,
    stats: [
      { value: "+80%", label: "рост за 2 года" },
      { value: "62%", label: "распродано · 403 из 654" },
      { value: "13,3 млн ₽", label: "минимальная цена объекта" },
    ],
    source: "3 очередь · данные обновлены в июне 2026 года",
  },
};

const MARKET_SERIES: Record<Exclude<MarketProjectKey, "skysoul">, MarketSeries> = {
  santerra: {
    points: [
      { label: "27.06.2025", value: 310000, display: "310 000 ₽/м²", note: "Старт продаж", growth: "Старт" },
      { label: "сейчас", value: 1006700, display: "1 006 700 ₽/м²", note: "Текущая цена", growth: "+225%" },
    ],
    currentIndex: 1,
    stats: [
      { value: "+225%", label: "рост к стартовой цене" },
      { value: "172", label: "лота продано" },
      { value: "65%", label: "открытого объёма за первые 6 часов" },
    ],
    source: "Старт продаж · 27 июня 2025 года",
  },
  ptica: {
    points: [
      { label: "старт продаж", value: 205000, display: "205 000 ₽/м²", note: "Цена на старте", growth: "Старт" },
      { label: "сейчас", value: 730000, display: "730 000 ₽/м²", note: "Текущая цена", growth: "+256%" },
      { label: "2028", value: 1100000, display: "1 100 000 ₽/м²", note: "Прогноз к сдаче", growth: "+437%", forecast: true },
    ],
    currentIndex: 1,
    stats: [
      { value: "+256%", label: "рост стоимости с запуска" },
      { value: "32", label: "апартамента в среднем в месяц" },
      { value: "+437%", label: "прогнозируемый рост к сдаче" },
    ],
    source: "Средние продажи рассчитаны за 26 месяцев с момента старта",
  },
};

function InteractiveChart({ project }: { project: MarketProjectKey }) {
  const [queue, setQueue] = useState<SkyQueueKey>("first");
  const series = project === "skysoul" ? SKYSOUL_QUEUES[queue] : MARKET_SERIES[project];
  const [active, setActive] = useState(series.currentIndex);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-60px" });

  useEffect(() => {
    setActive(series.currentIndex);
  }, [project, queue, series.currentIndex]);

  const W = 720, H = 300, padL = 54, padR = 54, padT = 24, padB = 36;
  const values = series.points.map((point) => point.value);
  const dmin = Math.min(...values);
  const dmax = Math.max(...values);
  const span = Math.max(dmax - dmin, dmax * 0.1, 1);
  const min = dmin - span * 0.18;
  const max = dmax + span * 0.12;
  const X = (i: number) => padL + (i * (W - padL - padR)) / (series.points.length - 1);
  const Y = (v: number) => H - padB - ((v - min) / (max - min)) * (H - padT - padB);
  const forecastIndex = series.points.findIndex((point) => point.forecast);
  const historyEnd = forecastIndex > 0 ? forecastIndex - 1 : series.points.length - 1;
  const pathBetween = (start: number, end: number) =>
    series.points.slice(start, end + 1).map((point, offset) => `${offset ? "L" : "M"}${X(start + offset)},${Y(point.value)}`).join(" ");
  const historyLineD = pathBetween(0, historyEnd);
  const forecastLineD = forecastIndex > 0 ? pathBetween(forecastIndex - 1, series.points.length - 1) : "";
  const areaD = `${historyLineD} L${X(historyEnd)},${H - padB} L${X(0)},${H - padB} Z`;

  const pick = (clientX: number, el: SVGRectElement) => {
    const rect = el.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    let nearest = 0, dm = Infinity;
    for (let i = 0; i < series.points.length; i++) {
      const d = Math.abs(X(i) - px);
      if (d < dm) { dm = d; nearest = i; }
    }
    setActive(nearest);
  };

  const selected = series.points[active];

  return (
    <div ref={wrapRef} className="relative">
      {project === "skysoul" && (
        <div className="mb-5 flex flex-wrap gap-2">
          {([
            ["first", "1 очередь"],
            ["second", "2 очередь"],
            ["third", "3 очередь"],
          ] as [SkyQueueKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setQueue(key)}
              className={cn(
                "rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                queue === key
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-blue/15 bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* big live readout */}
      <div className="mb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {selected.note} · {selected.label}
          </div>
          <div className="mt-1 font-num text-[clamp(34px,5vw,56px)] font-extrabold leading-none text-brand-blue tabular-nums">
            {selected.display}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-1 text-[12px] font-bold text-brand-teal">
            {selected.forecast ? "Прогноз" : "Динамика"} · {selected.growth}
          </div>
        </div>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        {series.stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-brand-blue/10 bg-sky-50/75 px-3.5 py-3">
            <div className="font-num text-lg font-extrabold leading-none text-brand-blue">{stat.value}</div>
            <div className="mt-1.5 text-[9px] font-bold uppercase leading-snug tracking-[0.08em] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
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

          <motion.path key={`area-${project}-${queue}`} d={areaD} fill="url(#carea)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1, delay: 0.2 }} />
          <motion.path key={`line-${project}-${queue}`} d={historyLineD} fill="none" stroke="url(#cline)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.2, ease: EASE }} />
          {forecastLineD && (
            <motion.path key={`forecast-${project}-${queue}`} d={forecastLineD} fill="none" stroke="#185B69" strokeWidth="3.5" strokeDasharray="10 9" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.8, delay: 0.45, ease: EASE }} />
          )}

          {/* active guideline */}
          <line x1={X(active)} y1={padT - 8} x2={X(active)} y2={H - padB} stroke="rgba(15,76,129,0.3)" strokeDasharray="4 4" />

          {/* points */}
          {series.points.map((point, i) => (
            <circle key={point.label} cx={X(i)} cy={Y(point.value)} r={active === i ? 8 : 4.5} fill={active === i ? "#0F4C81" : "#fff"} stroke="#0F4C81" strokeWidth="3" strokeDasharray={point.forecast ? "3 2" : undefined} style={{ transition: "r .15s, fill .15s" }} />
          ))}

          {/* period labels */}
          {series.points.map((point, i) => (
            <text key={point.label} x={X(i)} y={H - padB + 24} textAnchor="middle" className={cn(active === i ? "fill-brand-blue" : "fill-[#8a96a6]")} style={{ fontSize: 12, fontWeight: active === i ? 800 : 500 }}>{point.label}</text>
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
        Ведите по графику или тяните, чтобы посмотреть значения. {series.source}.
      </p>
    </div>
  );
}

function Metrics() {
  const [project, setProject] = useState<MarketProjectKey>("skysoul");
  const copy = MARKET_COPY[project];

  return (
    <section className="bg-gradient-to-b from-white to-sky-50/50 py-24 md:py-28">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Выберите проект</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MARKET_PROJECT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setProject(tab.key)}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all",
                  project === tab.key
                    ? "border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                    : "border-brand-blue/15 bg-white text-brand-blue hover:bg-sky-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid items-center gap-10 rounded-3xl border border-brand-blue/10 bg-white p-7 shadow-glow md:grid-cols-[0.85fr_1.15fr] md:p-12">
          <div>
            <Eyebrow>Динамика рынка</Eyebrow>
            <h3 className="mt-5 font-display text-[clamp(26px,3vw,42px)] font-extrabold leading-tight tracking-tight text-foreground">
              {copy.title}
            </h3>
            <p className="mt-4 max-w-md text-sm font-medium text-muted-foreground">
              {copy.description}
            </p>
          </div>
          <InteractiveChart project={project} />
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
    <section id="map" className="relative overflow-hidden bg-white">
      <div className="relative w-full">
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
            <img src="assets/team/shatskih.jpg" alt="Алексей Шацких" className="absolute inset-0 h-full w-full object-cover object-top" />
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
    <section id="team" className="relative bg-white py-24 md:py-32">
      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <Reveal><Eyebrow>Команда</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
              Люди, которые строят будущее
            </h2>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={(i % 3) * 0.06}>
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
function NewsCard({ n, onOpen, delay = 0 }: { n: NewsItem; onOpen: () => void; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <button onClick={onOpen} className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-brand-blue/10 bg-white text-left transition-all hover:-translate-y-1 hover:shadow-glow">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={n.img} alt={n.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
      </button>
    </Reveal>
  );
}

function NewsModal({ news, onClose }: { news: NewsItem | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (news) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [news, onClose]);
  return (
    <AnimatePresence>
      {news && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-brand-ink/55 p-4 backdrop-blur-md md:p-8">
          <motion.article initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }} transition={{ duration: 0.4, ease: EASE }} onClick={(e) => e.stopPropagation()} className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-brand-ink shadow-md transition-colors hover:bg-brand-blue hover:text-white" aria-label="Закрыть"><X className="h-5 w-5" /></button>
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={news.img} alt={news.title} className="h-full w-full object-cover" />
              <span className="absolute left-5 top-5 rounded-full bg-brand-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{news.tag}</span>
            </div>
            <div className="p-7 md:p-9">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{news.date}</span>
              <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-[28px]">{news.title}</h3>
              <div className="mt-5 space-y-4 text-[15px] font-medium leading-relaxed text-foreground/75">
                {news.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function News() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="news" className="bg-gradient-to-b from-sky-50/50 to-white py-24 md:py-32">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal><Eyebrow>Медиа</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 font-display text-[clamp(30px,4.5vw,60px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
                Новости СКАЙГРУПП девелопмент
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <a href="#/news" className="group inline-flex h-12 items-center gap-2 rounded-full border border-brand-blue/20 px-6 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white">
              Все новости <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {NEWS.slice(0, 3).map((n, i) => (
            <NewsCard key={n.title} n={n} delay={i * 0.08} onOpen={() => setActive(i)} />
          ))}
        </div>
      </div>
      <NewsModal news={active != null ? NEWS[active] : null} onClose={() => setActive(null)} />
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
            <h2 className="mt-6 font-display text-[clamp(36px,5.6vw,84px)] font-extrabold uppercase leading-[1.0] tracking-tight text-foreground">
              Премиальный Крым<br />
              <span className="text-brand-blue inline-block pb-[0.12em]">для жизни и инвестиций</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-md text-[16px] font-medium leading-relaxed text-muted-foreground">
              От курортных резиденций на первой линии до закрытых городских кварталов —
              подберём объект под вашу задачу: для жизни, отдыха или инвестиций. Расскажем
              о проектах, ценах и условиях покупки.
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
                  <p className="text-center text-[11px] text-muted-foreground">Нажимая кнопку, вы соглашаетесь с <a href="#/privacy" className="underline underline-offset-2 transition-colors hover:text-brand-blue">политикой конфиденциальности</a>.</p>
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
    <footer className="relative overflow-hidden bg-brand-ink px-6 pb-10 pt-20 text-white/60 md:px-10">
      <img
        src="assets/brand-mark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-20 hidden h-[150%] w-auto opacity-[0.06] [filter:brightness(0)_invert(1)] md:block"
      />
      <div className="relative mx-auto max-w-[1360px]">
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
            <a href="#/privacy" className="hover:text-white">Политика конфиденциальности</a>
            <a href="#/legal" className="hover:text-white">Правовая информация</a>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[300] flex items-center justify-center bg-brand-ink/50 p-4 backdrop-blur-md md:p-8">
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }} transition={{ duration: 0.4, ease: EASE }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${obj.name} — информация о проекте`} tabIndex={0} className="relative grid h-[calc(100dvh-2rem)] max-h-[760px] w-full max-w-4xl grid-rows-[14rem_minmax(0,1fr)] overflow-hidden rounded-3xl bg-white shadow-2xl outline-none md:h-[calc(100dvh-4rem)] md:grid-cols-2 md:grid-rows-1">
            <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-brand-ink shadow-md transition-colors hover:bg-brand-blue hover:text-white" aria-label="Закрыть"><X className="h-5 w-5" /></button>
            <div className="relative h-56 md:h-full">
              <img src={obj.popupImg ?? obj.img} alt={obj.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/50 to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-5 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-white"><MapPin className="h-4 w-4" />{obj.loc}</div>
            </div>
            <div role="region" aria-label="Содержимое проекта" tabIndex={0} className="flex min-h-0 flex-col overflow-y-auto overscroll-contain p-7 outline-none md:p-9">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-teal">{obj.type}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-foreground">{obj.name}</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-foreground/70">{obj.desc}</p>
              <div className="mt-6">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-teal">Инфраструктура и преимущества</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {obj.stats.map((s) => (
                    <div key={s.l} className="min-w-0 rounded-xl bg-sky-50 p-3.5">
                      <div className="font-num text-[15px] font-extrabold leading-tight text-brand-blue [overflow-wrap:anywhere]">{s.v}</div>
                      <div className="mt-1.5 text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground [overflow-wrap:anywhere]">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {obj.tags.map((t) => <span key={t} className="rounded-full border border-brand-blue/15 bg-brand-blue/5 px-3 py-1 text-[11px] font-medium text-brand-blue">{t}</span>)}
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
                <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Стоимость</div><div className="font-display text-xl text-brand-blue">{obj.price}</div></div>
                <div className="flex flex-wrap gap-2">
                  <a href={obj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-blue transition-colors hover:bg-sky-50">Перейти на сайт <ArrowUpRight className="h-4 w-4" /></a>
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
  { to: 397000, suff: "+", l: "м² введено в эксплуатацию" },
  { to: 330000, suff: "+", l: "м² на этапе строительства" },
  { to: 295, suff: "+ га", l: "земельный банк" },
  { to: 14, suff: "", l: "масштабных проектов" },
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
                <img src={`assets/gallery/${g}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110" />
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
            <img src="assets/gallery/g7.jpg" alt="Проект СКАЙГРУПП" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
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
  { img: "assets/gallery/g7.jpg", t: "Земельный банк", d: "278 га собственной земли на лучших локациях полуострова — у моря и лечебных источников." },
  { img: "assets/gallery/g2.jpg", t: "Проектирование", d: "Авторская архитектура и инженерия мирового уровня. Каждый проект рассчитан на поколения." },
  { img: "assets/gallery/g1.jpg", t: "Строительство", d: "Собственный генподрядчик «Интеграл» — контроль качества и сроков на каждом этапе." },
  { img: "assets/gallery/g3.jpg", t: "Управление", d: "Отельный оператор SKYSOUL HOTEL GROUP: сервис 5★ и доходность для собственников." },
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
  { img: "assets/gallery/g6.jpg", icon: Waves, t: "Набережные и пляжи", d: "Благоустроенные пляжи и приморские променады в шаговой доступности." },
  { img: "assets/gallery/g5.jpg", icon: Stethoscope, t: "Бальнеология и СПА", d: "Санатории и грязелечение на ресурсах Сакских озёр." },
  { img: "assets/gallery/g3.jpg", icon: Hotel, t: "Отельный сервис 5★", d: "Гостеприимство уровня пятизвёздочного курорта круглый год." },
  { img: "assets/gallery/g4.jpg", icon: UtensilsCrossed, t: "Рестораны и лаунж", d: "Гастрономия, lounge-зоны и сервис прямо на территории." },
  { img: "assets/gallery/g8.jpg", icon: Sun, t: "Всесезонность", d: "Комфорт и активности в любое время года." },
  { img: "assets/gallery/g1.jpg", icon: Building2, t: "Приватная среда", d: "Закрытые территории, благоустройство и безопасность 24/7." },
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
  { src: "assets/gallery/g1.jpg", cap: "Сантерра · башни у моря", cls: "sm:col-span-2 sm:row-span-2" },
  { src: "assets/gallery/g6.jpg", cap: "SKYSOUL · Коктебель", cls: "" },
  { src: "assets/gallery/g5.jpg", cap: "Птица · санаторий", cls: "" },
  { src: "assets/gallery/g3.jpg", cap: "Сантерра · лаунж-ресторан", cls: "sm:col-span-2" },
  { src: "assets/gallery/g2.jpg", cap: "Сантерра · скай-вилла", cls: "" },
  { src: "assets/gallery/g4.jpg", cap: "Сантерра · бассейны", cls: "" },
  { src: "assets/gallery/g7.jpg", cap: "Олимпия · Симферополь", cls: "" },
  { src: "assets/gallery/g8.jpg", cap: "Меддирт · Саки", cls: "" },
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
/* одна линия чертежа, длина которой привязана к прогрессу скролла */
function DraftShape(props: {
  progress: import("framer-motion").MotionValue<number>;
  range: [number, number];
  circle?: boolean;
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
}) {
  const { progress, range, circle, d, cx, cy, r, strokeWidth, strokeDasharray } = props;
  const pathLength = useTransform(progress, range, [0, 1]);
  if (circle) {
    return <motion.circle cx={cx} cy={cy} r={r} stroke="currentColor" fill="none" strokeWidth={strokeWidth} style={{ pathLength }} />;
  }
  return <motion.path d={d} stroke="currentColor" fill="none" strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} style={{ pathLength }} />;
}

/* само-рисующийся архитектурный чертёж, отрисовка привязана к скроллу секции */
function BlueprintBg() {
  const ref = useRef<SVGSVGElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });
  const floors = [192, 242, 292, 342, 392, 442];
  return (
    <svg ref={ref} viewBox="0 0 480 540" fill="none" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute right-[1%] top-1/2 hidden h-[120%] -translate-y-1/2 text-brand-blue/[0.16] lg:block">
      <DraftShape progress={scrollYProgress} range={[0, 0.18]} d="M40 482 H452" strokeWidth={1.5} />
      <DraftShape progress={scrollYProgress} range={[0.04, 0.5]} d="M150 482 V152 Q150 98 206 98 H300 Q356 98 356 152 V482" strokeWidth={2} />
      {floors.map((y, k) => (
        <DraftShape key={y} progress={scrollYProgress} range={[0.22 + k * 0.05, 0.46 + k * 0.05]} d={`M150 ${y} H356`} strokeWidth={1} />
      ))}
      <DraftShape progress={scrollYProgress} range={[0.3, 0.6]} d="M150 242 Q253 207 356 242" strokeWidth={1.5} />
      <DraftShape progress={scrollYProgress} range={[0.1, 0.34]} d="M96 98 V482" strokeWidth={1} strokeDasharray="2 7" />
      <DraftShape progress={scrollYProgress} range={[0.55, 0.82]} circle cx={408} cy={70} r={32} strokeWidth={1.5} />
      <DraftShape progress={scrollYProgress} range={[0.72, 0.92]} d="M408 40 V100 M378 70 H438" strokeWidth={1} />
    </svg>
  );
}

/* единый само-рисующийся паттерн линий, отрисовка привязана к скроллу —
   общий фон для блоков «Команда» + «Награды» (перетекает как одно целое) */
function DrawnLinesBackdrop() {
  const ref = useRef<SVGSVGElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lines = Array.from({ length: 11 }, (_, i) => {
    const position = i % 2 === 0 ? 1 : -1;
    const j = i + 3;
    return {
      d: `M-${380 - j * 5 * position} -${189 + j * 6}C-${380 - j * 5 * position} -${189 + j * 6} -${312 - j * 5 * position} ${216 - j * 6} ${152 - j * 5 * position} ${343 - j * 6}C${616 - j * 5 * position} ${470 - j * 6} ${684 - j * 5 * position} ${875 - j * 6} ${684 - j * 5 * position} ${875 - j * 6}`,
      w: 1.1 + i * 0.09,
      start: i * 0.045,
    };
  });
  return (
    <svg ref={ref} viewBox="0 0 696 316" preserveAspectRatio="none" fill="none" className="pointer-events-none absolute inset-0 h-full w-full text-brand-blue/[0.5]">
      {lines.map((l, i) => (
        <DraftShape key={i} progress={scrollYProgress} range={[l.start, 0.55 + l.start]} d={l.d} strokeWidth={l.w} />
      ))}
    </svg>
  );
}

function DeveloperIntroPremium() {
  return (
    <section id="developer" className="relative isolate flex min-h-[90vh] flex-col justify-center overflow-hidden bg-brand-ink py-24 text-white md:py-28">
      {/* красивый рендер на фоне (g2 — не повторяется в других секциях) */}
      <motion.img
        src="assets/gallery/g2.jpg"
        alt=""
        aria-hidden
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: EASE }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/[0.53] via-brand-ink/[0.30] to-brand-ink/[0.30]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-ink/[0.69] via-brand-ink/[0.26] to-transparent" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="max-w-3xl">
          <Reveal><Eyebrow light>О девелопере</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-display text-[clamp(38px,6.6vw,96px)] font-extrabold uppercase leading-[0.86] tracking-tight text-white drop-shadow-[0_6px_36px_rgba(0,0,0,0.55)]">
              Девелопер будущего{" "}
              <span className="text-sky-300">для Крыма</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-[16px] font-medium leading-relaxed text-white/85 md:text-[19px]">
              СКАЙГРУПП ДЕВЕЛОПМЕНТ соединяет землю, архитектуру, строительство,
              сервис и инвестиционную модель в одну понятную систему — и отвечает за результат целиком.
            </p>
          </Reveal>
        </div>

        {/* цифры: фиксированный безопасный размер (макс 58px) — не наезжают на любой ширине */}
        <Reveal delay={0.2}>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 border-t border-white/15 pt-9 md:mt-16 md:gap-x-10 lg:grid-cols-4">
            {DEV_STATS.map((s) => (
              <div key={s.l} className="min-w-0">
                <div className="flex items-baseline whitespace-nowrap font-num font-extrabold leading-none text-white">
                  <span className="text-[clamp(30px,4.2vw,68px)] tabular-nums">
                    <Counter to={s.to} format={(n) => ru(n)} />
                  </span>
                  <span className="ml-1 text-[clamp(13px,1.4vw,22px)] text-sky-300">{s.suff}</span>
                </div>
                <p className="mt-3 text-[12px] font-bold uppercase leading-snug tracking-[0.13em] text-white/65">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* реальные награды СКАЙГРУПП (бейджи в public/assets/awards) */
const AWARD_BADGES = [
  { img: "assets/awards/urban-winner-2025.png", title: "Победитель премии URBAN", year: "2025" },
  { img: "assets/awards/urban-winner-2024.png", title: "Победитель премии URBAN", year: "2024" },
  { img: "assets/awards/urban-finalist-2024.png", title: "Финалист премии URBAN", year: "2024" },
  { img: "assets/awards/records-winner.png", title: "Рекорды рынка недвижимости", year: "Победитель" },
  { img: "assets/awards/diploma-ptica.png", title: "Crimea Urban Awards — ПТИЦА", year: "Лучший комплекс" },
];

function OurAwards() {
  return (
    <section id="awards" className="relative isolate overflow-hidden bg-brand-ink py-16 text-white md:py-20">
      {/* рендер-фон (g1 — синий час, тёмный; не повторяется в других секциях) */}
      <img src="assets/gallery/g1.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/80 to-brand-ink/70" />

      <div className="relative mx-auto max-w-[1320px] px-6 md:px-10">
        {/* шапка — компактная */}
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal><Eyebrow light>Признание отрасли</Eyebrow></Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-3 font-display text-[clamp(30px,4.6vw,56px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white">
                Наши <span className="text-sky-300">награды</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-md text-[14px] font-medium leading-relaxed text-white/65">
              Победители и финалисты ведущих отраслевых премий — URBAN Awards,
              Рекорды рынка недвижимости, Crimea Urban Awards.
            </p>
          </Reveal>
        </div>

        {/* бейджи в один ряд — белые карточки на тёмном рендере */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {AWARD_BADGES.map((a, i) => (
            <Reveal key={a.title + a.year} delay={0.06 + (i % 5) * 0.05}>
              <div className="group flex h-full flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-1 md:p-5">
                <div className="flex h-[88px] items-center justify-center md:h-[104px]">
                  <img src={a.img} alt={a.title} loading="lazy" className="max-h-full w-auto max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div>
                  <h3 className="font-display text-[12.5px] font-extrabold uppercase leading-tight tracking-tight text-foreground">{a.title}</h3>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-blue">{a.year}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* только уникальные рендеры — не повторяются в других секциях
   (проекты: skysoul/santerra/ptica/olympia/meddirt; блок 2: g2; награды: g1; g6 — двойник skysoul, не используем) */
/* галерея — 5 рендеров на каждый объект (25), чередование для слайдера */
const GALLERY_IMAGES = [
  { src: "assets/gallery/g1.jpg", cap: "САНТЕРРА · башни у моря" },
  { src: "assets/gallery/g6.jpg", cap: "SKYSOUL · Коктебель на закате" },
  { src: "assets/gallery/g5.jpg", cap: "ПТИЦА · первая береговая линия" },
  { src: "assets/gallery/g8.jpg", cap: "МЕДДИРТ · вид с высоты" },
  { src: "assets/gallery/g7.jpg", cap: "ОЛИМПИЯ · городской квартал" },

  { src: "assets/gallery/g3.jpg", cap: "САНТЕРРА · курортная среда" },
  { src: "assets/gallery/skysoul-1.jpg", cap: "SKYSOUL · вечерние огни комплекса" },
  { src: "assets/gallery/ptica-1.jpg", cap: "ПТИЦА · закат над морем" },
  { src: "assets/gallery/g14.jpg", cap: "МЕДДИРТ · вилла на первой линии" },
  { src: "assets/gallery/g15.jpg", cap: "ОЛИМПИЯ · архитектурный ансамбль" },

  { src: "assets/gallery/g4.jpg", cap: "САНТЕРРА · приватные бассейны" },
  { src: "assets/gallery/skysoul-2.jpg", cap: "SKYSOUL · авторская архитектура" },
  { src: "assets/gallery/ptica-2.jpg", cap: "ПТИЦА · вид на комплекс" },
  { src: "assets/gallery/meddirt-1.jpg", cap: "МЕДДИРТ · зоны отдыха у воды" },
  { src: "assets/gallery/g16.jpg", cap: "ОЛИМПИЯ · улица внутри квартала" },

  { src: "assets/gallery/g11.jpg", cap: "САНТЕРРА · бассейны между башнями" },
  { src: "assets/gallery/skysoul-3.jpg", cap: "SKYSOUL · пляж и набережная" },
  { src: "assets/gallery/ptica-3.jpg", cap: "ПТИЦА · санаторный корпус" },
  { src: "assets/gallery/meddirt-2.jpg", cap: "МЕДДИРТ · ресторан и лаунж" },
  { src: "assets/gallery/g17.jpg", cap: "ОЛИМПИЯ · парадный фасад" },

  { src: "assets/gallery/g12.jpg", cap: "САНТЕРРА · панорама с моря" },
  { src: "assets/gallery/skysoul-4.jpg", cap: "SKYSOUL · резиденции у моря" },
  { src: "assets/gallery/ptica-4.jpg", cap: "ПТИЦА · курортная архитектура" },
  { src: "assets/gallery/meddirt-3.jpg", cap: "МЕДДИРТ · аквазона у моря" },
  { src: "assets/gallery/olympia-1.jpg", cap: "ОЛИМПИЯ · закрытый квартал" },
];

const gallerySlide: Variants = {
  enter: (d: number) => ({ opacity: 0, scale: 1.05, x: d > 0 ? "5%" : "-5%" }),
  center: { opacity: 1, scale: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, scale: 1.02, x: d > 0 ? "-5%" : "5%" }),
};

function GalleryFullscreen() {
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const n = GALLERY_IMAGES.length;
  const go = (d: number) => setState(([v]) => [(v + d + n) % n, d]);
  const jump = (to: number) => setState(([v]) => [to, to > v ? 1 : -1]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  const cur = GALLERY_IMAGES[idx];

  return (
    <section id="gallery" className="relative bg-brand-ink">
      <div className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        {/* слайд на весь экран */}
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={gallerySlide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0"
          >
            <img src={cur.src} alt={cur.cap} className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>

        {/* свайп-слой (тащить влево/вправо) */}
        <motion.div
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) go(1);
            else if (info.offset.x > 70) go(-1);
          }}
        />

        {/* затемнения для читаемости */}
        <div className="pointer-events-none absolute inset-0 z-[11] bg-gradient-to-t from-brand-ink/85 via-transparent to-brand-ink/45" />

        {/* заголовок */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-6 md:p-10">
          <Eyebrow light>Галерея проектов</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(30px,5vw,64px)] font-extrabold uppercase leading-[0.92] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Проекты в кадре
          </h2>
        </div>

        {/* стрелки по бокам (десктоп) */}
        <button onClick={() => go(-1)} aria-label="Предыдущий" className="absolute left-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-blue md:grid lg:left-8">
          <ArrowRight className="h-6 w-6 rotate-180" />
        </button>
        <button onClick={() => go(1)} aria-label="Следующий" className="absolute right-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-blue md:grid lg:right-8">
          <ArrowRight className="h-6 w-6" />
        </button>

        {/* низ: подпись, счётчик, мобильные кнопки */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-6 md:p-10">
          <div>
            <p className="font-display text-[clamp(18px,2.4vw,30px)] font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
              {cur.cap}
            </p>
            <p className="mt-1.5 font-num text-sm font-bold tabular-nums text-sky-200">
              {String(idx + 1).padStart(2, "0")} <span className="text-white/40">/ {String(n).padStart(2, "0")}</span>
            </p>
          </div>
          <div className="flex gap-3 md:hidden">
            <button onClick={() => go(-1)} aria-label="Предыдущий" className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur active:bg-white active:text-brand-blue">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button onClick={() => go(1)} aria-label="Следующий" className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur active:bg-white active:text-brand-blue">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* индикаторы-полоски */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-0 justify-center gap-1.5 pb-2 md:hidden">
          {GALLERY_IMAGES.map((_, i) => (
            <span key={i} className={cn("h-1 rounded-full transition-all", i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40")} />
          ))}
        </div>
      </div>

      {/* миниатюры-переключатели (десктоп) */}
      <div className="mx-auto hidden max-w-[1500px] gap-2.5 px-6 py-5 md:flex md:px-10">
        {GALLERY_IMAGES.map((g, i) => (
          <button
            key={g.src}
            onClick={() => jump(i)}
            aria-label={g.cap}
            className={cn(
              "relative h-14 flex-1 overflow-hidden rounded-lg transition-all duration-300",
              i === idx ? "ring-2 ring-brand-blue ring-offset-2 ring-offset-brand-ink" : "opacity-50 hover:opacity-100"
            )}
          >
            <img src={g.src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}

function DirectorSectionPremium() {
  return (
    <section className="relative overflow-hidden bg-brand-ink">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        {/* ЛЕВО — большое фото на всю высоту, акцент на личности */}
        <div className="relative min-h-[64vh] overflow-hidden bg-brand-ink lg:min-h-[92vh]">
          <motion.img
            src="assets/team/shatskih.jpg"
            alt="Алексей Шацких"
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/10 to-transparent" />
          {/* вертикальный тег */}
          <span className="absolute left-7 top-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Основатель
          </span>
          {/* имя крупно по низу */}
          <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
            <Reveal>
              <p className="font-display text-[clamp(30px,4.4vw,58px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                Алексей<br />Шацких
              </p>
              <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.22em] text-sky-200">Вице-президент группы компаний</p>
            </Reveal>
          </div>
        </div>

        {/* ПРАВО — светлая панель: наш синий читается, акцент на цифрах */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-sky-50/45 to-white px-7 py-16 md:px-14 lg:py-20">
          <div className="pointer-events-none absolute right-4 top-0 select-none font-display text-[clamp(140px,18vw,260px)] leading-none text-brand-blue/[0.07]">”</div>
          <div className="relative max-w-xl">
            <Reveal><Eyebrow>Слово руководителя</Eyebrow></Reveal>
            <Reveal delay={0.08}>
              <blockquote className="mt-7 font-display text-[clamp(27px,3.6vw,54px)] font-extrabold leading-[1.1] tracking-tight text-foreground">
                Мы создаём пространства, которые становятся
                <span className="text-brand-blue"> точками притяжения для миллионов</span>.
              </blockquote>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-8 max-w-lg text-[16px] font-medium leading-relaxed text-muted-foreground md:text-[18px]">
                Потомственный девелопер и новатор. Под его руководством компания формирует
                экосистему курортной среды юга России — от земли и проектирования до управления гостеприимством.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-12 grid grid-cols-3 gap-5 border-t border-brand-blue/12 pt-10">
                {[["14", "", "масштабных проектов"], ["397 000", "+ м²", "введено в эксплуатацию"], ["295", "+ га", "земельный банк"]].map(([n, suf, l]) => (
                  <div key={l} className="min-w-0">
                    <p className="flex items-baseline whitespace-nowrap font-num font-extrabold leading-none text-brand-blue">
                      <span className="text-[clamp(17px,2.3vw,34px)] tabular-nums">{n}</span>
                      <span className="text-[clamp(10px,1vw,15px)] text-brand-teal">{suf}</span>
                    </p>
                    <p className="mt-2.5 text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ROUTING + STANDALONE PAGES (hash-based — работает на GitHub Pages)
   ============================================================ */
type Route = "home" | "news" | "privacy" | "legal";
function useRoute(): Route {
  const read = (): Route => {
    const h = window.location.hash;
    if (h.startsWith("#/news")) return "news";
    if (h.startsWith("#/privacy")) return "privacy";
    if (h.startsWith("#/legal")) return "legal";
    return "home";
  };
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

function PageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue/10 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-6 md:px-10">
        <a href="#/" className="flex items-baseline gap-1.5 font-display">
          <span className="text-[17px] font-extrabold tracking-tight text-foreground">СКАЙГРУПП</span>
          <span className="text-[17px] font-semibold tracking-tight text-muted-foreground">ДЕВЕЛОПМЕНТ</span>
        </a>
        <a href="#/" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-blue transition-colors hover:text-brand-teal">
          <ArrowRight className="h-4 w-4 rotate-180" /> На главную
        </a>
      </div>
    </header>
  );
}

function NewsPage() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <main className="mx-auto max-w-[1360px] px-6 py-16 md:px-10 md:py-24">
        <Eyebrow>Медиа</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(34px,5vw,68px)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground">
          Новости СКАЙГРУПП девелопмент
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] font-medium leading-relaxed text-muted-foreground">
          Главные события, проекты и достижения СКАЙГРУПП ДЕВЕЛОПМЕНТ.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NEWS.map((n, i) => (
            <NewsCard key={n.title} n={n} delay={(i % 3) * 0.05} onOpen={() => setActive(i)} />
          ))}
        </div>
      </main>
      <Footer />
      <NewsModal news={active != null ? NEWS[active] : null} onClose={() => setActive(null)} />
    </div>
  );
}

const PRIVACY = {
  eyebrow: "Правовая информация",
  title: "Политика конфиденциальности",
  updated: "Действует с 2026 года",
  sections: [
    { h: "1. Общие положения", p: [
      "Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта СКАЙГРУПП ДЕВЕЛОПМЕНТ (далее — Компания). Используя сайт и оставляя свои данные в формах обратной связи, пользователь подтверждает согласие с условиями настоящей Политики.",
      "Обработка персональных данных осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».",
    ] },
    { h: "2. Какие данные мы собираем", p: [
      "Компания обрабатывает данные, которые пользователь предоставляет добровольно: имя, номер телефона, адрес электронной почты, а также сведения об интересующем проекте. Дополнительно могут автоматически собираться технические данные (cookie, IP-адрес, сведения о браузере) в обезличенном виде.",
    ] },
    { h: "3. Цели обработки", p: [
      "Персональные данные обрабатываются для обратной связи с пользователем, консультирования по проектам Компании, обработки заявок и повышения качества сервиса. Компания не использует данные для целей, не совместимых с указанными.",
    ] },
    { h: "4. Передача третьим лицам", p: [
      "Компания не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Российской Федерации, либо с согласия пользователя.",
    ] },
    { h: "5. Хранение и защита", p: [
      "Компания принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа, изменения, раскрытия или уничтожения. Данные хранятся не дольше, чем этого требуют цели обработки.",
    ] },
    { h: "6. Права пользователя", p: [
      "Пользователь вправе запросить информацию об обработке своих данных, потребовать их уточнения, блокирования или удаления, а также отозвать согласие на обработку, направив обращение по адресу pr@skygk.ru.",
    ] },
    { h: "7. Контакты", p: [
      "По вопросам обработки персональных данных: pr@skygk.ru, +7 (918) 029-39-99, Республика Крым.",
    ] },
  ],
};

const LEGAL = {
  eyebrow: "Правовая информация",
  title: "Правовая информация",
  updated: "Действует с 2026 года",
  sections: [
    { h: "Материалы сайта", p: [
      "Все материалы, размещённые на сайте СКАЙГРУПП ДЕВЕЛОПМЕНТ, носят информационный характер и не являются публичной офертой, определяемой положениями статьи 437 Гражданского кодекса Российской Федерации.",
    ] },
    { h: "Изображения и визуализации", p: [
      "Архитектурные визуализации, рендеры и планировки представлены в ознакомительных целях. Внешний вид, характеристики, площади и иные параметры объектов могут отличаться от итоговой реализации. Точные условия приобретения уточняйте у менеджеров Компании.",
    ] },
    { h: "Интеллектуальная собственность", p: [
      "Названия проектов, товарные знаки, логотипы и фирменный стиль являются объектами интеллектуальной собственности и не могут использоваться без письменного согласия правообладателя. Использование материалов сайта допускается только со ссылкой на источник.",
    ] },
    { h: "Контактная информация", p: [
      "СКАЙГРУПП ДЕВЕЛОПМЕНТ. Республика Крым. Телефон: +7 (918) 029-39-99. E-mail: pr@skygk.ru.",
    ] },
  ],
};

function LegalPage({ kind }: { kind: "privacy" | "legal" }) {
  const data = kind === "privacy" ? PRIVACY : LEGAL;
  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(28px,4.2vw,52px)] font-extrabold uppercase leading-[1.02] tracking-tight text-foreground">{data.title}</h1>
        <p className="mt-4 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">{data.updated}</p>
        <div className="mt-10 space-y-8">
          {data.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-foreground">{s.h}</h2>
              {s.p.map((p, j) => <p key={j} className="mt-3 text-[15px] font-medium leading-relaxed text-foreground/75">{p}</p>)}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const route = useRoute();
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

  if (route === "news") return <NewsPage />;
  if (route === "privacy") return <LegalPage kind="privacy" />;
  if (route === "legal") return <LegalPage kind="legal" />;

  return (
    <div className="relative bg-background">
      <Navbar onCta={goContacts} />
      <main>
        <Hero onCta={goContacts} />
        <DeveloperIntroPremium />
        <Projects onOpen={setActiveName} />
        <AboutAdvantages />
        <Metrics />
        <MapSection onOpen={setActiveName} />
        <GalleryFullscreen />
        <DirectorSectionPremium />
        <Team />
        <OurAwards />
        <News />
        <CTASection />
        <Footer />
      </main>
      <ObjectModal obj={activeObj} onClose={() => setActiveName(null)} onRequest={() => { setActiveName(null); setTimeout(goContacts, 250); }} />
    </div>
  );
}
