import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Database,
  Download,
  FileClock,
  FileSpreadsheet,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

type Role =
  | "分行主管"
  | "區域主管"
  | "總行業管人員"
  | "總行業管主管"
  | "經營企劃部人員"
  | "經營企劃部主管"
  | "高階主管"
  | "系統管理員"
  | "稽核人員";
type Metric = {
  id: string;
  name: string;
  group: string;
  dept: string;
  actual: number;
  target: number;
  score: number;
  max: number;
  rank: number;
  status: string;
  unit: string;
};
const roles: Role[] = [
  "分行主管",
  "區域主管",
  "總行業管人員",
  "總行業管主管",
  "經營企劃部人員",
  "經營企劃部主管",
  "高階主管",
  "系統管理員",
  "稽核人員",
];
const branchNames = [
  "台北分行",
  "城東分行",
  "城西分行",
  "板橋分行",
  "新莊分行",
  "桃園分行",
  "新竹分行",
  "台中分行",
  "台南分行",
  "高雄分行",
  ...Array.from(
    { length: 140 },
    (_, i) => `模擬分行${String(i + 1).padStart(3, "0")}`,
  ),
];
const groups = [
  "房貸",
  "信貸",
  "信用卡",
  "財富管理",
  "數位金融",
  "存款",
  "手續費收入",
];
const metricNames = [
  "房貸平均利率",
  "房貸利息收入",
  "房貸新貸放額",
  "房貸平均餘額",
  "房貸新戶數",
  "房貸手續費收入",
  "信貸平均利率",
  "信貸利息收入",
  "信貸新貸放額",
  "信貸平均餘額",
  "信貸新戶數",
  "信用卡新戶數",
  "發卡數",
  "有效卡數",
  "簽帳金額",
  "卡均簽帳金額",
  "循環利息收入",
  "財管手續費收入",
  "客群經營目標達成率",
  "高資產客戶數",
  "基金手續費收入",
  "保險手續費收入",
  "數位帳戶新戶",
  "行動銀行活躍戶",
  "存款平均餘額",
  "活期存款占比",
  "外幣存款餘額",
  "企業授信餘額",
  "中小企業新戶",
  "企金手續費收入",
  "跨售率",
  "客戶滿意度",
  "風險調整報酬率",
  "逾放比改善",
  "綠色授信餘額",
  "薪轉戶新增",
  "理財會員新增",
  "基金定期定額",
  "保險新契約",
  "數位交易占比",
];
const metrics: Metric[] = metricNames.map((name, i) => {
  const target = 800 + i * 73,
    actual = Math.round(target * (0.64 + (i % 9) * 0.047));
  return {
    id: `KPI-${String(i + 1).padStart(3, "0")}`,
    name,
    group: groups[Math.floor(i / 6) % groups.length],
    dept: `業管單位 ${String((i % 20) + 1).padStart(2, "0")}`,
    actual,
    target,
    score: +(Math.min(actual / target, 1.12) * (6 + (i % 7))).toFixed(1),
    max: 6 + (i % 7),
    rank: ((i * 7) % 32) + 1,
    status:
      actual / target >= 0.95
        ? "達標"
        : actual / target >= 0.8
          ? "注意"
          : "落後",
    unit: i % 4 === 0 ? "%" : "百萬元",
  };
});
const trend = Array.from({ length: 12 }, (_, i) => ({
  m: `${i + 1}月`,
  score: +(72 + i * 1.55 + (i % 3) * 0.7).toFixed(1),
  forecast: +(74 + i * 1.65).toFixed(1),
}));
const cat = groups.map((name, i) => ({
  name,
  rate: 68 + i * 4.8 + (i % 2) * 3,
  score: 12 + i * 2.1,
  branch: 75 + i * 3,
  peer: 79 + i * 2.2,
  top: 88 + i * 1.3,
  all: 76 + i * 2,
}));
const statusClass = (s: string) =>
  s.includes("發布") || s === "達標" || s.includes("核定")
    ? "ok"
    : s === "落後" || s.includes("退回") || s.includes("錯誤")
      ? "bad"
      : "warn";
const fmt = (n: number) =>
  new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format(n);

function App() {
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem("role") as Role) || "分行主管",
  );
  const [branch, setBranch] = useState("台北分行");
  const [collapsed, setCollapsed] = useState(false);
  const changeRole = (r: Role) => {
    setRole(r);
    localStorage.setItem("role", r);
  };
  return (
    <div className="app">
      <Sidebar role={role} collapsed={collapsed} />
      <main className={collapsed ? "main collapsed" : "main"}>
        <header>
          <button className="icon" onClick={() => setCollapsed(!collapsed)}>
            <Menu />
          </button>
          <div className="header-tools">
            <Bell size={19} />
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branchNames.map((x) => (
                <option>{x}</option>
              ))}
            </select>
            <label>切換角色</label>
            <select
              value={role}
              onChange={(e) => changeRole(e.target.value as Role)}
            >
              {roles.map((x) => (
                <option>{x}</option>
              ))}
            </select>
            <span className="avatar">王</span>
            <b>王大明</b>
          </div>
        </header>
        <Routes>
          <Route path="*" element={<Dashboard branch={branch} />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/metric/:id" element={<MetricDetail />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/metrics" element={<MetricAdminV2 />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/formula" element={<Formula />} />
          <Route path="/targets" element={<ImportPage target />} />
          <Route path="/imports" element={<ImportPage />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/executive" element={<Executive />} />
        </Routes>
      </main>
    </div>
  );
}
const front = [
  ["/", "分行經營總覽", LayoutDashboard],
  ["/performance", "月度業績查詢", BarChart3],
  ["/metric/KPI-003", "指標明細", Target],
  ["/simulator", "追分模擬器", Calculator],
  ["/compare", "分行比較", Users],
] as const;
const admin = [
  ["/metrics", "指標管理", Settings],
  ["/wizard", "設定精靈", SlidersHorizontal],
  ["/formula", "公式組合器", GitBranch],
  ["/targets", "目標設定與匯入", FileSpreadsheet],
  ["/imports", "業績匯入中心", Database],
  ["/approval", "審核與發布", ClipboardCheck],
  ["/audit", "版本及稽核", FileClock],
] as const;
function Sidebar({ role, collapsed }: { role: Role; collapsed: boolean }) {
  let items =
    role === "稽核人員"
      ? admin.slice(-1)
      : role === "高階主管"
        ? [["/executive", "全行戰情儀表板", Gauge] as const]
        : role.includes("業管") ||
            role.includes("企劃") ||
            role === "系統管理員"
          ? [...front, ...admin]
          : front;
  return (
    <aside className={collapsed ? "side collapsed" : "side"}>
      <div className="brand">
        <Building2 />
        <span>分行績效管理平台</span>
      </div>
      <nav>
        {items.map(([p, l, I]) => (
          <NavLink to={p} end={p === "/"}>
            <I />
            <span>{l}</span>
          </NavLink>
        ))}
      </nav>
      <div className="side-foot">
        <ShieldCheck />
        <span>{role}</span>
      </div>
    </aside>
  );
}
function Page({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page">
      <div className="crumb">
        首頁 <ChevronRight size={13} /> {title}
      </div>
      <div className="titlebar">
        <div>
          <h1>{title}</h1>
          <p>資料更新：2026/07/07 08:30</p>
        </div>
        <div className="actions">{actions}</div>
      </div>
      {children}
    </div>
  );
}
function Kpi({
  label,
  value,
  delta,
  good = true,
}: {
  label: string;
  value: string;
  delta: string;
  good?: boolean;
}) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={good ? "up" : "down"}>
        {good ? "▲" : "▼"} {delta}
      </small>
    </div>
  );
}
function Dashboard({ branch }: { branch: string }) {
  return (
    <Page
      title={`${branch}經營總覽`}
      actions={
        <>
          <select>
            <option>2026 年 6 月</option>
            <option>2026 年 5 月</option>
          </select>
          <button>
            <Download />
            匯出報表
          </button>
        </>
      }
    >
      <div className="notice">
        資料來源：核心系統、CRM、財富管理系統及數位金融系統；本月資料完整率
        98.7%。
      </div>
      <div className="kpis">
        <Kpi label="總得分" value="86.4" delta="較上月 2.3" />
        <Kpi label="同組排名" value="7 / 32" delta="上升 1 名" />
        <Kpi label="年度目標達成率" value="92.6%" delta="3.8 個百分點" />
        <Kpi label="預估年底得分" value="91.2" delta="2.1" />
      </div>
      <div className="grid2 wide">
        <Panel title="最近 12 個月總得分趨勢">
          <ChartLine />
        </Panel>
        <Panel title="優先關注指標">
          <table>
            <tbody>
              {metrics.slice(0, 5).map((m) => (
                <tr>
                  <td>
                    <b>{m.name}</b>
                    <small>
                      {fmt(m.actual)} / {fmt(m.target)} {m.unit}
                    </small>
                  </td>
                  <td>{fmt((m.actual / m.target) * 100)}%</td>
                  <td>
                    <span className={`tag ${statusClass(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
      <div className="grid2">
        <Panel title="各業務類別達成率">
          {cat.slice(0, 5).map((x) => (
            <div className="progress">
              <span>{x.name}</span>
              <i>
                <em style={{ width: `${x.rate}%` }} />
              </i>
              <b>{fmt(x.rate)}%</b>
            </div>
          ))}
        </Panel>
        <Panel title="得分貢獻度">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cat.slice(0, 5)} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={70} />
              <Tooltip />
              <Bar dataKey="score" fill="#1677ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </Page>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function ChartLine() {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart data={trend}>
        <CartesianGrid stroke="#e8edf3" vertical={false} />
        <XAxis dataKey="m" />
        <YAxis domain={[60, 100]} />
        <Tooltip />
        <Legend />
        <Line
          name="實際得分"
          dataKey="score"
          stroke="#1677ff"
          strokeWidth={3}
        />
        <Line
          name="預估得分"
          dataKey="forecast"
          stroke="#88b8ff"
          strokeDasharray="6 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
function Filters() {
  return (
    <div className="filters">
      <select>
        <option>2026 年</option>
        <option>2025 年</option>
      </select>
      <select>
        <option>6 月</option>
        <option>5 月</option>
      </select>
      <select>
        <option>年度累計</option>
        <option>當月</option>
      </select>
      <select>
        <option>全部業務群</option>
        {groups.map((x) => (
          <option>{x}</option>
        ))}
      </select>
      <select>
        <option>全部狀態</option>
        <option>達標</option>
        <option>未達標</option>
      </select>
      <div className="search">
        <Search />
        <input placeholder="搜尋指標名稱或代碼" />
      </div>
    </div>
  );
}
function Performance() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "rate">("name");
  const rows = useMemo(
    () =>
      metrics
        .filter((m) => m.name.includes(q))
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name, "zh-TW")
            : b.actual / b.target - a.actual / a.target,
        ),
    [q, sort],
  );
  return (
    <Page
      title="月度業績查詢"
      actions={
        <button onClick={() => alert("報表已匯出（模擬）")}>
          <Download />
          匯出 Excel
        </button>
      }
    >
      <Filters />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => setSort("name")}>指標名稱 ↕</th>
              <th>當月實績</th>
              <th>年度累計</th>
              <th>月度目標</th>
              <th>年度目標</th>
              <th onClick={() => setSort("rate")}>達成率 ↕</th>
              <th>預計得分</th>
              <th>同組排名</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 15).map((m) => (
              <tr>
                <td>
                  <b>{m.name}</b>
                  <small>
                    {m.id} · {m.group}
                  </small>
                </td>
                <td>{fmt(m.actual / 6)}</td>
                <td>{fmt(m.actual)}</td>
                <td>{fmt(m.target / 12)}</td>
                <td>{fmt(m.target)}</td>
                <td>
                  <b>{fmt((m.actual / m.target) * 100)}%</b>
                </td>
                <td>
                  {m.score} / {m.max}
                </td>
                <td>{m.rank}</td>
                <td>
                  <span className={`tag ${statusClass(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td>
                  <button
                    className="link"
                    onClick={() => nav(`/metric/${m.id}`)}
                  >
                    明細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        共 {rows.length} 筆　‹　<b>1</b>　2　3　›
      </div>
    </Page>
  );
}
function MetricDetail() {
  const m = metrics[2];
  return (
    <Page title={m.name} actions={<button>加入追分模擬</button>}>
      <div className="kpis">
        <Kpi
          label="目前實績"
          value={`${fmt(m.actual)} 百萬元`}
          delta="年增 7.2%"
        />
        <Kpi
          label="年度目標"
          value={`${fmt(m.target)} 百萬元`}
          delta="進度 6 / 12 月"
        />
        <Kpi
          label="達成率"
          value={`${fmt((m.actual / m.target) * 100)}%`}
          delta="同組平均 78.4%"
          good={false}
        />
        <Kpi
          label="目前得分"
          value={`${m.score} / ${m.max}`}
          delta="距下級距 126 百萬元"
        />
      </div>
      <div className="grid2 wide">
        <Panel title="指標定義與計分方式">
          <dl className="detail">
            <div>
              <dt>業管部門</dt>
              <dd>個人金融事業處</dd>
            </div>
            <div>
              <dt>資料來源</dt>
              <dd>核心授信系統</dd>
            </div>
            <div>
              <dt>計分方式</dt>
              <dd>固定級距；達成率每增加 5% 得 0.5 分</dd>
            </div>
            <div>
              <dt>更新時間</dt>
              <dd>2026/07/07 07:45</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="比較基準">
          <div className="compare-stat">
            <b>同組平均 78.4%</b>
            <b>同組前 25% 91.2%</b>
            <b>全行平均 81.6%</b>
          </div>
        </Panel>
      </div>
      <Panel title="最近 12 個月趨勢與去年同期比較">
        <ChartLine />
      </Panel>
      <div className="grid2">
        <Panel title="分行排名分布">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[18, 32, 44, 29, 17, 10].map((v, i) => ({
                r: `${i * 20 + 1}-${i * 20 + 20}`,
                v,
              }))}
            >
              <XAxis dataKey="r" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="v" fill="#1677ff" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="得分級距表">
          <table>
            <thead>
              <tr>
                <th>達成率</th>
                <th>得分</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["110% 以上", "12.0"],
                ["100%–109.9%", "10.0"],
                ["90%–99.9%", "8.0"],
                ["80%–89.9%", "6.0"],
                ["80% 以下", "3.0"],
              ].map((x, i) => (
                <tr>
                  <td>{x[0]}</td>
                  <td>{x[1]}</td>
                  <td>
                    {i === 3 ? <span className="tag warn">目前級距</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </Page>
  );
}
function Simulator() {
  const [vals, setVals] = useState([3000, 0.03, 50, 5000, 200]);
  const [done, setDone] = useState(false);
  const names = [
    "房貸新貸放額（萬元）",
    "房貸平均利率（%）",
    "信貸新戶（戶）",
    "信用卡簽帳金額（萬元）",
    "財管手續費收入（萬元）",
  ];
  return (
    <Page title="追分模擬器">
      <div className="warning">此為模擬結果，不代表正式得分。</div>
      <div className="grid2 wide">
        <Panel title="設定模擬情境">
          {names.map((n, i) => (
            <label className="field">
              <span>{n}</span>
              <input
                type="number"
                value={vals[i]}
                onChange={(e) =>
                  setVals(vals.map((v, j) => (j === i ? +e.target.value : v)))
                }
              />
            </label>
          ))}
          <button className="primary" onClick={() => setDone(true)}>
            <Calculator />
            開始試算
          </button>
        </Panel>
        <Panel title="試算結果">
          {done ? (
            <>
              <div className="sim-result">
                <div>
                  <span>模擬前得分</span>
                  <b>86.4</b>
                </div>
                <ChevronRight />
                <div>
                  <span>模擬後得分</span>
                  <b className="green">
                    {(
                      86.4 +
                      Math.min(6.8, vals.reduce((a, b) => a + b, 0) / 1400)
                    ).toFixed(1)}
                  </b>
                </div>
              </div>
              <div className="result-list">
                <p>
                  可增加分數 <b>+5.7</b>
                </p>
                <p>
                  同組排名變化 <b>第 7 名 → 第 3 名</b>
                </p>
                <p>
                  距下一級距 <b>還差 420 萬元</b>
                </p>
              </div>
            </>
          ) : (
            <div className="empty">
              <Calculator />
              <p>調整左側數值後開始試算</p>
            </div>
          )}
        </Panel>
      </div>
      {done && (
        <Panel title="投入效益排序">
          <table>
            <thead>
              <tr>
                <th>排序</th>
                <th>指標</th>
                <th>預估增分</th>
                <th>每增加 1 分所需投入</th>
              </tr>
            </thead>
            <tbody>
              {names.map((x, i) => (
                <tr>
                  <td>{i + 1}</td>
                  <td>{x.split("（")[0]}</td>
                  <td>+{(1.8 - i * 0.23).toFixed(2)}</td>
                  <td>{fmt(420 + i * 165)} 萬元</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </Page>
  );
}
function Compare() {
  const [dataKey, setDataKey] = useState("branch");
  return (
    <Page title="分行比較">
      <div className="filters">
        <select>
          <option>台北分行</option>
        </select>
        {[
          ["branch", "自己分行"],
          ["peer", "同組平均"],
          ["top", "同組前 25%"],
          ["all", "全行平均"],
        ].map((x) => (
          <button
            className={dataKey === x[0] ? "active" : ""}
            onClick={() => setDataKey(x[0])}
          >
            {x[1]}
          </button>
        ))}
      </div>
      <div className="grid2 wide">
        <Panel title="業務類別達成率比較">
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={cat}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <Radar
                name="台北分行"
                dataKey="branch"
                stroke="#1677ff"
                fill="#1677ff"
                fillOpacity={0.18}
              />
              <Radar
                name="比較基準"
                dataKey={dataKey}
                stroke="#16a36a"
                fill="#16a36a"
                fillOpacity={0.08}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="差距分析">
          {cat.map((x) => (
            <div className="progress">
              <span>{x.name}</span>
              <i>
                <em style={{ width: `${x[dataKey as keyof typeof x]}%` }} />
              </i>
              <b>{fmt(x[dataKey as keyof typeof x] as number)}%</b>
            </div>
          ))}
        </Panel>
      </div>
    </Page>
  );
}
function MetricAdmin() {
  const [show, setShow] = useState(false);
  const [items, setItems] = useState(
    () => JSON.parse(localStorage.getItem("customMetrics") || "[]") as any[],
  );
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      n = {
        id: `KPI-${900 + items.length}`,
        name: f.get("name"),
        group: f.get("group"),
        status: "草稿",
      };
    const next = [n, ...items];
    setItems(next);
    localStorage.setItem("customMetrics", JSON.stringify(next));
    setShow(false);
  };
  const rows = [
    ...items,
    ...metrics
      .slice(0, 18)
      .map((m, i) => ({
        ...m,
        status: [
          "已發布",
          "草稿",
          "待部門主管審核",
          "待經營企劃部複核",
          "退回修正",
          "已核定",
        ][i % 6],
      })),
  ];
  return (
    <Page
      title="指標管理"
      actions={
        <>
          <button onClick={() => alert("已複製為草稿")}>複製指標</button>
          <button className="primary" onClick={() => setShow(true)}>
            <Plus />
            新增指標
          </button>
        </>
      }
    >
      <Filters />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>指標代碼</th>
              <th>指標名稱</th>
              <th>業務群</th>
              <th>業管部門</th>
              <th>配分</th>
              <th>生效年度</th>
              <th>版本</th>
              <th>狀態</th>
              <th>最後修改日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m: any) => (
              <tr>
                <td>{m.id}</td>
                <td>
                  <b>{m.name}</b>
                </td>
                <td>{m.group}</td>
                <td>{m.dept || "個人金融事業處"}</td>
                <td>{m.max || 10}</td>
                <td>2026</td>
                <td>v{m.id?.slice(-1)}.0</td>
                <td>
                  <span className={`tag ${statusClass(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td>2026/07/0{(m.rank % 7) + 1 || 7}</td>
                <td>
                  <button
                    className="link"
                    onClick={() => alert(`${m.name} 已送審`)}
                  >
                    送審
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <Modal title="新增指標" close={() => setShow(false)}>
          <form onSubmit={add}>
            <label className="field">
              <span>指標名稱</span>
              <input name="name" required />
            </label>
            <label className="field">
              <span>業務群</span>
              <select name="group">
                {groups.map((x) => (
                  <option>{x}</option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setShow(false)}>
                取消
              </button>
              <button className="primary">儲存草稿</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

type AdminMetric = Metric & {
  version: string;
  year: number;
  status: string;
  modifiedBy: string;
  modifiedAt: string;
  rule: string;
};

function MetricAdminV2() {
  const statuses = [
    "全部",
    "草稿",
    "待部門主管審核",
    "待經營企劃部複核",
    "退回修正",
    "已核定",
    "已發布",
  ];
  const seed = useMemo<AdminMetric[]>(
    () =>
      metrics.slice(0, 28).map((m, i) => ({
        ...m,
        version: `v${1 + (i % 3)}.${i % 2}`,
        year: 2026,
        status: statuses[(i % (statuses.length - 1)) + 1],
        modifiedBy: ["王大明", "陳怡君", "林志強", "張雅婷"][i % 4],
        modifiedAt: `2026/07/${String(7 - (i % 6)).padStart(2, "0")} ${String(9 + (i % 8)).padStart(2, "0")}:20`,
        rule: ["目標達成率", "固定級距", "排名給分", "複合權重"][i % 4],
      })),
    [],
  );
  const [rows, setRows] = useState<AdminMetric[]>(seed);
  const [status, setStatus] = useState("全部");
  const [group, setGroup] = useState("全部業務群");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState<AdminMetric | null>(null);
  const [drawer, setDrawer] = useState<"view" | "edit" | "create" | null>(null);
  const [detailTab, setDetailTab] = useState<"summary" | "versions" | "audit">("summary");

  const filtered = rows.filter(
    (m) =>
      (status === "全部" || m.status === status) &&
      (group === "全部業務群" || m.group === group) &&
      (m.name.includes(query) || m.id.toLowerCase().includes(query.toLowerCase())),
  );
  const counts = (s: string) => (s === "全部" ? rows.length : rows.filter((m) => m.status === s).length);
  const open = (m: AdminMetric, mode: "view" | "edit") => {
    setActive(m);
    setDetailTab("summary");
    setDrawer(mode);
  };
  const changeStatus = (id: string, nextStatus: string) =>
    setRows((list) => list.map((m) => (m.id === id ? { ...m, status: nextStatus, modifiedAt: "2026/07/07 15:30" } : m)));
  const duplicate = (m: AdminMetric) => {
    const copy = { ...m, id: `KPI-${900 + rows.length}`, name: `${m.name}－副本`, status: "草稿", version: "v0.1" };
    setRows([copy, ...rows]);
    setActive(copy);
    setDrawer("edit");
  };
  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (drawer === "create") {
      const base = metrics[0];
      const created: AdminMetric = {
        ...base,
        id: String(f.get("id")),
        name: String(f.get("name")),
        group: String(f.get("group")),
        dept: String(f.get("dept")),
        max: Number(f.get("max")),
        status: "草稿",
        version: "v0.1",
        year: 2026,
        modifiedBy: "王大明",
        modifiedAt: "2026/07/07 15:30",
        rule: String(f.get("rule")),
      };
      setRows([created, ...rows]);
    } else if (active) {
      setRows((list) =>
        list.map((m) =>
          m.id === active.id
            ? {
                ...m,
                name: String(f.get("name")),
                group: String(f.get("group")),
                dept: String(f.get("dept")),
                max: Number(f.get("max")),
                rule: String(f.get("rule")),
                modifiedAt: "2026/07/07 15:30",
              }
            : m,
        ),
      );
    }
    setDrawer(null);
  };

  return (
    <Page
      title="指標管理工作台"
      actions={
        <>
          <button onClick={() => alert("已匯出目前篩選結果")}><Download />匯出清單</button>
          <button className="primary" onClick={() => { setActive(null); setDrawer("create"); }}><Plus />新增指標</button>
        </>
      }
    >
      <div className="admin-summary">
        <div><span>指標總數</span><b>{rows.length}</b><small>2026 年度有效版本</small></div>
        <div><span>待我處理</span><b>{counts("待經營企劃部複核") + counts("退回修正")}</b><small>複核與退回修正</small></div>
        <div><span>已發布</span><b>{counts("已發布")}</b><small>占全部 {fmt((counts("已發布") / rows.length) * 100)}%</small></div>
        <div><span>配分檢核</span><b>98 / 100</b><small className="red">尚差 2 分待配置</small></div>
      </div>

      <div className="status-tabs">
        {statuses.map((s) => (
          <button className={status === s ? "active" : ""} onClick={() => setStatus(s)}>
            {s}<em>{counts(s)}</em>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋指標代碼或名稱" /></div>
        <select value={group} onChange={(e) => setGroup(e.target.value)}><option>全部業務群</option>{groups.map((x) => <option>{x}</option>)}</select>
        <select><option>全部業管部門</option><option>個人金融事業處</option><option>數位金融處</option></select>
        <select><option>2026 年</option><option>2025 年</option></select>
        <button onClick={() => { setQuery(""); setGroup("全部業務群"); setStatus("全部"); }}><RefreshCw />清除條件</button>
      </div>

      {selected.length > 0 && (
        <div className="bulkbar"><b>已選擇 {selected.length} 項</b><button onClick={() => selected.forEach((id) => changeStatus(id, "待部門主管審核"))}>批次送審</button><button onClick={() => setSelected([])}>取消選取</button></div>
      )}

      <div className="table-wrap admin-table">
        <table>
          <thead><tr><th></th><th>指標</th><th>業務群／業管部門</th><th>計分規則</th><th>配分</th><th>版本</th><th>狀態</th><th>最後異動</th><th>操作</th></tr></thead>
          <tbody>
            {filtered.map((m) => (
              <tr className={selected.includes(m.id) ? "selected" : ""}>
                <td><input type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected((v) => v.includes(m.id) ? v.filter((x) => x !== m.id) : [...v, m.id])} /></td>
                <td><button className="metric-name" onClick={() => open(m, "view")}><b>{m.name}</b><small>{m.id} · {m.unit}</small></button></td>
                <td>{m.group}<small>{m.dept}</small></td>
                <td>{m.rule}<small>上限 {m.max} 分／下限 0 分</small></td>
                <td><b>{m.max}</b></td><td>{m.version}<small>{m.year}</small></td>
                <td><span className={`tag ${statusClass(m.status)}`}>{m.status}</span></td>
                <td>{m.modifiedAt}<small>{m.modifiedBy}</small></td>
                <td><div className="row-actions"><button title="查看" onClick={() => open(m, "view")}>查看</button><button title="編輯" onClick={() => open(m, "edit")}>編輯</button><button title="複製" onClick={() => duplicate(m)}>複製</button>{m.status === "草稿" && <button className="link" onClick={() => changeStatus(m.id, "待部門主管審核")}>送審</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="no-results">找不到符合條件的指標，請調整篩選條件。</div>}
      </div>
      <div className="table-footer"><span>顯示 1–{filtered.length}，共 {filtered.length} 項</span><div><button disabled>‹</button><button className="active">1</button><button>2</button><button>›</button></div></div>

      {drawer && (
        <Modal title={drawer === "create" ? "新增指標" : drawer === "edit" ? `編輯｜${active?.name}` : `指標詳情｜${active?.name}`} close={() => setDrawer(null)}>
          {drawer === "view" && active ? (
            <>
              <div className="drawer-status"><span className={`tag ${statusClass(active.status)}`}>{active.status}</span><b>{active.id}</b><span>{active.version}</span></div>
              <div className="detail-tabs"><button className={detailTab === "summary" ? "active" : ""} onClick={() => setDetailTab("summary")}>設定摘要</button><button className={detailTab === "versions" ? "active" : ""} onClick={() => setDetailTab("versions")}>版本紀錄</button><button className={detailTab === "audit" ? "active" : ""} onClick={() => setDetailTab("audit")}>異動軌跡</button></div>
              {detailTab === "summary" && <dl className="drawer-detail"><div><dt>業務群</dt><dd>{active.group}</dd></div><div><dt>業管部門</dt><dd>{active.dept}</dd></div><div><dt>計分方式</dt><dd>{active.rule}</dd></div><div><dt>配分範圍</dt><dd>0–{active.max} 分</dd></div><div><dt>適用分行</dt><dd>150 家分行</dd></div><div><dt>更新頻率</dt><dd>每月第 3 個工作日</dd></div></dl>}
              {detailTab === "versions" && <div className="timeline">{[active.version, "v1.0", "v0.9"].map((v, i) => <div><i /><b>{v}</b><span>{i ? "計分級距調整" : "目前版本"}</span><small>2026/0{7 - i}/0{7 - i} · {active.modifiedBy}</small></div>)}</div>}
              {detailTab === "audit" && <div className="timeline">{["修改年度目標", "調整最高配分", "送交企劃部複核"].map((v, i) => <div><i /><b>{v}</b><span>{i ? "修改前後差異已留存" : "1,200 → 1,350 百萬元"}</span><small>2026/07/0{7 - i} · TRC-2026070{i + 1}</small></div>)}</div>}
              <div className="modal-actions"><button onClick={() => duplicate(active)}>複製指標</button><button onClick={() => setDrawer("edit")}>編輯設定</button>{active.status === "草稿" && <button className="primary" onClick={() => { changeStatus(active.id, "待部門主管審核"); setDrawer(null); }}>送出審核</button>}</div>
            </>
          ) : (
            <form onSubmit={save}>
              <div className="drawer-section"><h3>基本資料</h3>{drawer === "create" && <label className="field"><span>指標代碼</span><input name="id" defaultValue={`KPI-${900 + rows.length}`} required /></label>}<label className="field"><span>指標名稱</span><input name="name" defaultValue={active?.name} required /></label><div className="form-grid"><label className="field"><span>業務群</span><select name="group" defaultValue={active?.group}>{groups.map((x) => <option>{x}</option>)}</select></label><label className="field"><span>業管部門</span><select name="dept" defaultValue={active?.dept}><option>個人金融事業處</option><option>消費金融處</option><option>數位金融處</option><option>財富管理處</option></select></label></div></div>
              <div className="drawer-section"><h3>計分設定</h3><div className="form-grid"><label className="field"><span>計分方式</span><select name="rule" defaultValue={active?.rule}><option>目標達成率</option><option>固定級距</option><option>排名給分</option><option>複合權重</option></select></label><label className="field"><span>最高配分</span><input name="max" type="number" defaultValue={active?.max || 10} min="0" max="30" /></label></div><div className="formula-mini">得分 = MIN（實際值 ÷ 目標值 × 最高配分，最高配分 × 120%）</div></div>
              <div className="drawer-section"><h3>適用範圍</h3><div className="scope-options"><label><input type="checkbox" defaultChecked /> 全部 150 家分行</label><label><input type="checkbox" defaultChecked /> 依考核組別設定目標</label><label><input type="checkbox" /> 排除特殊營業單位</label></div></div>
              <div className="modal-actions"><button type="button" onClick={() => setDrawer(null)}>取消</button><button type="button" onClick={() => alert("已使用 150 家分行資料完成試算")}>預覽試算</button><button className="primary">儲存草稿</button></div>
            </form>
          )}
        </Modal>
      )}
    </Page>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overlay" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon" onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
const steps = [
  "基本資料",
  "資料來源",
  "目標設定",
  "計算規則",
  "配分及限制",
  "預覽與試算",
];
function Wizard() {
  const [s, setS] = useState(0);
  return (
    <Page title="指標設定精靈">
      <div className="steps">
        {steps.map((x, i) => (
          <div className={i === s ? "current" : i < s ? "done" : ""}>
            <i>{i < s ? <Check /> : i + 1}</i>
            <span>{x}</span>
          </div>
        ))}
      </div>
      <Panel title={`步驟 ${s + 1}：${steps[s]}`}>
        <WizardStep s={s} />
        <div className="wizard-actions">
          <button disabled={!s} onClick={() => setS(s - 1)}>
            上一步
          </button>
          {s < 5 ? (
            <button className="primary" onClick={() => setS(s + 1)}>
              下一步
            </button>
          ) : (
            <button className="primary" onClick={() => alert("草稿已儲存")}>
              確認儲存草稿
            </button>
          )}
        </div>
      </Panel>
    </Page>
  );
}
function WizardStep({ s }: { s: number }) {
  const fields = [
    [
      "指標代碼",
      "KPI-041",
      "指標名稱",
      "薪轉戶活躍率",
      "業務群",
      "數位金融",
      "業管部門",
      "數位金融處",
    ],
    [
      "來源類型",
      "資料倉儲",
      "來源欄位",
      "active_payroll_rate",
      "資料日期欄位",
      "data_month",
      "更新頻率",
      "每月",
    ],
    [
      "年度目標",
      "95%",
      "月度目標",
      "依年度目標平均分配",
      "分行差異目標",
      "允許",
      "考核組別設定",
      "啟用",
    ],
    [
      "計算規則",
      "目標達成率",
      "級距間隔",
      "5%",
      "達成率上限",
      "120%",
      "四捨五入",
      "小數 2 位",
    ],
    ["最高配分", "10", "最低得分", "0", "加分上限", "2", "扣分下限", "-3"],
  ][s];
  if (s === 5)
    return (
      <>
        <div className="formula-preview">
          得分 = MIN（實際值 ÷ 目標值 × 10，12）
        </div>
        <div className="kpis">
          <Kpi label="模擬分行數" value="150" delta="已完整試算" />
          <Kpi label="平均得分" value="8.4" delta="分布正常" />
          <Kpi label="滿分分行" value="18" delta="12.0%" />
          <Kpi label="零分分行" value="2" delta="1.3%" good={false} />
        </div>
      </>
    );
  return (
    <div className="form-grid">
      {fields?.reduce(
        (a: any[], _, i) =>
          i % 2 === 0
            ? [
                ...a,
                <label className="field">
                  <span>{fields[i]}</span>
                  <input defaultValue={fields[i + 1]} />
                </label>,
              ]
            : a,
        [],
      )}
    </div>
  );
}
function Formula() {
  const [tokens, setTokens] = useState([
    "房貸利息收入達成率",
    "×",
    "40%",
    "＋",
    "房貸貸放額達成率",
    "×",
    "35%",
    "＋",
    "房貸新戶達成率",
    "×",
    "25%",
  ]);
  const add = (x: string) => setTokens([...tokens, x]);
  return (
    <Page title="公式組合器">
      <div className="grid-formula">
        <Panel title="可用元件">
          {[
            "實際值",
            "目標值",
            "去年同期",
            "前月值",
            "分行人數",
            "其他指標值",
            "＋",
            "－",
            "×",
            "÷",
            "IF",
            "AND",
            "OR",
            "MAX",
            "MIN",
            "權重",
          ].map((x) => (
            <button className="token" onClick={() => add(x)}>
              {x}
            </button>
          ))}
        </Panel>
        <Panel title="總達成率公式">
          <div className="formula-canvas">
            {tokens.map((x, i) => (
              <span onClick={() => setTokens(tokens.filter((_, j) => j !== i))}>
                {x}
              </span>
            ))}
          </div>
          <p className="hint">
            點選公式中的元件即可移除；系統不接受 SQL 語法。
          </p>
          <button className="primary" onClick={() => alert("公式驗證通過")}>
            驗證公式
          </button>
        </Panel>
      </div>
    </Page>
  );
}
function ImportPage({ target = false }: { target?: boolean }) {
  const [file, setFile] = useState("");
  const [preview, setPreview] = useState(false);
  return (
    <Page
      title={target ? "目標設定與 Excel 匯入" : "業績資料匯入中心"}
      actions={
        <button onClick={() => alert("範本下載完成")}>
          <Download />
          下載範本
        </button>
      }
    >
      <div
        className="upload"
        onClick={() => document.getElementById("file")?.click()}
      >
        <Upload />
        <h2>拖放 Excel 檔案或點擊選擇</h2>
        <p>支援 .xlsx、.xls，單檔上限 20 MB</p>
        <input
          id="file"
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files?.[0]?.name || "branch_target_2026.xlsx");
            setPreview(true);
          }}
        />
      </div>
      {preview && (
        <>
          <div className="filebar">
            <FileSpreadsheet />
            <b>{file}</b>
            <span>1.8 MB</span>
            <button className="primary" onClick={() => alert("資料已確認匯入")}>
              確認匯入
            </button>
          </div>
          <div className="kpis">
            <Kpi label="總筆數" value="1,800" delta="150 家分行" />
            <Kpi label="成功筆數" value="1,768" delta="98.2%" />
            <Kpi label="錯誤筆數" value="12" delta="需修正" good={false} />
            <Kpi label="警告筆數" value="20" delta="可匯入" good={false} />
          </div>
          <Panel title="匯入錯誤預覽">
            <table>
              <thead>
                <tr>
                  <th>列號</th>
                  <th>分行代碼</th>
                  <th>指標代碼</th>
                  <th>問題</th>
                  <th>原始值</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }, (_, i) => (
                  <tr>
                    <td>{i + 18}</td>
                    <td>BR-{String(i + 1).padStart(3, "0")}</td>
                    <td>KPI-0{12 + i}</td>
                    <td>
                      <span className="tag bad">
                        {
                          ["分行代碼不存在", "數值格式錯誤", "同月份資料重複"][
                            i % 3
                          ]
                        }
                      </span>
                    </td>
                    <td>{i % 2 ? "—" : "12,OOO"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}
      {!preview && !target && <BatchTable />}
    </Page>
  );
}
function BatchTable() {
  return (
    <Panel title="最近匯入批次">
      <table>
        <thead>
          <tr>
            <th>批次編號</th>
            <th>資料年月</th>
            <th>來源系統</th>
            <th>檔案名稱</th>
            <th>總筆數</th>
            <th>成功</th>
            <th>錯誤</th>
            <th>處理狀態</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => (
            <tr>
              <td>IMP-202607-{String(i + 1).padStart(3, "0")}</td>
              <td>2026/{String(6 - (i % 3)).padStart(2, "0")}</td>
              <td>{["Excel 人工上傳", "排程檔案交換", "資料倉儲"][i % 3]}</td>
              <td>performance_{i + 1}.xlsx</td>
              <td>{fmt(6000 + i * 320)}</td>
              <td>{fmt(5980 + i * 316)}</td>
              <td>{i * 2}</td>
              <td>
                <span className={`tag ${i % 4 ? "ok" : "warn"}`}>
                  {i % 4 ? "處理完成" : "部分成功"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
function Approval() {
  const [cases, setCases] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      name: metrics[i].name,
      dept: metrics[i].dept,
      type: i % 2 ? "規則調整" : "新增指標",
      version: `v${i + 1}.0`,
      stage: "待經營企劃部複核",
    })),
  );
  const action = (i: number, a: string) => {
    alert(`${cases[i].name}：${a}完成`);
    setCases(cases.filter((_, j) => j !== i));
  };
  return (
    <Page
      title="審核與發布中心"
      actions={
        <button
          className="primary"
          onClick={() => alert("發布前檢核通過，正式版本已發布")}
        >
          正式發布
        </button>
      }
    >
      <div className="notice">
        發布前檢核：全行總配分 100 分 · 2 項跨指標依賴警示 · 1
        項尚未設定分行目標
      </div>
      <Panel title={`待審案件（${cases.length}）`}>
        <table>
          <thead>
            <tr>
              <th>指標名稱</th>
              <th>提案部門</th>
              <th>申請類型</th>
              <th>版本</th>
              <th>配分影響</th>
              <th>目前關卡</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((x, i) => (
              <tr>
                <td>
                  <b>{x.name}</b>
                </td>
                <td>{x.dept}</td>
                <td>{x.type}</td>
                <td>{x.version}</td>
                <td>{i % 2 ? "+2" : "不變"}</td>
                <td>
                  <span className="tag warn">{x.stage}</span>
                </td>
                <td>
                  <button className="link" onClick={() => action(i, "核准")}>
                    核准
                  </button>
                  <button
                    className="link red"
                    onClick={() => action(i, "退回")}
                  >
                    退回
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Page>
  );
}
function Audit() {
  return (
    <Page title="版本及稽核紀錄">
      <Filters />
      <Panel title="操作紀錄">
        <table>
          <thead>
            <tr>
              <th>操作時間</th>
              <th>使用者</th>
              <th>所屬單位</th>
              <th>功能</th>
              <th>操作類型</th>
              <th>原因</th>
              <th>IP／裝置</th>
              <th>追蹤編號</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 18 }, (_, i) => (
              <tr>
                <td>
                  2026/07/0{7 - (i % 6)} {9 + (i % 9)}:2{i % 6}
                </td>
                <td>{["王大明", "陳怡君", "林志強", "張雅婷"][i % 4]}</td>
                <td>{["經營企劃部", "個人金融處", "數位金融處"][i % 3]}</td>
                <td>{["指標管理", "審核發布", "目標匯入"][i % 3]}</td>
                <td>{["修改", "核准", "匯入"][i % 3]}</td>
                <td>年度規則調整</td>
                <td>10.20.3.{20 + i} / Chrome</td>
                <td>TRC-{2026070700 + i}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Page>
  );
}
function Executive() {
  return (
    <Page
      title="全行戰情儀表板"
      actions={
        <select>
          <option>2026 年 6 月</option>
        </select>
      }
    >
      <div className="kpis">
        <Kpi label="全行總體達成率" value="93.8%" delta="較上月 2.4%" />
        <Kpi label="預估年底達成率" value="101.6%" delta="可望達標" />
        <Kpi label="達標分行數" value="112 / 150" delta="增加 9 家" />
        <Kpi label="需關注分行" value="14" delta="減少 3 家" />
      </div>
      <div className="grid2 wide">
        <Panel title="各事業群達成率">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cat}>
              <CartesianGrid stroke="#e8edf3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 120]} />
              <Tooltip />
              <Bar dataKey="rate" radius={[5, 5, 0, 0]}>
                {cat.map((x) => (
                  <Cell
                    fill={
                      x.rate > 90
                        ? "#16a36a"
                        : x.rate > 80
                          ? "#f0a000"
                          : "#d9363e"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="全行核心業務趨勢">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1677ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Area dataKey="score" stroke="#1677ff" fill="url(#a)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid2">
        <Panel title="本月改善最多分行">
          {branchNames.slice(0, 5).map((x, i) => (
            <div className="rank">
              <b>{i + 1}</b>
              <span>{x}</span>
              <em>+{5.8 - i * 0.7} 分</em>
            </div>
          ))}
        </Panel>
        <Panel title="本月需優先關注">
          {metrics.slice(0, 5).map((x, i) => (
            <div className="rank">
              <b>{i + 1}</b>
              <span>{x.name}</span>
              <em className="red">{fmt((x.actual / x.target) * 100)}%</em>
            </div>
          ))}
        </Panel>
      </div>
    </Page>
  );
}
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
