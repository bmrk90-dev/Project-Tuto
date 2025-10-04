"use client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useMemo, useState } from "react";
import TutorialCard from "@/components/TutorialCard";
const fetcher = (url: string) => fetch(url).then(r => r.json());
type Category = "Cooking" | "Investing" | "Fitness" | "Tech" | "DIY" | "Outdoors" | "Languages";
const CATEGORIES: (Category | "All")[] = ["All","Cooking","Investing","Fitness","Tech","DIY","Outdoors","Languages"];
export default function Page() {
  const { data, mutate, isLoading } = useSWR("/api/tutorials", fetcher);
  const [query, setQuery] = useState(""); const [cat, setCat] = useState<"All" | Category>("All");
  const [sort, setSort] = useState<"top"|"new"|"shortest">("top");
  const filtered = useMemo(() => {
    if (!data) return [];
    let list = [...data];
    if (cat !== "All") list = list.filter((t) => t.category === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t:any) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag: string) => tag.toLowerCase().includes(q)));
    }
    if (sort === "top") list.sort((a:any,b:any)=>b.votes-a.votes);
    if (sort === "new") list.sort((a:any,b:any)=>+new Date(b.createdAt)-+new Date(a.createdAt));
    if (sort === "shortest") list.sort((a:any,b:any)=>a.durationSec-b.durationSec);
    return list;
  }, [data, query, cat, sort]);
  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between gap-4">
        <div><h1 className="text-3xl md:text-4xl font-bold tracking-tight">Micro Tutorials</h1><p className="text-slate-600 mt-1">Lær noe nytt på under 90 sekunder.</p></div>
        <CreateDialog onCreated={() => mutate()} />
      </header>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 flex items-center gap-2">
          <div className="relative w-full"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Søk etter tips, tags eller emner…" className="pl-3 pr-3 h-11 rounded-2xl border w-full"/></div>
          <button className="rounded-2xl h-11 px-3 border text-sm">Filtre</button>
        </div>
        <div className="flex items-center justify-start md:justify-end gap-2">
          <select value={sort} onChange={(e)=>setSort(e.target.value as any)} className="rounded-2xl h-11 border px-3">
            <option value="top">Mest nyttige</option><option value="new">Nyeste</option><option value="shortest">Kortest</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-6">
        {CATEGORIES.map(c => (<button key={c} onClick={()=>setCat(c as any)} className={`px-3 py-1 rounded-2xl text-sm border ${c===cat ? "bg-slate-900 text-white" : ""}`}>{c}</button>))}
      </div>
      <section className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && <div>Henter…</div>}
        {!isLoading && filtered.map((t:any) => (<TutorialCard key={t.id} t={t} onRefresh={()=>mutate()} />))}
      </section>
      <footer className="mt-10 text-center text-slate-500 text-sm">Bygget med ❤️ – kortformat læring uten støy.</footer>
    </main>
  );}
function CreateDialog({ onCreated }: { onCreated: ()=>void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [category, setCategory] = useState<Category>("Tech");
  const [tags, setTags] = useState(""); const [description, setDescription] = useState(""); const [durationSec, setDurationSec] = useState(60);
  const { trigger, isMutating } = useSWRMutation("/api/tutorials", async (url, { arg }: any) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }); if (!r.ok) throw new Error(await r.text()); return r.json();
  }, { onSuccess: () => { setOpen(false); onCreated(); reset(); } });
  function reset(){ setTitle(""); setCategory("Tech"); setTags(""); setDescription(""); setDurationSec(60); }
  function submit(){
    if(!title.trim()) return alert("Skriv en tittel");
    if(durationSec < 10 || durationSec > 90) return alert("Varighet må være 10–90 sek");
    trigger({ title, category, tags: tags.split(",").map((t)=>t.trim()).filter(Boolean), description, durationSec });
  }
  if(!open) return <button onClick={()=>setOpen(true)} className="rounded-2xl text-sm px-4 h-11 border">+ Nytt tips</button>;
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
      <div className="bg-white rounded-2xl p-4 w-full max-w-lg shadow-lg">
        <h2 className="font-semibold text-lg">Nytt mikrotips</h2>
        <div className="grid gap-3 py-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tittel" className="rounded-2xl border px-3 py-2"/>
          <select value={category} onChange={e=>setCategory(e.target.value as Category)} className="rounded-2xl border px-3 py-2">{["Cooking","Investing","Fitness","Tech","DIY","Outdoors","Languages"].map(c => <option key={c} value={c}>{c}</option>)}</select>
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags, separert med komma" className="rounded-2xl border px-3 py-2"/>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Kort beskrivelse" className="rounded-2xl border px-3 py-2" />
          <div className="flex items-center gap-2"><label className="text-sm text-slate-600">Varighet (sek):</label><input type="number" min={10} max={90} value={durationSec} onChange={e=>setDurationSec(parseInt(e.target.value||"60",10))} className="w-24 rounded-2xl border px-2 py-2"/></div>
        </div>
        <div className="flex justify-end gap-2"><button onClick={()=>setOpen(false)} className="rounded-2xl px-4 py-2 border">Avbryt</button><button onClick={submit} disabled={isMutating} className="rounded-2xl px-4 py-2 border bg-slate-900 text-white">{isMutating ? "Publiserer…" : "Publiser"}</button></div>
      </div>
    </div>
  );}
