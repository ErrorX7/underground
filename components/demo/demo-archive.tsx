"use client";

import {
  CalendarDays,
  Check,
  ImagePlus,
  Grid2X2,
  Map as MapIcon,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Route,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import chinaGeo from "@/data/china-geo.json";

type PerformanceType = "livehouse" | "bar" | "arena";
type TicketMethod = "official" | "proxy" | "resale" | "scalper" | "gift" | "other";
type ViewMode = "archive" | "map";

type DemoPerformance = {
  id: string;
  title: string;
  artist: string;
  guest: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  type: PerformanceType;
  price: number;
  ticketMethod?: TicketMethod;
  actualPrice?: number;
  ticketSource?: string;
  cover: string;
  line: string;
  note: string;
  timeline: { phase: string; date?: string; time: string; emoji?: string; title: string; content: string; image?: string }[];
  media: string[];
};

const STORAGE_KEY = "stage-archive-demo-v1";

const covers = [
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1521334726092-b509a19597c6?auto=format&fit=crop&w=1200&q=85",
];

const media = [
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1507901747481-84a4f64fda6d?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=85",
];

const seedPerformances: DemoPerformance[] = [
  {
    id: "demo-hangzhou",
    title: "《飞蚊症》巡演 · 杭州站",
    artist: "Coola",
    guest: "Special Guest",
    date: "2026-08-01",
    time: "20:00",
    city: "杭州",
    venue: "大麦 66Livehouse",
    type: "livehouse",
    price: 288,
    cover: covers[0],
    line: "海上漂浮的空瓶，载满爱的信号，最后变成指路的灯火。",
    note: "从第一首歌响起，舞台像一片缓慢涨潮的海。散场以后没有马上离开，在门口把最后一点回声听完。",
    timeline: [
      { phase: "演出前", emoji: "🎟️", time: "16:40", title: "抵达杭州", content: "天气很热，背着相机沿着场馆外墙找入口。", image: media[1] },
      { phase: "演出中", emoji: "🎤", time: "21:18", title: "灯火亮起", content: "全场的手机灯一起晃，像漂浮在黑色海面上的信号。", image: media[0] },
      { phase: "演出后", emoji: "🌙", time: "23:26", title: "带着耳鸣回去", content: "在便利店买了冰水，舍不得摘掉手环。", image: media[3] },
    ],
    media: [media[0], media[1], media[3]],
  },
  {
    id: "demo-shanghai",
    title: "GOOD NEWS! LIVE",
    artist: "Kc / DJ Fader",
    guest: "Nineone",
    date: "2026-05-18",
    time: "20:30",
    city: "上海",
    venue: "MAO Livehouse",
    type: "livehouse",
    price: 320,
    cover: covers[1],
    line: "那晚的低频还留在胸口，散场以后耳朵里全是混响。",
    note: "入口的灯很暗，人群比想象中安静。第一下鼓进来以后，整个空间突然变成同一个呼吸。",
    timeline: [
      { phase: "演出前", emoji: "🎟️", time: "18:12", title: "排队进场", content: "认识了旁边同样一个人来看演出的女生。" },
      { phase: "演出中", emoji: "🎤", time: "20:47", title: "第一轮合唱", content: "歌词从四面八方压过来，第一次觉得陌生人也能共享记忆。" },
      { phase: "演出后", emoji: "🌙", time: "22:58", title: "夜宵", content: "走了两条街才找到还开着的面馆。" },
    ],
    media: [media[2], media[4]],
  },
  {
    id: "demo-nanjing",
    title: "走出荒野",
    artist: "Wild Tape",
    guest: "",
    date: "2025-12-06",
    time: "19:30",
    city: "南京",
    venue: "1701 Live House",
    type: "livehouse",
    price: 228,
    cover: covers[2],
    line: "THE WILDS 出现的那几秒，像有人在黑暗里写下出口。",
    note: "冬天的南京很冷，但场馆里挤得像夏天。最喜欢的并不是安可，而是灯暗下来的第一秒。",
    timeline: [
      { phase: "演出前", emoji: "🎟️", time: "17:50", title: "老门东散步", content: "喝了一杯太甜的热饮，手一直揣在口袋里。" },
      { phase: "演出中", emoji: "🎤", time: "20:06", title: "主舞台开场", content: "白色线条在屏幕上慢慢拼出 THE WILDS。" },
      { phase: "演出后", emoji: "🌙", time: "22:20", title: "末班地铁", content: "车厢很安静，脑子里却还在自动重播。" },
    ],
    media: [media[1], media[2], media[0]],
  },
  {
    id: "demo-beijing",
    title: "凌晨飞行计划",
    artist: "Noon Young",
    guest: "Melo",
    date: "2025-10-24",
    time: "20:00",
    city: "北京",
    venue: "福浪 LIVEHOUSE",
    type: "livehouse",
    price: 360,
    cover: covers[3],
    line: "两团光靠近以后，一架飞机从舞台中央飞了出来。",
    note: "视觉做得像一场短电影。最喜欢中段突然出现的巨大蓝绿色地球，整个场馆都安静了一秒。",
    timeline: [
      { phase: "演出前", emoji: "🎟️", time: "15:30", title: "提前到场", content: "在附近咖啡店整理相机和充电宝。" },
      { phase: "演出中", emoji: "🎤", time: "21:02", title: "凌晨", content: "两团飞蚊靠近、合并，飞机冲出屏幕。" },
      { phase: "演出后", emoji: "🌙", time: "23:10", title: "打车回酒店", content: "窗外的路灯一盏一盏倒退。" },
    ],
    media: [media[3], media[0]],
  },
  {
    id: "demo-changzhou",
    title: "屋顶上的人",
    artist: "Soft Error",
    guest: "",
    date: "2025-08-16",
    time: "19:45",
    city: "常州",
    venue: "迷宫艺术空间",
    type: "bar",
    price: 168,
    cover: covers[4],
    line: "世界太大，但今晚不用害怕。",
    note: "规模不大，反而能看见每个表情。唱到最后一首时，主唱坐在舞台边沿和大家聊天。",
    timeline: [
      { phase: "演出前", emoji: "🎟️", time: "18:30", title: "下班直奔现场", content: "把工牌塞进包里，站在队伍里才觉得今天结束了。" },
      { phase: "演出中", emoji: "🎤", time: "20:35", title: "屋顶", content: "舞台上方出现像屋檐一样的白色线条。" },
      { phase: "演出后", emoji: "🌙", time: "22:12", title: "骑车回家", content: "晚风很凉，路上一直哼副歌。" },
    ],
    media: [media[4], media[1]],
  },
  {
    id: "demo-chengdu",
    title: "城市噪音节",
    artist: "Various Artists",
    guest: "",
    date: "2025-04-05",
    time: "17:00",
    city: "成都",
    venue: "凤凰山体育公园",
    type: "arena",
    price: 680,
    cover: covers[5],
    line: "一整天的声音、人群和太阳，被压进同一张票根。",
    note: "第一次看这么长的拼盘演出。中途累得坐在草地上，但到了最后一组还是站起来挤回人群。",
    timeline: [
      { phase: "演出前", emoji: "🎟️", time: "14:10", title: "入场", content: "安检队伍绕了很远，进场后先去找水。" },
      { phase: "演出中", emoji: "🎤", time: "19:40", title: "日落舞台", content: "太阳落到舞台侧面，所有人的影子被拉得很长。" },
      { phase: "演出后", emoji: "🌙", time: "23:48", title: "散场大军", content: "和几万人一起慢慢往地铁站移动。" },
    ],
    media: [media[2], media[3], media[4]],
  },
];

const typeLabels: Record<PerformanceType, string> = {
  livehouse: "Livehouse",
  bar: "酒吧商演",
  arena: "体育馆",
};

const ticketMethodLabels: Record<TicketMethod, string> = {
  official: "官方购票",
  proxy: "代拍",
  resale: "二手转票",
  scalper: "黄牛收票",
  gift: "赠票",
  other: "其他方式",
};

const emojiOptions = ["", "🎟️", "✨", "🎤", "📸", "🚆", "🍜", "💭", "❤️", "😭", "🔥", "🌙"];

type Coordinate = [number, number];
type GeoGeometry =
  | { type: "Polygon"; coordinates: Coordinate[][] }
  | { type: "MultiPolygon"; coordinates: Coordinate[][][] };
type ChinaFeature = {
  type: "Feature";
  properties: { adcode: number | string; name: string };
  geometry: GeoGeometry;
};
type CityMapMeta = { province: string; coordinate: Coordinate };

const MAP_WIDTH = 760;
const MAP_HEIGHT = 540;
const chinaFeatures = (chinaGeo as unknown as { features: ChinaFeature[] }).features;
const provinceFeatures = chinaFeatures.filter((feature) => typeof feature.properties.adcode === "number");

const cityMapMeta: Record<string, CityMapMeta> = {
  北京: { province: "北京市", coordinate: [116.4074, 39.9042] },
  天津: { province: "天津市", coordinate: [117.2009, 39.0842] },
  上海: { province: "上海市", coordinate: [121.4737, 31.2304] },
  重庆: { province: "重庆市", coordinate: [106.5516, 29.563] },
  南京: { province: "江苏省", coordinate: [118.7969, 32.0603] },
  苏州: { province: "江苏省", coordinate: [120.5853, 31.2989] },
  常州: { province: "江苏省", coordinate: [119.9741, 31.8112] },
  无锡: { province: "江苏省", coordinate: [120.3119, 31.4912] },
  扬州: { province: "江苏省", coordinate: [119.421, 32.3932] },
  徐州: { province: "江苏省", coordinate: [117.2841, 34.2058] },
  杭州: { province: "浙江省", coordinate: [120.1551, 30.2741] },
  宁波: { province: "浙江省", coordinate: [121.5503, 29.8746] },
  温州: { province: "浙江省", coordinate: [120.6994, 27.9943] },
  广州: { province: "广东省", coordinate: [113.2644, 23.1291] },
  深圳: { province: "广东省", coordinate: [114.0579, 22.5431] },
  佛山: { province: "广东省", coordinate: [113.1214, 23.0215] },
  珠海: { province: "广东省", coordinate: [113.5767, 22.2707] },
  成都: { province: "四川省", coordinate: [104.0665, 30.5728] },
  武汉: { province: "湖北省", coordinate: [114.3054, 30.5931] },
  长沙: { province: "湖南省", coordinate: [112.9388, 28.2282] },
  西安: { province: "陕西省", coordinate: [108.9398, 34.3416] },
  郑州: { province: "河南省", coordinate: [113.6254, 34.7466] },
  济南: { province: "山东省", coordinate: [117.1205, 36.6512] },
  青岛: { province: "山东省", coordinate: [120.3826, 36.0671] },
  合肥: { province: "安徽省", coordinate: [117.2272, 31.8206] },
  福州: { province: "福建省", coordinate: [119.2965, 26.0745] },
  厦门: { province: "福建省", coordinate: [118.0894, 24.4798] },
  南昌: { province: "江西省", coordinate: [115.8582, 28.6829] },
  沈阳: { province: "辽宁省", coordinate: [123.4315, 41.8057] },
  大连: { province: "辽宁省", coordinate: [121.6147, 38.914] },
  长春: { province: "吉林省", coordinate: [125.3235, 43.8171] },
  哈尔滨: { province: "黑龙江省", coordinate: [126.5349, 45.8038] },
  昆明: { province: "云南省", coordinate: [102.8329, 24.8801] },
  贵阳: { province: "贵州省", coordinate: [106.6302, 26.647] },
  南宁: { province: "广西壮族自治区", coordinate: [108.3665, 22.817] },
  海口: { province: "海南省", coordinate: [110.1983, 20.044] },
  三亚: { province: "海南省", coordinate: [109.5119, 18.2528] },
  石家庄: { province: "河北省", coordinate: [114.5149, 38.0428] },
  太原: { province: "山西省", coordinate: [112.5489, 37.8706] },
  呼和浩特: { province: "内蒙古自治区", coordinate: [111.7492, 40.8426] },
  兰州: { province: "甘肃省", coordinate: [103.8343, 36.0611] },
  西宁: { province: "青海省", coordinate: [101.7782, 36.6171] },
  银川: { province: "宁夏回族自治区", coordinate: [106.2309, 38.4872] },
  乌鲁木齐: { province: "新疆维吾尔自治区", coordinate: [87.6168, 43.8256] },
  拉萨: { province: "西藏自治区", coordinate: [91.1409, 29.6456] },
  台北: { province: "台湾省", coordinate: [121.5654, 25.033] },
  香港: { province: "香港特别行政区", coordinate: [114.1694, 22.3193] },
  澳门: { province: "澳门特别行政区", coordinate: [113.5439, 22.1987] },
};

const cityLabelOffsets: Record<string, Coordinate> = {
  南京: [-28, -10],
  常州: [-8, 8],
  杭州: [-4, 20],
  上海: [30, -12],
  广州: [-18, 12],
  深圳: [22, 8],
};

function normalizeCityName(city: string) {
  return city.trim().replace(/[市区县]$/, "");
}

function cityMetaOf(city: string) {
  return cityMapMeta[normalizeCityName(city)];
}

function projectChinaPoint([longitude, latitude]: Coordinate): Coordinate {
  const padding = 24;
  const minLongitude = 72;
  const maxLongitude = 136;
  const minLatitude = 16;
  const maxLatitude = 54.5;
  return [
    padding + ((longitude - minLongitude) / (maxLongitude - minLongitude)) * (MAP_WIDTH - padding * 2),
    padding + ((maxLatitude - latitude) / (maxLatitude - minLatitude)) * (MAP_HEIGHT - padding * 2),
  ];
}

function geometryToPath(geometry: GeoGeometry, project: (coordinate: Coordinate) => Coordinate) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .flatMap((polygon) =>
      polygon.map((ring) =>
        ring
          .map((coordinate, index) => {
            const [x, y] = project(coordinate);
            return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ") + " Z",
      ),
    )
    .join(" ");
}

const provincePathData = provinceFeatures.map((feature) => ({
  name: feature.properties.name,
  d: geometryToPath(feature.geometry, projectChinaPoint),
}));
function provinceHeatColor(count: number) {
  if (count >= 7) return "#7c2d1d";
  if (count >= 4) return "#aa5138";
  if (count >= 2) return "#d28a70";
  if (count >= 1) return "#ead0c4";
  return "#eeeae2";
}

function optionalAmount(form: FormData, name: string) {
  const raw = String(form.get(name) ?? "").trim();
  if (!raw) return undefined;
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : undefined;
}

function formatMoney(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.00$/, "");
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function DemoArchive({ initialView = "archive" }: { initialView?: ViewMode }) {
  const [records, setRecords] = useState<DemoPerformance[]>(seedPerformances);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<ViewMode>(initialView);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PerformanceType | "all">("all");
  const [selected, setSelected] = useState<DemoPerformance | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DemoPerformance[];
        setRecords(parsed.map((record) => ({
          ...record,
          timeline: record.timeline.map((item) => ({
            ...item,
            date: item.date ?? record.date,
            emoji: item.emoji ?? "",
          })),
        })));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [hydrated, records]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return [...records]
      .filter((record) => type === "all" || record.type === type)
      .filter((record) =>
        [record.title, record.artist, record.city, record.venue]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [query, records, type]);

  const cityGroups = useMemo(() => {
    return records.reduce<Record<string, DemoPerformance[]>>((groups, record) => {
      groups[record.city] = [...(groups[record.city] ?? []), record];
      return groups;
    }, {});
  }, [records]);

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = window.crypto?.randomUUID?.() ?? String(Date.now());
    const cover = String(form.get("cover") ?? "").trim() || covers[records.length % covers.length];
    const performanceDate = String(form.get("date") ?? "");
    const next: DemoPerformance = {
      id,
      title: String(form.get("title") ?? "").trim(),
      artist: String(form.get("artist") ?? "").trim(),
      guest: String(form.get("guest") ?? "").trim(),
      date: performanceDate,
      time: String(form.get("time") ?? ""),
      city: String(form.get("city") ?? "").trim(),
      venue: String(form.get("venue") ?? "").trim(),
      type: String(form.get("type") ?? "livehouse") as PerformanceType,
      price: optionalAmount(form, "price") ?? 0,
      ticketMethod: (String(form.get("ticketMethod") ?? "") || undefined) as TicketMethod | undefined,
      actualPrice: optionalAmount(form, "actualPrice"),
      ticketSource: String(form.get("ticketSource") ?? "").trim(),
      cover,
      line: String(form.get("line") ?? "").trim(),
      note: "这是一条保存在当前浏览器里的 Demo 记录。打开详情后可以继续修改观后记。",
      timeline: [
        { phase: "演出前", date: performanceDate, emoji: "🎟️", time: "", title: "等待补充", content: "记下出发、排队或见到朋友的瞬间。" },
        { phase: "演出中", date: performanceDate, emoji: "🎤", time: "", title: "等待补充", content: "记下最想保留的一首歌或一个画面。" },
        { phase: "演出后", date: performanceDate, emoji: "🌙", time: "", title: "等待补充", content: "记下散场后的心情。" },
      ],
      media: [cover],
    };
    setRecords((current) => [next, ...current]);
    setCreateOpen(false);
    event.currentTarget.reset();
    setSelected(next);
  }

  function updateRecord(next: DemoPerformance) {
    setRecords((current) => current.map((item) => (item.id === next.id ? next : item)));
    setSelected(next);
  }

  function updateNote(id: string, note: string) {
    const current = records.find((item) => item.id === id);
    if (current) updateRecord({ ...current, note });
  }

  function resetDemo() {
    if (!window.confirm("恢复最初的 6 条示例记录？当前浏览器里新增和修改的内容会被清除。")) return;
    setRecords(seedPerformances);
    setSelected(null);
  }

  return (
    <div className="relative z-10 min-h-screen bg-[#f6f4ef] text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-2xl md:px-[4vw]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
          <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => setView("archive")}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-300 bg-[repeating-radial-gradient(circle_at_center,#d4d4d8_0_1px,#fafafa_1px_5px)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] after:h-1.5 after:w-1.5 after:rounded-full after:bg-zinc-950 after:shadow-[0_0_22px_rgba(216,102,69,0.75)]" />
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.14em]">Underground</span>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:block">Personal live memory</span>
            </span>
          </button>

          <nav className="absolute bottom-[-57px] left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-200 bg-white/95 p-1 shadow-2xl backdrop-blur-xl md:static md:translate-x-0">
            <NavButton active={view === "archive"} onClick={() => setView("archive")} icon={<Grid2X2 className="h-4 w-4" />} label="记录墙" />
            <NavButton active={view === "map"} onClick={() => setView("map")} icon={<MapIcon className="h-4 w-4" />} label="地图记忆" />
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700 lg:block">
              Demo · 本地保存
            </span>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-900 bg-zinc-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,24,27,0.18)]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">新建演出</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-20 md:px-[4vw] md:pt-12">
        {view === "archive" ? (
          <>
            <section className="page-in mb-10 grid items-end gap-8 border-b border-zinc-200 pb-9 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#a44b32]">Personal performance archive</p>
                <h1 className="max-w-[920px] text-[clamp(40px,6.2vw,88px)] font-black leading-[0.87] tracking-[-0.055em]">
                  Underground
                  <span className="block text-zinc-500">Live for the Live</span>
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat value={records.length} label="场演出" />
                <Stat value={Object.keys(cityGroups).length} label="座城市" />
                <Stat value={records.reduce((sum, record) => sum + record.media.length, 0)} label="份影像" />
              </div>
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索演出、艺人、城市或场馆"
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50"
                  />
                </label>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as PerformanceType | "all")}
                  className="h-12 min-w-44 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-700 outline-none focus:border-zinc-900"
                >
                  <option value="all">全部现场类型</option>
                  <option value="livehouse">Livehouse</option>
                  <option value="bar">酒吧商演</option>
                  <option value="arena">体育馆</option>
                </select>
                <button
                  onClick={resetDemo}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-black"
                >
                  <RotateCcw className="h-4 w-4" /> 恢复示例
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((record, index) => (
                  <article
                    key={record.id}
                    onClick={() => setSelected(record)}
                    className="group cursor-pointer overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1.5 hover:border-zinc-300 hover:bg-white hover:shadow-[0_24px_55px_rgba(42,34,23,0.14)]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={record.cover} alt={record.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-xl">
                        {typeLabels[record.type]}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="mb-2 text-xs text-white/75">{record.date.replaceAll("-", ".")} · {record.city}</p>
                        <h2 className="text-[22px] font-black leading-[1.05] tracking-[-0.025em]">{record.title}</h2>
                        <p className="mt-2 text-sm text-white/75">{record.artist}</p>
                      </div>
                    </div>
                    <div className="min-h-24 p-4">
                      <p className="line-clamp-2 text-sm leading-6 text-zinc-600">“{record.line || "这一晚还没有写下一句话。"}”</p>
                    </div>
                  </article>
                ))}
              </div>

              {!filtered.length ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center text-zinc-600">没有找到符合条件的演出记录。</div>
              ) : null}
            </section>
          </>
        ) : (
          <MapView cityGroups={cityGroups} onSelect={setSelected} />
        )}
      </main>

      {createOpen ? <CreateModal onClose={() => setCreateOpen(false)} onSubmit={addRecord} /> : null}
      {selected ? <DetailModal record={selected} onClose={() => setSelected(null)} onSaveNote={updateNote} onSaveRecord={updateRecord} /> : null}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}
    >
      {icon}{label}
    </button>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-24 rounded-2xl border border-zinc-200 bg-white px-4 py-4">
      <strong className="block text-3xl font-black tracking-[-0.04em]">{String(value).padStart(2, "0")}</strong>
      <span className="mt-1 block text-xs text-zinc-500">{label}</span>
    </div>
  );
}

function MapView({ cityGroups, onSelect }: { cityGroups: Record<string, DemoPerformance[]>; onSelect: (record: DemoPerformance) => void }) {
  const allRecords = useMemo(() => Object.values(cityGroups).flat(), [cityGroups]);
  const years = useMemo(
    () => Array.from(new Set(allRecords.map((record) => record.date.slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)),
    [allRecords],
  );
  const [year, setYear] = useState("all");
  const [showRoute, setShowRoute] = useState(false);
  const filteredRecords = useMemo(
    () => year === "all" ? allRecords : allRecords.filter((record) => record.date.startsWith(year)),
    [allRecords, year],
  );
  const filteredCityGroups = useMemo(() => {
    return filteredRecords.reduce<Record<string, DemoPerformance[]>>((groups, record) => {
      groups[record.city] = [...(groups[record.city] ?? []), record];
      return groups;
    }, {});
  }, [filteredRecords]);
  const cities = useMemo(() => Object.keys(filteredCityGroups), [filteredCityGroups]);
  const [activeCity, setActiveCity] = useState(cities[0] ?? "");
  const activeRecords = filteredCityGroups[activeCity] ?? [];

  const provinceCounts = useMemo(() => {
    return filteredRecords.reduce<Record<string, number>>((counts, record) => {
      const province = cityMetaOf(record.city)?.province;
      if (province) counts[province] = (counts[province] ?? 0) + 1;
      return counts;
    }, {});
  }, [filteredRecords]);

  const mappedCities = useMemo(() => {
    return cities
      .map((city) => {
        const meta = cityMetaOf(city);
        if (!meta) return null;
        const [x, y] = projectChinaPoint(meta.coordinate);
        return { city, x, y, count: filteredCityGroups[city].length, province: meta.province };
      })
      .filter((item): item is { city: string; x: number; y: number; count: number; province: string } => Boolean(item));
  }, [cities, filteredCityGroups]);

  const routeStops = useMemo(() => {
    const stops: { city: string; x: number; y: number }[] = [];
    [...filteredRecords]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((record) => {
        const meta = cityMetaOf(record.city);
        if (!meta) return;
        const [x, y] = projectChinaPoint(meta.coordinate);
        const previous = stops[stops.length - 1];
        if (!previous || previous.city !== record.city) stops.push({ city: record.city, x, y });
      });
    return stops;
  }, [filteredRecords]);

  const latestMappedCity = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => b.date.localeCompare(a.date))
      .find((record) => cityMetaOf(record.city))?.city;
  }, [filteredRecords]);

  useEffect(() => {
    if (!filteredCityGroups[activeCity]) setActiveCity(cities[0] ?? "");
  }, [activeCity, cities, filteredCityGroups]);

  return (
    <section className="page-in">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a44b32]">MAP</p>
      </div>

      <div className="grid overflow-hidden rounded-[24px] border border-zinc-200 bg-white lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-h-[620px] bg-[radial-gradient(circle_at_58%_55%,rgba(216,102,69,0.12),transparent_22rem),linear-gradient(140deg,#fff,#f4f1e9)]">
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/75 p-4 backdrop-blur-xl">
            <div className="flex max-w-full gap-1 overflow-auto rounded-full border border-zinc-200 bg-white p-1">
              <button onClick={() => setYear("all")} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${year === "all" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>全部</button>
              {years.map((item) => (
                <button key={item} onClick={() => setYear(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${year === item ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>{item}</button>
              ))}
            </div>
            <button
              onClick={() => setShowRoute((current) => !current)}
              disabled={routeStops.length < 2}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-35 ${showRoute ? "border-[#a44b32] bg-[#a44b32] text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"}`}
            >
              <Route className="h-3.5 w-3.5" /> 足迹路线
            </button>
          </div>

          <div className="relative min-h-[552px] overflow-hidden">
            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full" role="img" aria-label="中国演出记忆热力地图">
              <g stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round">
                {provincePathData.map((province) => {
                  const count = provinceCounts[province.name] ?? 0;
                  const provinceCity = cities.find((city) => cityMetaOf(city)?.province === province.name);
                  return (
                    <path
                      key={province.name}
                      d={province.d}
                      fill={provinceHeatColor(count)}
                      className="transition duration-300 hover:brightness-95"
                      onClick={() => provinceCity && setActiveCity(provinceCity)}
                      style={{ cursor: provinceCity ? "pointer" : "default" }}
                    >
                      <title>{province.name}{count ? ` · ${count} 场` : " · 暂无记录"}</title>
                    </path>
                  );
                })}
              </g>

              {showRoute && routeStops.length > 1 ? (
                <polyline
                  points={routeStops.map((stop) => `${stop.x.toFixed(1)},${stop.y.toFixed(1)}`).join(" ")}
                  fill="none"
                  stroke="#a44b32"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="7 7"
                  opacity="0.78"
                />
              ) : null}

              {mappedCities.map(({ city, x, y, count }) => {
                const active = city === activeCity;
                const recent = city === latestMappedCity;
                const radius = 5 + Math.min(5, count * 1.25);
                const [labelDx, labelDy] = cityLabelOffsets[normalizeCityName(city)] ?? [0, 0];
                return (
                  <g
                    key={city}
                    role="button"
                    tabIndex={0}
                    aria-label={`${city}，${count} 场演出`}
                    onClick={() => setActiveCity(city)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setActiveCity(city);
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <circle cx={x} cy={y} r={18} fill="transparent" />
                    {recent ? (
                      <circle cx={x} cy={y} r={radius + 4} fill="none" stroke="#a44b32" strokeWidth="1.5" opacity="0.65">
                        <animate attributeName="r" values={`${radius + 3};${radius + 12};${radius + 3}`} dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.65;0.05;0.65" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    ) : null}
                    <circle cx={x} cy={y} r={radius} fill={active ? "#a44b32" : "#18181b"} stroke="#ffffff" strokeWidth="2.5" />
                    <text
                      x={x + labelDx}
                      y={y + radius + 15 + labelDy}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill={active ? "#7c2d1d" : "#27272a"}
                      style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.96)", strokeWidth: 4, strokeLinejoin: "round" }}
                    >
                      {city} · {count}
                    </text>
                  </g>
                );
              })}

            </svg>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-3 py-2 text-[10px] font-medium text-zinc-500 shadow-sm backdrop-blur-xl">
              <span>少</span>
              {["#eeeae2", "#ead0c4", "#d28a70", "#aa5138", "#7c2d1d"].map((color) => <span key={color} className="h-2.5 w-6 rounded-full" style={{ backgroundColor: color }} />)}
              <span>多</span>
            </div>
          </div>
        </div>

        <aside className="border-t border-zinc-200 bg-white/90 lg:border-l lg:border-t-0">
          <div className="border-b border-zinc-200 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#a44b32]">Selected city</p>
            <h2 className="mt-2 text-4xl font-black">{activeCity || "暂无城市"}</h2>
            <p className="mt-2 text-sm text-zinc-500">{activeRecords.length} 场演出记忆{year === "all" ? "" : ` · ${year}`}</p>
          </div>
          <div className="grid max-h-[480px] gap-3 overflow-auto p-4 lg:max-h-[510px]">
            {activeRecords.map((record) => (
              <button key={record.id} onClick={() => onSelect(record)} className="grid grid-cols-[82px_1fr] gap-3 rounded-xl border border-zinc-200 bg-white p-2 text-left transition hover:border-zinc-300 hover:bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={record.cover} alt="" className="h-24 w-[82px] rounded-lg object-cover" />
                <span className="py-1">
                  <strong className="block leading-tight">{record.title}</strong>
                  <span className="mt-2 block text-xs leading-5 text-zinc-600">{formatDate(record.date)}<br />{record.venue}</span>
                </span>
              </button>
            ))}
            {!activeRecords.length ? <p className="p-4 text-sm leading-6 text-zinc-500">这个年份还没有可显示的城市记录。</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件"));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("图片不能超过 15MB"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片读取失败，请重新选择"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片无法预览，请换一张"));
      image.onload = () => {
        const maxEdge = 1440;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("浏览器暂时无法处理这张图片"));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function CreateModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [preview, setPreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError("");
    setImageName(file.name);
    setProcessing(true);
    try {
      setPreview(await imageFileToDataUrl(file));
    } catch (error) {
      setPreview("");
      setImageName("");
      setImageError(error instanceof Error ? error.message : "图片处理失败，请重新选择");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-auto bg-zinc-950/35 p-4 backdrop-blur-md" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={onSubmit} className="modal-in my-5 w-full max-w-3xl overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_40px_100px_rgba(42,34,23,0.22)]">
        <div className="flex items-start justify-between border-b border-zinc-200 p-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a44b32]">New memory</p><h2 className="mt-2 text-3xl font-black text-zinc-950">新建演出记录</h2></div>
          <button type="button" onClick={onClose} aria-label="关闭" className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <Field className="md:col-span-2" label="演出名称" name="title" required />
          <Field label="艺人" name="artist" required />
          <Field label="嘉宾" name="guest" />
          <Field label="日期" name="date" type="date" required />
          <Field label="时间" name="time" type="time" />
          <Field label="城市" name="city" required />
          <Field label="场馆" name="venue" required />
          <Field label="票面价" name="price" type="number" min="0" step="0.01" placeholder="官方售卖价格" />
          <label className="grid gap-2 text-sm font-medium text-zinc-700">演出类型<select name="type" className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-zinc-950"><option value="livehouse">Livehouse</option><option value="bar">酒吧商演</option><option value="arena">体育馆</option></select></label>
          <TicketPurchaseFields />

          <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_220px]">
            <label className="group grid min-h-44 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-[#faf9f6] p-5 text-center transition hover:border-[#a44b32] hover:bg-orange-50/50">
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              <span>
                <ImagePlus className="mx-auto h-7 w-7 text-[#a44b32]" />
                <strong className="mt-3 block text-sm text-zinc-900">{processing ? "正在处理图片…" : preview ? "重新选择封面" : "上传封面图片"}</strong>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">支持 JPG、PNG、WebP，选择后立即预览</span>
                {imageName ? <span className="mt-2 block max-w-xs truncate text-xs text-zinc-600">{imageName}</span> : null}
                {imageError ? <span className="mt-2 block text-xs font-medium text-red-600">{imageError}</span> : null}
              </span>
            </label>
            <div className="relative min-h-44 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="封面预览" className="absolute inset-0 h-full w-full object-cover" />
                  <button type="button" onClick={() => { setPreview(""); setImageName(""); }} aria-label="移除封面" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-zinc-800 shadow-md"><X className="h-4 w-4" /></button>
                </>
              ) : (
                <div className="grid h-full min-h-44 place-items-center px-5 text-center text-xs leading-5 text-zinc-500">图片预览会显示在这里<br />不上传则使用示例封面</div>
              )}
              <input type="hidden" name="cover" value={preview} />
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">一句话记录<textarea name="line" className="min-h-24 rounded-xl border border-zinc-300 bg-white px-3 py-3 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950" placeholder="例如：那晚的低频还在胸口。" /></label>
        </div>
        <div className="flex justify-end gap-3 border-t border-zinc-200 bg-[#faf9f6] p-6">
          <button type="button" onClick={onClose} className="h-11 rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">取消</button>
          <button type="submit" disabled={processing} className="h-11 rounded-full bg-zinc-950 px-6 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50">保存到本机</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-zinc-700 ${className}`}>
      <span>{label}{props.required ? <em className="ml-1 not-italic text-[#a44b32]">*</em> : null}</span>
      <input {...props} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950" />
    </label>
  );
}

function DetailModal({
  record,
  onClose,
  onSaveNote,
  onSaveRecord,
}: {
  record: DemoPerformance;
  onClose: () => void;
  onSaveNote: (id: string, note: string) => void;
  onSaveRecord: (record: DemoPerformance) => void;
}) {
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(false);
  const [note, setNote] = useState(record.note);
  const [coverDraft, setCoverDraft] = useState(record.cover);
  const [timelineDraft, setTimelineDraft] = useState(record.timeline);
  const [processingTimelineImage, setProcessingTimelineImage] = useState<number | null>(null);
  const [detailImageProcessing, setDetailImageProcessing] = useState(false);

  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSaveRecord({
      ...record,
      title: String(form.get("title") ?? "").trim(),
      artist: String(form.get("artist") ?? "").trim(),
      guest: String(form.get("guest") ?? "").trim(),
      date: String(form.get("date") ?? ""),
      time: String(form.get("time") ?? ""),
      city: String(form.get("city") ?? "").trim(),
      venue: String(form.get("venue") ?? "").trim(),
      type: String(form.get("type") ?? "livehouse") as PerformanceType,
      price: optionalAmount(form, "price") ?? 0,
      ticketMethod: (String(form.get("ticketMethod") ?? "") || undefined) as TicketMethod | undefined,
      actualPrice: optionalAmount(form, "actualPrice"),
      ticketSource: String(form.get("ticketSource") ?? "").trim(),
      line: String(form.get("line") ?? "").trim(),
      cover: coverDraft,
    });
    setEditingDetails(false);
  }

  async function changeDetailCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDetailImageProcessing(true);
    try {
      setCoverDraft(await imageFileToDataUrl(file));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "图片处理失败");
    } finally {
      setDetailImageProcessing(false);
    }
  }

  function updateTimelineItem(index: number, patch: Partial<DemoPerformance["timeline"][number]>) {
    setTimelineDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function changeTimelineImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProcessingTimelineImage(index);
    try {
      updateTimelineItem(index, { image: await imageFileToDataUrl(file) });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "图片处理失败");
    } finally {
      setProcessingTimelineImage(null);
    }
  }

  function cancelTimelineEdit() {
    setTimelineDraft(record.timeline);
    setEditingTimeline(false);
  }

  function saveTimeline() {
    onSaveRecord({ ...record, timeline: timelineDraft });
    setEditingTimeline(false);
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-auto bg-[#f6f4ef]/95 backdrop-blur-2xl">
      <button onClick={onClose} aria-label="关闭详情" className="fixed right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-zinc-300 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-xl hover:bg-zinc-100 hover:text-black"><X className="h-5 w-5" /></button>
      <div className="mx-auto max-w-[1250px] px-4 py-16 md:px-[4vw]">
        <section className="relative min-h-[520px] overflow-hidden rounded-[24px] border border-zinc-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={record.cover} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-[2px]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.88)_55%,rgba(255,255,255,0.58)_100%),linear-gradient(0deg,rgba(255,255,255,0.98),transparent_65%)]" />
          <div className="relative z-10 flex min-h-[520px] flex-col justify-end p-7 md:p-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a44b32]">{typeLabels[record.type]} / {record.city}</p>
            <h1 className="max-w-4xl text-[clamp(40px,6vw,78px)] font-black leading-[0.9] tracking-[-0.05em]">{record.title}</h1>
            <p className="mt-6 text-zinc-700">{record.artist} · {formatDate(record.date)} {record.time} · {record.venue}</p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-800">“{record.line}”</p>
            <button onClick={() => setEditingDetails((current) => !current)} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800">
              {editingDetails ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editingDetails ? "收起编辑" : "编辑演出信息"}
            </button>
          </div>
        </section>

        {editingDetails ? (
          <form onSubmit={saveDetails} className="modal-in mt-6 rounded-[20px] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a44b32]">Edit details</p><h2 className="mt-1 text-2xl font-black">编辑演出信息</h2></div>
              <span className="text-xs text-zinc-500">带 * 为必填</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field className="md:col-span-2" label="演出名称" name="title" defaultValue={record.title} required />
              <Field label="艺人" name="artist" defaultValue={record.artist} required />
              <Field label="嘉宾" name="guest" defaultValue={record.guest} />
              <Field label="日期" name="date" type="date" defaultValue={record.date} required />
              <Field label="时间" name="time" type="time" defaultValue={record.time} />
              <Field label="城市" name="city" defaultValue={record.city} required />
              <Field label="场馆" name="venue" defaultValue={record.venue} required />
              <Field label="票面价" name="price" type="number" min="0" step="0.01" defaultValue={record.price || undefined} placeholder="官方售卖价格" />
              <label className="grid gap-2 text-sm font-medium text-zinc-700">演出类型<select name="type" defaultValue={record.type} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-zinc-950"><option value="livehouse">Livehouse</option><option value="bar">酒吧商演</option><option value="arena">体育馆</option></select></label>
              <TicketPurchaseFields record={record} />
              <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">一句话记录<textarea name="line" defaultValue={record.line} className="min-h-24 rounded-xl border border-zinc-300 bg-white px-3 py-3 text-zinc-950 outline-none focus:border-zinc-950" /></label>
              <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_220px]">
                <label className="grid min-h-36 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-[#faf9f6] p-5 text-center transition hover:border-[#a44b32]">
                  <input type="file" accept="image/*" className="sr-only" onChange={changeDetailCover} />
                  <span><ImagePlus className="mx-auto h-6 w-6 text-[#a44b32]" /><strong className="mt-2 block text-sm">{detailImageProcessing ? "正在处理…" : "更换封面图片"}</strong><span className="mt-1 block text-xs text-zinc-500">选择后立即预览</span></span>
                </label>
                <div className="relative min-h-36 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverDraft} alt="新封面预览" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-5">
              <button type="button" onClick={() => { setCoverDraft(record.cover); setEditingDetails(false); }} className="h-11 rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">取消</button>
              <button type="submit" disabled={detailImageProcessing} className="h-11 rounded-full bg-zinc-950 px-6 text-sm font-bold text-white disabled:opacity-50">保存演出信息</button>
            </div>
          </form>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[20px] border border-zinc-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ticket information</p>
            <Info icon={<CalendarDays className="h-4 w-4" />} label="日期" value={formatDate(record.date)} />
            <Info icon={<MapPin className="h-4 w-4" />} label="地点" value={record.city + " · " + record.venue} />
            <Info icon={<Ticket className="h-4 w-4" />} label="票务" value={<TicketSummary record={record} />} />
          </aside>

          <div className="grid gap-6">
            <section className="rounded-[20px] border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a44b32]">Personal note</p><h2 className="mt-1 text-xl font-black">这一晚，我想记住</h2></div>
                <button onClick={() => { setNote(record.note); setEditingNote((current) => !current); }} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100">{editingNote ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}{editingNote ? "取消" : "编辑"}</button>
              </div>
              {editingNote ? (
                <div className="mt-5">
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-36 w-full rounded-xl border border-zinc-300 bg-[#faf9f6] p-4 leading-7 text-zinc-800 outline-none focus:border-zinc-950" />
                  <button onClick={() => { onSaveNote(record.id, note); setEditingNote(false); }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white"><Check className="h-4 w-4" />保存修改</button>
                </div>
              ) : <p className="mt-5 whitespace-pre-wrap leading-8 text-zinc-700">{record.note}</p>}
            </section>

            <section className="rounded-[20px] border border-zinc-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a44b32]">Timeline</p><h2 className="mt-1 text-xl font-black">演出时间线</h2></div>
                <button onClick={() => editingTimeline ? cancelTimelineEdit() : setEditingTimeline(true)} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100">{editingTimeline ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}{editingTimeline ? "取消" : "编辑时间线"}</button>
              </div>

              {editingTimeline ? (
                <div className="mt-6 grid gap-4">
                  {timelineDraft.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-zinc-200 bg-[#faf9f6] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <strong className="text-sm">节点 {String(index + 1).padStart(2, "0")}</strong>
                        <button type="button" onClick={() => setTimelineDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />删除</button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-medium text-zinc-600">阶段<input value={item.phase} onChange={(event) => updateTimelineItem(index, { phase: event.target.value })} className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950" /></label>
                        <label className="grid gap-1.5 text-xs font-medium text-zinc-600">Emoji 标签<select value={item.emoji ?? ""} onChange={(event) => updateTimelineItem(index, { emoji: event.target.value })} className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-lg text-zinc-950 outline-none focus:border-zinc-950">{emojiOptions.map((emoji) => <option key={emoji || "none"} value={emoji}>{emoji || "无标签"}</option>)}</select></label>
                        <label className="grid gap-1.5 text-xs font-medium text-zinc-600">日期<input type="date" value={item.date ?? record.date} onChange={(event) => updateTimelineItem(index, { date: event.target.value })} className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950" /></label>
                        <label className="grid gap-1.5 text-xs font-medium text-zinc-600">时间<input type="time" value={item.time} onChange={(event) => updateTimelineItem(index, { time: event.target.value })} className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950" /></label>
                        <label className="grid gap-1.5 text-xs font-medium text-zinc-600 md:col-span-2">标题<input value={item.title} onChange={(event) => updateTimelineItem(index, { title: event.target.value })} className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950" /></label>
                        <label className="grid gap-1.5 text-xs font-medium text-zinc-600 md:col-span-2">记录<textarea value={item.content} onChange={(event) => updateTimelineItem(index, { content: event.target.value })} className="min-h-24 rounded-lg border border-zinc-300 bg-white p-3 text-sm leading-6 text-zinc-950 outline-none focus:border-zinc-950" /></label>
                        <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_180px]">
                          <label className="grid min-h-28 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-zinc-300 bg-white p-4 text-center hover:border-[#a44b32]">
                            <input type="file" accept="image/*" className="sr-only" onChange={(event) => changeTimelineImage(index, event)} />
                            <span><ImagePlus className="mx-auto h-5 w-5 text-[#a44b32]" /><strong className="mt-2 block text-xs">{processingTimelineImage === index ? "正在处理图片…" : item.image ? "更换节点图片" : "上传节点图片"}</strong><span className="mt-1 block text-[11px] text-zinc-500">选择后即时预览</span></span>
                          </label>
                          <div className="relative min-h-28 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                            {item.image ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><button type="button" onClick={() => updateTimelineItem(index, { image: undefined })} aria-label="移除节点图片" className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow"><X className="h-3.5 w-3.5" /></button></> : <span className="grid h-full min-h-28 place-items-center text-xs text-zinc-400">暂无图片</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setTimelineDraft((current) => [...current, { phase: "新节点", date: record.date, time: "", emoji: "✨", title: "", content: "", image: undefined }])} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-bold text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50"><Plus className="h-4 w-4" />添加时间节点</button>
                  <button type="button" onClick={saveTimeline} disabled={processingTimelineImage !== null} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" />保存时间线</button>
                </div>
              ) : (
                <div className="relative mt-7">
                  <div className="absolute bottom-4 left-[7px] top-3 w-px bg-zinc-300" />
                  <div className="grid gap-8">
                    {record.timeline.map((item, index) => (
                      <article key={item.phase + index} className="relative grid gap-4 pl-9 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
                        <span className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-4 border-white bg-[#a44b32] shadow-[0_0_0_1px_rgba(164,75,50,0.28)]" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#a44b32]">
                            {item.emoji ? <span className="grid h-7 min-w-7 place-items-center rounded-full border border-[#a44b32]/20 bg-[#a44b32]/10 px-1.5 text-base" aria-label="节点标签">{item.emoji}</span> : null}
                            <span>{item.phase}</span>
                            <span className="font-medium text-zinc-500">· {(item.date || record.date).replaceAll("-", ".")}{item.time ? "  " + item.time : ""}</span>
                          </div>
                          <h3 className="mt-2 text-lg font-black">{item.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-zinc-600">{item.content}</p>
                        </div>
                        {item.image ? <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.image} alt={item.title} className="aspect-[4/3] h-full w-full object-cover" /></div> : null}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#a44b32]">Media wall · {record.media.length}</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {record.media.map((item, index) => <img key={item + index} src={item} alt="" className={`w-full rounded-[16px] object-cover ${index === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`} />)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketPurchaseFields({ record }: { record?: DemoPerformance }) {
  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        入手方式
        <select name="ticketMethod" defaultValue={record?.ticketMethod ?? ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-zinc-950">
          <option value="">暂不记录</option>
          <option value="official">官方购票</option>
          <option value="proxy">代拍</option>
          <option value="resale">二手转票</option>
          <option value="scalper">黄牛收票</option>
          <option value="gift">赠票</option>
          <option value="other">其他方式</option>
        </select>
      </label>
      <Field label="实际花费" name="actualPrice" type="number" min="0" step="0.01" defaultValue={record?.actualPrice} placeholder="含手续费、代拍费或加价" />
      <details className="group rounded-xl border border-zinc-200 bg-[#faf9f6] md:col-span-2">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-700">
          <span className="inline-flex items-center gap-2">补充购票来源 <span className="text-xs font-normal text-zinc-400">选填</span><span className="text-zinc-400 transition group-open:rotate-45">＋</span></span>
        </summary>
        <label className="grid gap-2 border-t border-zinc-200 px-4 py-4 text-sm font-medium text-zinc-700">
          渠道 / 来源
          <input name="ticketSource" defaultValue={record?.ticketSource ?? ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950" placeholder="如：大麦、闲鱼、票务群、朋友转票" />
        </label>
      </details>
    </>
  );
}

function TicketSummary({ record }: { record: DemoPerformance }) {
  const faceValue = record.price ? `¥${formatMoney(record.price)}` : "票面价未记录";
  const method = record.ticketMethod ? ticketMethodLabels[record.ticketMethod] : "";
  const source = record.ticketSource?.trim() ?? "";
  const actualPrice = record.actualPrice;
  const details = [method, source].filter(Boolean);

  if (record.ticketMethod !== "gift" && actualPrice !== undefined && !(record.ticketMethod === "official" && actualPrice === record.price)) {
    details.push(`实付 ¥${formatMoney(actualPrice)}`);
  }

  return (
    <span className="block">
      <span className="block text-base font-bold text-zinc-800">{faceValue}</span>
      {details.length ? <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">{details.join(" · ")}</span> : null}
    </span>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="mt-5 flex gap-3 border-t border-zinc-200 pt-5 text-sm"><span className="mt-0.5 text-[#a44b32]">{icon}</span><span className="min-w-0"><span className="block text-xs text-zinc-500">{label}</span><span className="mt-1 block font-medium text-zinc-700">{value}</span></span></div>;
}
