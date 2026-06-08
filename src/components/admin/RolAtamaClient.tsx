"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import type { Role } from "@prisma/client";

type UserRow = {
  id: string;
  name: string;
  surname: string;
  email: string;
  tcKimlikNo: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date | string;
};

type Props = {
  initialUsers: UserRow[];
  currentUserId: string;
};

const ROLES: Role[] = ["ADMIN", "DOCTOR", "SECRETARY", "TECHNICIAN", "PATIENT"];

const roleBadgeClass: Record<Role, string> = {
  ADMIN: "bg-[#4A0F24] text-[#F7E7CE]",
  DOCTOR: "bg-[#7B1E3A] text-[#F7E7CE]",
  SECRETARY: "bg-[#C8A96A]/40 text-[#4A0F24]",
  TECHNICIAN: "border border-[#C8A96A] text-[#7B1E3A] bg-transparent",
  PATIENT: "bg-gray-100 text-gray-600"
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  DOCTOR: "Doktor",
  SECRETARY: "Sekreter",
  TECHNICIAN: "Tekniker",
  PATIENT: "Hasta"
};

export function RolAtamaClient({ initialUsers, currentUserId }: Props) {
  const searchParams = useSearchParams();
  const durumParam = searchParams.get("durum");

  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [changedRoles, setChangedRoles] = useState<Record<string, Role>>({});
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [errorRows, setErrorRows] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<Role | "ALL">("ALL");
  const [durumFilter, setDurumFilter] = useState<"ALL" | "ACTIVE" | "PASSIVE">(
    durumParam === "pasif" ? "PASSIVE" : "ALL"
  );

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        search === "" ||
        `${u.name} ${u.surname}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRol = rolFilter === "ALL" || u.role === rolFilter;
      const matchDurum =
        durumFilter === "ALL" ||
        (durumFilter === "ACTIVE" && u.isActive) ||
        (durumFilter === "PASSIVE" && !u.isActive);
      return matchSearch && matchRol && matchDurum;
    });
  }, [users, search, rolFilter, durumFilter]);

  async function handleSave(userId: string) {
    const newRole = changedRoles[userId];
    if (!newRole) return;
    setLoadingRows((p) => ({ ...p, [userId]: true }));
    setErrorRows((p) => ({ ...p, [userId]: "" }));
    try {
      const res = await fetch("/api/admin/rol-atama", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (!res.ok) {
        const d = await res.json();
        setErrorRows((p) => ({ ...p, [userId]: d.error ?? "Hata oluştu" }));
        return;
      }
      setUsers((p) => p.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setChangedRoles((p) => {
        const next = { ...p };
        delete next[userId];
        return next;
      });
    } catch {
      setErrorRows((p) => ({ ...p, [userId]: "Bağlantı hatası" }));
    } finally {
      setLoadingRows((p) => ({ ...p, [userId]: false }));
    }
  }

  async function handleActivate(userId: string) {
    setLoadingRows((p) => ({ ...p, [userId]: true }));
    setErrorRows((p) => ({ ...p, [userId]: "" }));
    try {
      const res = await fetch("/api/admin/rol-atama/aktif", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        const d = await res.json();
        setErrorRows((p) => ({ ...p, [userId]: d.error ?? "Hata oluştu" }));
        return;
      }
      setUsers((p) => p.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
    } catch {
      setErrorRows((p) => ({ ...p, [userId]: "Bağlantı hatası" }));
    } finally {
      setLoadingRows((p) => ({ ...p, [userId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#4A0F24]">Rol Atama</h1>
        <p className="mt-1 text-sm text-stone-500">Kayıt olan kullanıcılara rol atayın ve hesapları aktif edin.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            className="w-full rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value as Role | "ALL")}
        >
          <option value="ALL">Tüm Roller</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
          value={durumFilter}
          onChange={(e) => setDurumFilter(e.target.value as "ALL" | "ACTIVE" | "PASSIVE")}
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="PASSIVE">Pasif</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#7B1E3A] text-[#F7E7CE]">
              <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-semibold">E-posta</th>
              <th className="px-4 py-3 text-left font-semibold">TC Kimlik</th>
              <th className="px-4 py-3 text-left font-semibold">Mevcut Rol</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
              <th className="px-4 py-3 text-left font-semibold">Kayıt</th>
              <th className="px-4 py-3 text-left font-semibold">Yeni Rol</th>
              <th className="px-4 py-3 text-left font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8A96A]/20">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isCurrentUser = u.id === currentUserId;
                const hasChanged = Boolean(changedRoles[u.id]);
                const isLoading = Boolean(loadingRows[u.id]);
                const errorMsg = errorRows[u.id];
                const initials = `${u.name[0]}${u.surname[0]}`.toUpperCase();

                return (
                  <tr
                    key={u.id}
                    className={`transition hover:bg-[#F7E7CE]/50 ${hasChanged ? "border-l-2 border-l-[#C8A96A]" : ""} ${errorMsg ? "border-l-2 border-l-red-400" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7B1E3A] text-xs font-bold text-[#F7E7CE]">
                          {initials}
                        </span>
                        <span className="font-medium text-[#4A0F24]">
                          {u.name} {u.surname}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{u.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">{u.tcKimlikNo ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass[u.role]}`}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-[#C8A96A]/30 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] disabled:cursor-not-allowed disabled:opacity-50"
                        value={changedRoles[u.id] ?? u.role}
                        onChange={(e) =>
                          setChangedRoles((p) => ({ ...p, [u.id]: e.target.value as Role }))
                        }
                        disabled={isCurrentUser || isLoading}
                        title={isCurrentUser ? "Kendi rolünüzü değiştiremezsiniz" : undefined}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabels[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {hasChanged && (
                          <button
                            className="flex items-center gap-1 rounded bg-[#7B1E3A] px-3 py-1 text-sm text-[#F7E7CE] transition hover:bg-[#4A0F24] disabled:opacity-50"
                            onClick={() => handleSave(u.id)}
                            disabled={isLoading}
                          >
                            {isLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                            Kaydet
                          </button>
                        )}
                        {!u.isActive && (
                          <button
                            className="flex items-center gap-1 rounded bg-[#C8A96A] px-3 py-1 text-sm text-[#4A0F24] transition hover:bg-[#b8964f] disabled:opacity-50"
                            onClick={() => handleActivate(u.id)}
                            disabled={isLoading}
                          >
                            {isLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                            Aktif Et
                          </button>
                        )}
                        {errorMsg && <p className="w-full text-xs text-red-600">{errorMsg}</p>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
