"use client";
import { Tutorial } from "@/lib/db";
import useSWRMutation from "swr/mutation";
import { clsx } from "clsx";
async function post(url: string) { const r = await fetch(url, { method: "POST" }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
export default function TutorialCard({ t, onRefresh }: { t: Tutorial; onRefresh: () => void }) {
  const { trigger: upvote, isMutating: voting } = useSWRMutation(`/api/tutorials/${t.id}/vote`, post, { onSuccess: onRefresh });
  const { trigger: save, isMutating: saving } = useSWRMutation(`/api/tutorials/${t.id}/save`, post, { onSuccess: onRefresh });
  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm p-4 bg-white flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{t.creator.name} • {new Date(t.createdAt).toLocaleDateString()}</div>
          <h3 className="text-base font-semibold">{t.title}</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-100">{t.category}</span>
      </div>
      <div className="relative aspect-video w-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 grid place-items-center">
        <span className="text-sm absolute right-2 top-2 bg-black/70 text-white px-2 py-1 rounded-full">{Math.floor(t.durationSec/60)}:{String(t.durationSec%60).padStart(2,"0")}</span>
        <div>▶︎</div>
      </div>
      <p className="text-sm text-slate-600 line-clamp-2">{t.description}</p>
      <div className="flex flex-wrap gap-2">{t.tags.map(tag => <span key={tag} className="text-xs px-2 py-1 rounded-full border">{`#${tag}`}</span>)}</div>
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => upvote()} disabled={voting} className={clsx("rounded-full px-3 py-1 text-sm border", voting && "opacity-60")}>👍 {t.votes}</button>
        <button onClick={() => save()} disabled={saving} className={clsx("rounded-full px-3 py-1 text-sm border", t.saved && "bg-slate-900 text-white", saving && "opacity-60")}>{t.saved ? "Lagret" : "Lagre"}</button>
      </div>
    </div>
  );
}
