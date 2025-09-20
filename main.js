/* ========= Configuración ========= */
const INVITE_CONFIG = {
  title: "Mara & Julio",
  subtitle: "¡Nos casamos!",
  datetimeISO: "2025-11-28T17:00:00",
  dateText: "Viernes 28 de noviembre · 17:00 h",
  dateLong: "28 de noviembre de 2025",
  time: "17:00",
  placeName: "Parroquia San José El Vidrio",
  placeShort: "SJV",
  dressCode: "Formal",
  welcome: "Nos encantará compartir este día contigo. Aquí encontrarás itinerario, ubicación y más detalles.",
  address: "Parroquia San José El Vidrio, Estado de México",
  coords: null,
  links: {
    church: "https://maps.app.goo.gl/o9MuE9Zfy4xxydZE7",
    salon:  "https://maps.app.goo.gl/GgRNSyCZKo1xmxzS9"
  },
  itinerary: [
    { time: "17:45", title: "Ceremonia religiosa" },
    { time: "19:40", title: "Coctel de bienvenida" },
    { time: "20:00", title: "Cena" },
    { time: "21:00", title: "Baile" }
  ],
  gallery: [],
  whatsappNumber: "" // "52155XXXXXXXX" para abrir WhatsApp directo
};
/* =================================== */

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

(function main(){
  // Abrir/cerrar sobre
  const seal = $('[data-open]');
  const main = $('#main');
  const replay = $('#replay');
  if (seal){
    seal.addEventListener('click', openInvite);
    seal.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openInvite(); }
    });
  }
  if (replay){
    replay.addEventListener('click', e => { e.preventDefault(); closeInvite(); setTimeout(openInvite, 60); });
  }

  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get('open') === '1'){ document.body.classList.add('open'); main?.setAttribute('aria-hidden','false'); }

  // Bind
  bindText("title", INVITE_CONFIG.title);
  bindText("subtitle", INVITE_CONFIG.subtitle);
  bindText("dateText", INVITE_CONFIG.dateText);
  bindText("dateLong", INVITE_CONFIG.dateLong);
  bindText("time", INVITE_CONFIG.time);
  bindText("placeName", INVITE_CONFIG.placeName);
  bindText("placeShort", INVITE_CONFIG.placeShort);

  bindText("dressCode", INVITE_CONFIG.dressCode);
  bindText("welcome", INVITE_CONFIG.welcome);

  // Countdown
  setupCountdown(INVITE_CONFIG.datetimeISO);

  // Mapa
  setupMap({ address: INVITE_CONFIG.address, coords: INVITE_CONFIG.coords });

  // Enlaces rápidos
  if (INVITE_CONFIG.links){
    if (INVITE_CONFIG.links.church) $('#linkChurch').href = INVITE_CONFIG.links.church;
    if (INVITE_CONFIG.links.salon)  $('#linkSalon').href  = INVITE_CONFIG.links.salon;
  }

  // Itinerario y galería
  renderTimeline(INVITE_CONFIG.itinerary);
  renderGallery(INVITE_CONFIG.gallery);

  // RSVP
  const rsvpBtn = $('#rsvpBtn');
  if (rsvpBtn){
    rsvpBtn.addEventListener('click', async () => {
      const form = rsvpBtn.closest('form');
      const data = Object.fromEntries(new FormData(form).entries());
      const msg = buildWhatsappMessage(data);
      const phone = (INVITE_CONFIG.whatsappNumber || "").replace(/[^\d]/g, '');
      if (phone){
        const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(link, '_blank');
      } else {
        try{ await navigator.clipboard.writeText(msg); alert("Mensaje copiado. Pega en WhatsApp para confirmar."); }
        catch(e){ prompt("Copia el siguiente mensaje y envíalo por WhatsApp:", msg); }
      }
    });
  }
})();

function openInvite(){
  if (document.body.classList.contains('open')) return;
  document.body.classList.add('open');
  $('#main')?.setAttribute('aria-hidden','false');
  const url = new URL(location.href);
  url.searchParams.set('open','1');
  history.replaceState({}, '', url);
}
function closeInvite(){
  document.body.classList.remove('open');
  $('#main')?.setAttribute('aria-hidden','true');
  const url = new URL(location.href);
  url.searchParams.delete('open');
  history.replaceState({}, '', url);
}

function bindText(key, val){ $$(`[data-bind="${key}"]`).forEach(el => el.textContent = val || ''); }

function setupCountdown(iso){
  const el = $('#countdown'); if(!el || !iso) return;
  const target = new Date(iso);
  const tick = () => {
    const now = new Date(); const diff = target - now;
    if (diff <= 0){ el.textContent = "¡Hoy es el gran día!"; return; }
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    el.textContent = `Faltan ${d}d ${h}h ${m}m`;
  };
  tick(); setInterval(tick, 60000);
}

function setupMap({address, coords}){
  const iframe = $('#map'); if(!iframe) return;
  let src = "";
  if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'){
    const q = `${coords.lat},${coords.lng}`;
    src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
  } else if (address){
    src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;
  }
  if (src) iframe.src = src;
}

function renderTimeline(items=[]){
  const ul = $('#timeline'); if(!ul) return;
  ul.innerHTML = items.map(it => `<li><time>${escapeHTML(it.time||"")}</time> <span class="label">${escapeHTML(it.title||"")}</span></li>`).join("");
}

function renderGallery(files=[]){
  const wrap = $('#gallery'); if(!wrap) return;
  wrap.innerHTML = files.map(f => `<figure><img src="img/gallery/${encodeURIComponent(f)}" alt=""></figure>`).join("");
}

function buildWhatsappMessage({name="", attend="yes"}){
  const estado = attend === 'yes' ? "Sí asistiré" : attend === 'maybe' ? "Tal vez asistiré" : "No podré asistir";
  return `Hola, soy ${name}. ${estado} a la boda de ${INVITE_CONFIG.title} (${INVITE_CONFIG.dateText}).`;
}

function escapeHTML(str=""){ return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])) }
