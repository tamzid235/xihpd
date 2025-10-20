const DB_NAME = "field-notes-db";
const DB_VERSION = 1;
const STORE = "projects";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => rej(req.error);
  });
}

async function idbPut(obj) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(obj);
    req.onsuccess = () => res(true);
    req.onerror = () => rej(req.error);
  });
}

async function idbGetAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}

// Utility
const $ = (id) => document.getElementById(id);
const show = (view) => {
  ["view-home","view-data","view-inspection","view-report"]
    .forEach(v => $(v).classList.add("hidden"));
  $(view).classList.remove("hidden");
  $("homeBtn").classList.toggle("hidden", view==="view-home");
};

// Navigation
$("goData").onclick = () => show("view-data");
$("goInspection").onclick = () => show("view-inspection");
$("goReport").onclick = () => show("view-report");
$("homeBtn").onclick = () => { show("view-home"); refreshProjects(); };

// Home project list
async function refreshProjects() {
  const ul = $("projectList");
  ul.innerHTML = "";
  const all = await idbGetAll();
  all.sort((a,b)=>a.id.localeCompare(b.id));
  if (!all.length) return ul.innerHTML = "<li><em>No projects yet.</em></li>";
  all.forEach(p=>{
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>${p.id}</strong><br><span class='muted'>${p.address||""}</span></div>`;
    const btn=document.createElement("button");
    btn.className="btn ghost"; btn.textContent="Open";
    btn.onclick=()=>openInspection(p);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// Data save/open
$("saveProject").onclick = async ()=>{
  const id=$("data-id").value.trim();
  if(!id) return $("data-msg").textContent="ID required.";
  const address=$("data-address").value.trim();
  const scope=$("data-scope").value.trim();
  const existing=await idbGet(id);
  const project={id,address,scope,inspections:existing?.inspections||[]};
  await idbPut(project);
  $("data-msg").textContent="Saved!";
  refreshProjects();
};
$("openProjectFromData").onclick=async()=>{
  const id=$("data-id").value.trim();
  const p=await idbGet(id);
  if(!p) return $("data-msg").textContent="Not found.";
  openInspection(p);
};

// Inspection
$("openInspection").onclick=async()=>{
  const id=$("inspection-id-input").value.trim();
  const p=await idbGet(id);
  if(!p) return $("inspection-status").textContent="No project found.";
  openInspection(p);
};

function openInspection(p){
  show("view-inspection");
  $("inspection-open").classList.add("hidden");
  $("inspection-page").classList.remove("hidden");
  $("insp-title").textContent=p.id;
  $("insp-address").textContent=p.address||"";
  $("insp-scope").textContent=p.scope||"";
  $("insp-date").value=new Date().toISOString().slice(0,10);
  $("insp-time").value=new Date().toTimeString().slice(0,5);
  $("inspection-page").dataset.id=p.id;
  renderInspections(p);
}

$("insp-photos").onchange=()=> {
  const n=$("insp-photos").files.length;
  $("insp-selected").textContent = n?`Selected ${n} photo(s)`:"";
};

$("saveInspection").onclick=async()=>{
  const pid=$("inspection-page").dataset.id;
  const proj=await idbGet(pid);
  const obs=$("insp-obs").value.trim();
  const date=$("insp-date").value;
  const time=$("insp-time").value;
  const files=[...$("insp-photos").files];
  const photos=[];
  for(const f of files) photos.push(await readAsDataURL(f));
  const entry={id:Math.random().toString(36).slice(2,10),date,time,observations:obs,photos};
  proj.inspections.push(entry);
  await idbPut(proj);
  $("insp-obs").value=""; $("insp-photos").value="";
  $("insp-selected").textContent="Saved!";
  renderInspections(proj);
};

function renderInspections(p){
  const wrap=$("insp-list"); wrap.innerHTML="";
  if(!p.inspections?.length){
    wrap.innerHTML="<div class='card'><p class='muted'>No inspections yet.</p></div>";
    return;
  }
  p.inspections.slice().reverse().forEach(i=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`<b>${i.date} • ${i.time}</b><p>${i.observations||""}</p>`;
    if(i.photos?.length){
      const div=document.createElement("div");
      div.className="photos";
      i.photos.forEach(src=>{
        const img=document.createElement("img"); img.src=src; div.appendChild(img);
      });
      card.appendChild(div);
    }
    wrap.appendChild(card);
  });
}

$("openReport").onclick=async()=>{
  const id=$("report-id").value.trim();
  const p=await idbGet(id);
  if(!p) return $("report-status").textContent="No project found.";
  openInspection(p);
};

function readAsDataURL(file){
  return new Promise((res,rej)=>{
    const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file);
  });
}

refreshProjects();
show("view-home");
