"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { Role } from "@prisma/client";

type User = { id: string; name: string; surname: string; role: Role };

export default function MessagesClient({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [selected, setSelected] = useState<User | null>(users[0] ?? null);
  const [messages, setMessages] = useState<{ id: string; title: string; message: string; createdAt: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!selected) return;
    fetchConversation(selected.id);
  }, [selected]);

  async function fetchConversation(withId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?with=${withId}`);
      if (!res.ok) return;
      const d = await res.json();
      setMessages(d.messages ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!selected || !text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: selected.id, text }) });
      if (!res.ok) {
        alert("Mesaj gönderilemedi");
        return;
      }
      setText("");
      // refresh
      fetchConversation(selected.id);
    } catch {
      alert("Bağlantı hatası");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3 rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] p-3">
        <h2 className="mb-3 text-sm font-semibold text-[#4A0F24]">Kullanıcılar</h2>
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => setSelected(u)}
                className={`w-full text-left rounded-lg px-3 py-2 transition ${selected?.id === u.id ? "bg-[#7B1E3A] text-[#F7E7CE]" : "hover:bg-white/50"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{u.name} {u.surname}</div>
                    <div className="text-xs text-stone-500">{u.role}</div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="col-span-9 rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#4A0F24]">{selected ? `${selected.name} ${selected.surname}` : "Seçili yok"}</h3>
        </div>
        <div className="min-h-[300px] max-h-[60vh] overflow-y-auto rounded-md bg-white p-3">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="py-20 text-center text-sm text-stone-400">Henüz mesaj yok</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="mb-3">
                <div className="text-xs text-stone-400">{new Date(m.createdAt).toLocaleString()}</div>
                <div className="mt-1 rounded-lg bg-[#FAF4EA] p-3 text-sm text-stone-800">{m.message}</div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-xl border border-[#C8A96A]/20 p-3" rows={3} />
          <button onClick={send} disabled={sending || !selected} className="flex items-center gap-2 rounded-xl bg-[#7B1E3A] px-4 py-2 text-sm font-semibold text-[#F7E7CE] hover:bg-[#4A0F24] disabled:opacity-50">
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
            Gönder
          </button>
        </div>
      </section>
    </div>
  );
}
