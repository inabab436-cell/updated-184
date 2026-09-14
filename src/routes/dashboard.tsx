import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package, ScrollText, Truck, PhoneCall, Globe, ArrowLeft,
  Bell, CreditCard, AlertTriangle, ShoppingBag, UserRound, Check, HelpCircle,
  MessagesSquare, Clock4, Moon, BadgePercent,
  ShieldAlert, MailCheck, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { HubTabBar } from "@/components/hub/hub-shell";
import { Switch } from "@/components/ui/switch";
import logo from "@/assets/cupai-logo.png.asset.json";
import {
  listNotifications, markNotificationRead, type NotificationRow, type NotificationType,
} from "@/lib/notifications.functions";
import {
  listConversations, setConversationAgent,
  getMerchantAgentSettings, setMerchantAgentGloballyDisabled,
  type ConversationRow,
} from "@/lib/conversations.functions";




export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم · cupai" },
      { name: "description", content: "أدر منتجاتك، سياساتك، شحنك، وبيانات تواصلك." },
    ],
  }),
  component: DashboardPage,
});

type NavItem = {
  to: string;
  badgeKey?: "awaiting_payment";
  title: string;
  desc: string;
  icon: React.ReactNode;
};

type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "المتجر",
    items: [
      { to: "/published", title: "الموقع", desc: "ما يراه العميل على موقعك.", icon: <Globe className="h-5 w-5" /> },
      { to: "/products", title: "المخزون", desc: "المنتجات والمقاسات والكميات.", icon: <Package className="h-5 w-5" /> },
      { to: "/offers", title: "العروض", desc: "خصومات بمدة محددة.", icon: <BadgePercent className="h-5 w-5" /> },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { to: "/orders", title: "الطلبات", desc: "متابعة الشحن والتسليم.", icon: <ShoppingBag className="h-5 w-5" /> },
      { to: "/earnings", title: "الأرباح", desc: "أداء متجرك بالأرقام.", icon: <TrendingUp className="h-5 w-5" /> },
      { to: "/awaiting-payment", title: "بانتظار الدفع", desc: "طلبات تنتظر تأكيدك.", icon: <Moon className="h-5 w-5" />, badgeKey: "awaiting_payment" },
      { to: "/settings/payment-methods", title: "طرق الدفع", desc: "الخيارات التي تقبلها.", icon: <CreditCard className="h-5 w-5" /> },
    ],
  },
  {
    label: "بيانات المتجر",
    items: [
      { to: "/policies", title: "السياسات", desc: "الإرجاع والشروط والخصوصية.", icon: <ScrollText className="h-5 w-5" /> },
      { to: "/shipping", title: "الشحن", desc: "الأسعار حسب المنطقة.", icon: <Truck className="h-5 w-5" /> },
      { to: "/contacts", title: "التواصل", desc: "الهاتف والبريد والعناوين.", icon: <PhoneCall className="h-5 w-5" /> },
    ],
  },
  {
    label: "الوكيل الذكي",
    items: [
      { to: "/missing-info", title: "معلومات ناقصة", desc: "أسئلة لم يجد لها إجابة.", icon: <HelpCircle className="h-5 w-5" /> },
      { to: "/settings/notifications", title: "الإشعارات", desc: "رسائل البريد التي تصلك.", icon: <Bell className="h-5 w-5" /> },
    ],
  },
];

function DashboardPage() {
  const convos = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
    refetchInterval: 15000,
  });
  const awaitingCount = (convos.data ?? []).filter((c) => c.awaiting_payment).length;

  return (
    <div dir="rtl" className="hub min-h-screen pb-24">
      <header className="hub-bar">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src={logo.url} alt="cupai" className="h-8 w-8 shrink-0 rounded-xl" />
            <span className="hub-display truncate text-sm font-bold text-primary">cupai</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="ml-1 h-4 w-4" />
              الرئيسية
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pt-6">
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            لوحة التحكم
          </div>
          <h1 className="mt-1.5 text-[26px] font-bold leading-tight sm:text-3xl">
            أهلاً بك في متجرك
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            كل شيء من مكان واحد.
          </p>
        </section>

        {GROUPS.map((g) => (
          <section key={g.label} className="space-y-2.5">
            <h2 className="px-1 text-[12px] font-bold text-muted-foreground">{g.label}</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {g.items.map((n) => (
                <Link
                  key={n.to}
                  to={n.to as never}
                  className="hub-card flex items-center gap-3 p-4 transition-colors active:bg-accent"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    {n.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[15px] font-bold">
                      <span className="truncate">{n.title}</span>
                      {n.badgeKey === "awaiting_payment" && awaitingCount > 0 && (
                        <span className="hub-chip bg-secondary text-secondary-foreground">
                          {awaitingCount}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                      {n.desc}
                    </span>
                  </span>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        <BrandAgentSettings />
        <ConversationsSection />
        <NotificationsSection />
      </div>

      <HubTabBar />
    </div>
  );
}

function BrandAgentSettings() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["merchant-agent-settings"],
    queryFn: () => getMerchantAgentSettings(),
  });
  const m = useMutation({
    mutationFn: (disabled: boolean) => setMerchantAgentGloballyDisabled({ data: { disabled } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-agent-settings"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: any) => toast.error(e?.message || "تعذر التحديث"),
  });
  const disabled = q.data?.agent_globally_disabled ?? false;
  return (
    <section className="space-y-3">
      {disabled && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4" />
          <div>
            الوكيل الذكي معطّل حالياً على مستوى المتجر بالكامل — لن يتم إرسال أي رد آلي على أي محادثة.
          </div>
        </div>
      )}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 p-4 shadow-card backdrop-blur">
        <div>
          <div className="text-sm font-semibold">إعدادات الوكيل الذكي (المتجر)</div>
          <div className="text-xs text-muted-foreground">
            تعطيل الوكيل الذكي لكل المحادثات
          </div>
        </div>
        <Switch
          checked={disabled}
          disabled={q.isLoading || m.isPending}
          onCheckedChange={(v) => m.mutate(!!v)}
        />
      </div>
    </section>
  );
}

// ============================================================================
// Conversations section
// ============================================================================

// Threshold (ms) under which the latest message counts as "active now" and the
// conversation gets the green dot. Change this one constant to tune sensitivity.
const ACTIVE_NOW_THRESHOLD_MS = 5 * 60 * 1000;

function ConversationsSection() {
  const q = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
    refetchInterval: 15000,
  });

  const filtered: ConversationRow[] = q.data ?? [];

  const now = Date.now();

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <MessagesSquare className="h-4 w-4" />
          المحادثات
        </h2>
        <span className="text-xs text-muted-foreground">
          {q.isLoading ? "جارٍ التحميل…" : `${filtered.length} محادثة`}
        </span>
      </div>

      {q.isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(q.error as Error)?.message || "تعذر تحميل المحادثات."}
        </div>
      )}

      {!q.isLoading && filtered.length === 0 && !q.isError && (
        <div className="rounded-2xl border border-border/60 bg-background/80 p-8 text-center text-sm text-muted-foreground shadow-card backdrop-blur">
          لا توجد محادثات لعرضها.
        </div>
      )}

      <ul className="space-y-2">
        {filtered.map((c) => (
          <ConversationListItem key={c.id} c={c} now={now} />
        ))}
      </ul>
    </section>
  );
}

function ConversationListItem({ c, now }: { c: ConversationRow; now: number }) {
  const qc = useQueryClient();
  const lastIso = c.last_message_at ?? c.created_at;
  const lastMs = new Date(lastIso).getTime();
  const isActive =
    Number.isFinite(lastMs) && now - lastMs <= ACTIVE_NOW_THRESHOLD_MS;

  const toggle = useMutation({
    mutationFn: (enabled: boolean) =>
      setConversationAgent({ data: { id: c.id, enabled } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
    onError: (e: any) => toast.error(e?.message || "تعذر التحديث"),
  });

  const displayName =
    (c.customer_name && c.customer_name.trim()) ||
    (c.visitor_number ? `زائر #${c.visitor_number}` : "زائر");

  return (
    <li className="rounded-xl border border-border/60 bg-background/70 p-3 backdrop-blur-sm shadow-card">
      <div className="flex items-start gap-3">
        <Link
          to="/conversation/$id"
          params={{ id: c.id }}
          className="flex flex-1 min-w-0 items-start gap-3 rounded-lg -m-1 p-1 hover:bg-muted/40"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
            <MessagesSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold">{displayName}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30"
                    : "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/30"
                }`}
                title={formatTime(lastIso)}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {isActive ? "نشط الآن" : "غير نشط"}
              </span>
              <span className="ms-auto text-[11px] text-muted-foreground">
                {formatTime(lastIso)}
              </span>
            </div>
            {c.last_message_preview && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {c.last_message_preview}
              </p>
            )}
          </div>
        </Link>
        <label
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2 py-1 text-[11px]"
          title="تشغيل/إيقاف الوكيل الذكي لهذه المحادثة"
          onClick={(e) => e.stopPropagation()}
        >
          <span className={c.agent_enabled ? "text-emerald-600" : "text-muted-foreground"}>
            وكيل
          </span>
          <Switch
            checked={c.agent_enabled}
            disabled={toggle.isPending}
            onCheckedChange={(v) => toggle.mutate(!!v)}
          />
        </label>
      </div>
    </li>
  );
}


const NOTIF_META: Record<NotificationType, {
  label: string; Icon: React.ComponentType<{ className?: string }>;
  bg: string; text: string; ring: string;
}> = {
  ai_error: {
    label: "خطأ في الذكاء الاصطناعي",
    Icon: AlertTriangle,
    bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/30",
  },
  new_order: {
    label: "طلب جديد",
    Icon: ShoppingBag,
    bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/30",
  },
  human_needed: {
    label: "يحتاج تدخل بشري",
    Icon: UserRound,
    bg: "bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-500/30",
  },
  missing_information: {
    label: "معلومة ناقصة",
    Icon: HelpCircle,
    bg: "bg-blue-500/10", text: "text-blue-600", ring: "ring-blue-500/30",
  },
  missing_info_followup: {
    label: "تم إبلاغ العملاء المنتظرين",
    Icon: MailCheck,
    bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/30",
  },
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
  } catch { return iso; }
}

function NotificationsSection() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications(),
    refetchInterval: 15000,
  });
  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: any) => toast.error(e?.message || "تعذر التحديث"),
  });

  const rows: NotificationRow[] = q.data ?? [];
  const unreadCount = rows.filter((r) => !r.is_read).length;

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Bell className="h-4 w-4" />
          الإشعارات
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </h2>
        <span className="text-xs text-muted-foreground">
          {q.isLoading ? "جارٍ التحميل…" : `${rows.length} إشعار`}
        </span>
      </div>

      {q.isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(q.error as Error)?.message || "تعذر تحميل الإشعارات."}
        </div>
      )}

      {!q.isLoading && rows.length === 0 && !q.isError && (
        <div className="rounded-2xl border border-border/60 bg-background/80 p-8 text-center text-sm text-muted-foreground shadow-card backdrop-blur">
          لا توجد إشعارات بعد.
        </div>
      )}

      <ul className="space-y-2">
        {rows.map((n) => {
          const meta = NOTIF_META[n.type] ?? NOTIF_META.ai_error;
          const Icon = meta.Icon;
          return (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm shadow-card ${
                n.is_read ? "border-border/60 bg-background/70" : "border-primary/30 bg-primary/5 ring-1 ring-primary/10"
              }`}
            >
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-2 ${meta.bg} ${meta.text} ${meta.ring}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${meta.text}`}>{meta.label}</span>
                  {!n.is_read && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      جديد
                    </span>
                  )}
                  <span className="ms-auto text-[11px] text-muted-foreground">{formatTime(n.created_at)}</span>
                </div>
                {n.message && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {n.message}
                  </p>
                )}
                {(n.topic_id || n.followup_topic_id) && (
                  <div className="mt-2">
                    <Link
                      to={"/missing-info" as any}
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] font-medium hover:bg-muted"
                    >
                      <HelpCircle className="h-3 w-3" />
                      عرض في صفحة المعلومات الناقصة
                    </Link>
                  </div>
                )}
              </div>
              {!n.is_read && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 shrink-0"
                  onClick={() => markRead.mutate(n.id)}
                  disabled={markRead.isPending}
                >
                  <Check className="h-3.5 w-3.5" />
                  تحديد كمقروء
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
