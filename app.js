import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, push, set, update, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMXIMLiGh4uH4OP8mb6yd-7Ls_xsk5xIs",
  authDomain: "direcao-nacional-da-musica.firebaseapp.com",
  databaseURL: "https://direcao-nacional-da-musica-default-rtdb.firebaseio.com",
  projectId: "direcao-nacional-da-musica",
  storageBucket: "direcao-nacional-da-musica.firebasestorage.app",
  messagingSenderId: "669596496467",
  appId: "1:669596496467:web:b5ccd86ca14eaf82734ca6",
  measurementId: "G-1WTSR5P2DL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const $ = (id) => document.getElementById(id);
let currentUser = null, isDirector = false, currentSessionId = null, unsubSession = null, unsubParticipants = null, unsubBoard = null;
let boardWriteTimer = null;
const clean = (s, max=300) => String(s || "").trim().slice(0,max);
const showNotice = (message, error=false) => {
  $("notice").innerHTML = "";
  const box = document.createElement("div");
  box.className = "toast" + (error ? " error" : "");
  box.textContent = message;
  $("notice").appendChild(box);
};
const codeFor = (id) => id.slice(-8).toUpperCase();
const sessionPath = (id) => ref(db, `sessions/${id}`);
const stopListeners = () => {
  [unsubSession,unsubParticipants,unsubBoard].forEach(fn=>{if(fn)fn()});
  unsubSession=unsubParticipants=unsubBoard=null;
};
const enterWorkspace = (id) => {
  stopListeners(); currentSessionId=id;
  $("workspace").classList.remove("hidden");
  unsubSession=onValue(sessionPath(id), snap=>{
    const s=snap.val();
    if(!s){$("activeTitle").textContent="Sessão não encontrada";$("activeState").textContent="Indisponível";return;}
    $("activeTitle").textContent=s.title||"Sessão musical";
    $("activeMeta").textContent=(s.type||"Atividade musical")+" · Código "+codeFor(id);
    $("activeState").textContent=s.status==="active"?"Sessão ativa":"Sessão encerrada";
    $("announcementView").textContent=s.announcement||"Sem avisos.";
    if(isDirector){
      $("sessionDetails").textContent=`${s.title||"Sessão"} · ${s.status==="active"?"Ativa":"Encerrada"} · Código: ${codeFor(id)}`;
      $("endSession").disabled=s.status!=="active";
    }
  },err=>showNotice("Não foi possível ler a sessão: "+err.message,true));
  unsubParticipants=onValue(ref(db,`sessions/${id}/participants`),snap=>{
    const people=Object.entries(snap.val()||{}).map(([uid,p])=>({uid,...p})).filter(p=>p.name);
    $("participantCount").textContent=String(people.length);
    const list=$("participants");list.innerHTML="";
    if(!people.length){list.innerHTML='<div class="message">Ainda não há participantes.</div>';return;}
    people.sort((a,b)=>(a.name||"").localeCompare(b.name||"")).forEach(p=>{
      const row=document.createElement("div");row.className="person";
      const name=document.createElement("span");name.textContent=p.name;
      const role=document.createElement("span");role.className="note";role.textContent=p.role==="director"?"Direção":"Participante";
      row.append(name,role);list.appendChild(row);
    });
  },err=>showNotice("Não foi possível carregar participantes: "+err.message,true));
  unsubBoard=onValue(ref(db,`sessions/${id}/boardText`),snap=>{
    const value=snap.val()||"";
    if(document.activeElement!==$("boardText"))$("boardText").value=value;
  },err=>showNotice("Não foi possível sincronizar o quadro: "+err.message,true));
};
const ensureAnon = async () => {
  if(!auth.currentUser) await signInAnonymously(auth);
  currentUser=auth.currentUser;
};
$("connectionStatus").textContent="A ligar ao Firebase…";
onAuthStateChanged(auth, async user=>{
  currentUser=user;
  $("connectionStatus").textContent=user?"Firebase ligado":"A autenticar…";
  if(!user){try{await signInAnonymously(auth)}catch(e){$("connectionStatus").textContent="Sem ligação";showNotice("Ative o método de autenticação anónima no Firebase Authentication e confirme as regras da base de dados. "+e.message,true)}}
});
$("directorMode").addEventListener("click",async()=>{
  const email=clean($("directorEmail").value,200),password=$("directorPassword").value;
  if(!email||!password){showNotice("Introduza o e-mail e a palavra-passe autorizados da Direção.",true);return}
  try{
    await signInWithEmailAndPassword(auth,email,password);
    currentUser=auth.currentUser;isDirector=true;
    $("directorPanel").classList.remove("hidden");
    $("entryPanel").classList.add("hidden");
    showNotice("Sessão da Direção autenticada. Pode criar uma sessão musical.");
  }catch(e){showNotice("Não foi possível autenticar a Direção. Confirme o utilizador e se o método E-mail/palavra-passe está ativo no Firebase Authentication. "+e.message,true)}
});
$("createSession").addEventListener("click",async()=>{
  if(!isDirector||!auth.currentUser||auth.currentUser.isAnonymous){showNotice("Autentique-se como Direção antes de criar sessões.",true);return}
  const title=clean($("sessionTitle").value,120),type=$("sessionType").value;
  if(!title){showNotice("Indique o nome da aula ou ensaio.",true);return}
  try{
    const sessionRef=push(ref(db,"sessions"));
    await set(sessionRef,{title,type,status:"active",createdAt:serverTimestamp(),createdBy:auth.currentUser.uid,announcement:"",boardText:"",participants:{}});
    currentSessionId=sessionRef.key;
    await set(ref(db,`sessions/${currentSessionId}/participants/${auth.currentUser.uid}`),{name:"Direção",role:"director",joinedAt:serverTimestamp()});
    enterWorkspace(currentSessionId);
    $("copyInvite").disabled=false;$("endSession").disabled=false;
    $("sessionDetails").textContent=`${title} · Código: ${codeFor(currentSessionId)}`;
    showNotice("Sessão criada. Copie o link e partilhe-o com os participantes.");
  }catch(e){showNotice("Falha ao criar sessão. Verifique as regras do Realtime Database. "+e.message,true)}
});
$("copyInvite").addEventListener("click",async()=>{
  if(!currentSessionId)return;
  const url=new URL(location.href);url.searchParams.set("s",currentSessionId);
  try{await navigator.clipboard.writeText(url.href);showNotice("Link de entrada copiado. Partilhe-o com os participantes.");}
  catch{showNotice("Copie este link: "+url.href)}
});
$("endSession").addEventListener("click",async()=>{
  if(!isDirector||!currentSessionId)return;
  if(!confirm("Deseja encerrar esta sessão?"))return;
  try{await update(sessionPath(currentSessionId),{status:"ended",endedAt:serverTimestamp()});showNotice("Sessão encerrada.");}
  catch(e){showNotice("Não foi possível encerrar a sessão: "+e.message,true)}
});
$("joinForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=clean($("participantName").value,80),entered=clean($("sessionCode").value,100);
  if(!name||!entered)return;
  try{
    await ensureAnon();
    let id=entered;
    if(entered.length===8){showNotice("Use o link completo da sessão; o código curto ainda não permite procurar sessões com segurança.",true);return}
    if(entered.startsWith("http")){
      const url=new URL(entered);id=url.searchParams.get("s")||"";
    } else if(entered.includes("?s=")) {
      try{id=new URL(entered,location.origin).searchParams.get("s")||""}catch{id=""}
    }
    if(!id){showNotice("Link/código inválido. Peça à Direção o link completo da sessão.",true);return}
    const snap=await new Promise((resolve,reject)=>{
      const stop=onValue(sessionPath(id),s=>{stop();resolve(s)},err=>{stop();reject(err)},{onlyOnce:true});
    });
    const s=snap.val();
    if(!s){showNotice("Sessão não encontrada. Verifique o link.",true);return}
    if(s.status!=="active"){showNotice("Esta sessão já foi encerrada.",true);return}
    isDirector=false;currentSessionId=id;
    await set(ref(db,`sessions/${id}/participants/${auth.currentUser.uid}`),{name,role:"participant",joinedAt:serverTimestamp()});
    $("entryPanel").classList.add("hidden");$("directorPanel").classList.add("hidden");
    enterWorkspace(id);showNotice("Entrou na sessão: "+s.title);
  }catch(e){showNotice("Não foi possível entrar. Verifique o link, a autenticação anónima e as regras Firebase. "+e.message,true)}
});
$("boardText").addEventListener("input",()=>{
  if(!currentSessionId||!isDirector)return;
  clearTimeout(boardWriteTimer);
  boardWriteTimer=setTimeout(()=>set(ref(db,`sessions/${currentSessionId}/boardText`),$("boardText").value).catch(e=>showNotice("Erro ao guardar o quadro: "+e.message,true)),250);
});
document.querySelectorAll("[data-insert]").forEach(btn=>btn.addEventListener("click",()=>{
  const ta=$("boardText");if(!isDirector){showNotice("Só a Direção pode editar o quadro nesta versão inicial.",true);return}
  const start=ta.selectionStart,end=ta.selectionEnd,txt=btn.dataset.insert;
  ta.value=ta.value.slice(0,start)+(start?"\n":"")+txt+ta.value.slice(end);ta.focus();ta.selectionStart=ta.selectionEnd=start+txt.length+1;ta.dispatchEvent(new Event("input"));
}));
$("saveBoard").addEventListener("click",async()=>{
  if(!isDirector||!currentSessionId){showNotice("Só a Direção pode guardar os apontamentos.",true);return}
  try{await set(ref(db,`sessions/${currentSessionId}/boardText`),$("boardText").value);showNotice("Apontamentos guardados e sincronizados.");}
  catch(e){showNotice("Falha ao guardar: "+e.message,true)}
});
$("sendAnnouncement").addEventListener("click",async()=>{
  const announcement=clean($("announcement").value,300);
  if(!isDirector||!currentSessionId){showNotice("Só a Direção pode publicar avisos.",true);return}
  if(!announcement){showNotice("Escreva o aviso antes de publicar.",true);return}
  try{await update(sessionPath(currentSessionId),{announcement});$("announcement").value="";showNotice("Aviso publicado.");}
  catch(e){showNotice("Não foi possível publicar o aviso: "+e.message,true)}
});
document.querySelectorAll("select").forEach(el=>el.addEventListener("change",()=>{}));
const sharedId=new URL(location.href).searchParams.get("s");
if(sharedId){$("sessionCode").value=sharedId;}
