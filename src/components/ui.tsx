import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileText } from "lucide-react";
import { statusTone } from "@/lib/labels";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-champagne-300/80 bg-white/65 p-6 shadow-soft backdrop-blur animate-fade-up">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-champagne-100/80 to-transparent" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-muted">Hastane Radyoloji</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-wine-900 md:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-champagne-300/80 bg-white/78 p-5 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-premium ${className}`}>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon = FileText,
  delay = 0
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  delay?: number;
}) {
  return (
    <section
      className="group relative overflow-hidden rounded-2xl border border-champagne-300/80 bg-white/78 p-5 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-premium animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-champagne-100/70 blur-2xl transition group-hover:bg-gold-muted/30" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-wine-900">{value}</p>
          {hint ? <p className="mt-2 text-xs text-stone-500">{hint}</p> : null}
        </div>
        <span className="rounded-2xl bg-wine-500 p-3 text-champagne-50 shadow-soft">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

export function Badge({ value, label }: { value: string; label: string }) {
  const tone = statusTone(value);
  const classes = {
    green: "bg-emerald-50 text-[#2E8B57] ring-emerald-200",
    red: "bg-red-50 text-[#B42318] ring-red-200",
    amber: "bg-amber-50 text-[#B7791F] ring-amber-200",
    blue: "bg-champagne-50 text-wine-900 ring-champagne-300",
    wine: "bg-white text-wine-700 ring-wine-500"
  }[tone];
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>{label}</span>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-champagne-300 bg-white/70 p-8 text-center shadow-sm animate-fade-in">
      <h2 className="text-base font-semibold text-wine-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
    </div>
  );
}

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="btn-primary" href={href}>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = true,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-stone-700">
      <span>{label}</span>
      <input className="form-field mt-1.5" name={name} type={type} required={required} defaultValue={defaultValue} />
    </label>
  );
}

export function TextArea({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-stone-700">
      <span>{label}</span>
      <textarea className="form-field mt-1.5 min-h-32 resize-y" name={name} required={required} />
    </label>
  );
}

export function Select({
  label,
  name,
  children,
  defaultValue,
  required = true
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-stone-700">
      <span>{label}</span>
      <select className="form-field mt-1.5" name={name} defaultValue={defaultValue} required={required}>
        {children}
      </select>
    </label>
  );
}

export function LoadingSkeleton({ className = "h-16" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
