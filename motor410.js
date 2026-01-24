const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"},'26':{n:"Vaca",i:"\u{1F404}"},'27':{n:"Perro",i:"\u{1F415}"},'28':{n:"Zamuro",i:"\u{1F985}"},'29':{n:"Elefante",i:"\u{1F418}"},'30':{n:"Caimán",i:"\u{1F40A}"},'31':{n:"Lapa",i:"\u{1F9AB}"},'32':{n:"Ardilla",i:"\u{1F43F}"},'33':{n:"Pescado",i:"\u{1F41F}"},'34':{n:"Venado",i:"\u{1F98C}"},'35':{n:"Jirafa",i:"\u{1F992}"},'36':{n:"Culebra",i:"\u{1F40D}"},'37':{n:"Tortuga",i:"\u{1F422}"},'38':{n:"Búfalo",i:"\u{1F403}"},'39':{n:"Lechuza",i:"\u{1F989}"},'40':{n:"Avispa",i:"\u{1F41D}"},'41':{n:"Canguro",i:"\u{1F998}"},'42':{n:"Tucán",i:"\u{1F99C}"},'43':{n:"Mariposa",i:"\u{1F98B}"},'44':{n:"Chigüire",i:"\u{1F9AB}"},'45':{n:"Garza",i:"\u{1F9A9}"},'46':{n:"Puma",i:"\u{1F408}"},'47':{n:"Pavo Real",i:"\u{1F99A}"},'48':{n:"Puercoespín",i:"\u{1F994}"},'49':{n:"Pereza",i:"\u{1F9A5}"},'50':{n:"Canario",i:"\u{1F424}"},'51':{n:"Pelícano",i:"\u{1F9A4}"},'52':{n:"Pulpo",i:"\u{1F419}"},'53':{n:"Caracol",i:"\u{1F40C}"},'54':{n:"Grillo",i:"\u{1F997}"},'55':{n:"Oso Hormig.",i:"\u{1F9A1}"},'56':{n:"Tiburón",i:"\u{1F988}"},'57':{n:"Pato",i:"\u{1F986}"},'58':{n:"Hormiga",i:"\u{1F41C}"},'59':{n:"Pantera",i:"\u{1F408}\u{200D}\u{2B1B}"},'60':{n:"Camaleón",i:"\u{1F98E}"},'61':{n:"Panda",i:"\u{1F43C}"},'62':{n:"Cachicamo",i:"\u{1F993}"},'63':{n:"Cangrejo",i:"\u{1F980}"},'64':{n:"Gavilán",i:"\u{1F985}"},'65':{n:"Araña",i:"\u{1F577}"},'66':{n:"Lobo",i:"\u{1F43A}"},'67':{n:"Avestruz",i:"\u{1F426}"},'68':{n:"Jaguar",i:"\u{1F406}"},'69':{n:"Conejo",i:"\u{1F407}"},'70':{n:"Bisonte",i:"\u{1F9AC}"},'71':{n:"Guacamaya",i:"\u{1F99C}"},'72':{n:"Gorila",i:"\u{1F98D}"},'73':{n:"Hipopótamo",i:"\u{1F99B}"},'74':{n:"Turpial",i:"\u{1F426}"},'75':{n:"Guácharo",i:"\u{1F987}"}};

const LOTTO_IMGS = {
    'Lotto Activo': 'b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png',
    'La Granjita': '21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg',
    'Ruleta Activa': 'https://i.imgur.com/UmUCfrE.png',
    'Mega Animal 40': 'https://i.imgur.com/A4Nkefb.png',
    'Selva Plus': 'https://i.imgur.com/MbtPoOD.png',
    'El Guacharo': '47daee24c785a3386efd5ffba129ec82ef65e09f.png',
    'Lotto Rey': 'd1760139a96b1c4a49272b76c8473687e13b7c2c.jpeg'
};

const VENEZUELA_BANKS = [
    "Banco de Venezuela", "Banesco", "Mercantil", "Provincial", "Bancamiga", 
    "Banco Nacional de Crédito (BNC)", "Banco del Tesoro", "Banco Exterior", 
    "Bancaribe", "Banco Plaza", "Banplus", "Banco Caroní", "100% Banco", 
    "Sofitasa", "Del Sur", "Banco Activo", "Bicentenario"
];

// --- SE QUITARON LOS DATOS POR DEFECTO PARA QUE NO SALGAN AL RECARGAR ---
let SYSTEM_CONFIG = {
    payment_methods: {
        pago_movil: {
            bank: "Cargando...",
            id: "...",
            phone: "..."
        }
    }
};

const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };
firebase.initializeApp(firebaseConfig); const auth = firebase.auth(); const db = firebase.database();

let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null, globalLimit=0, totalSold=0;
let purchaseState = {totalQty:0, currentCardIndex:0, draftCards:[]}, currentSelection=new Set();
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "", miniGameStatus = 'closed', currentLimits = { general: 700, guacharo: 350 };
let isProcessing = false;
let freeBingoCredits = 0; 

let activeAnimalitosRef=null, activeTripletasRef=null, isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000}, activeDupletasRef=null, dailyResults={}; 
let historyRefs = { trip: null, dup: null, results: null }; 
let historyResults = {}; 

document.addEventListener('DOMContentLoaded', () => {
    populateBankSelect();
    
    // Conectar configuración a Firebase (Preparado para Admin)
    db.ref('config/payment_methods').on('value', s => {
        if(s.exists()) { SYSTEM_CONFIG.payment_methods = s.val(); renderPaymentInfo(); }
    });
    
    auth.onAuthStateChanged(u=>{ 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { document.getElementById('logged-in-area').classList.remove('hidden'); document.getElementById('logged-in-area').style.display='block'; document.getElementById('nav-logout-btn').classList.remove('hidden'); init(); } 
        else { document.getElementById('logged-in-area').classList.add('hidden'); document.getElementById('logged-in-area').style.display='none'; document.getElementById('nav-logout-btn').classList.add('hidden'); }
    });
    
    document.getElementById('auth-form').onsubmit=async(e)=>{e.preventDefault(); const p=document.getElementById('auth-phone').value.replace(/\D/g,''), pw=document.getElementById('auth-password').value, n=document.getElementById('auth-name').value; const email = p+"@bingotexier.com"; try { if(!document.getElementById('auth-name').classList.contains('hidden')){const u=await auth.createUserWithEmailAndPassword(email,pw); await u.user.updateProfile({displayName:n}); await db.ref(`users/${u.user.uid}`).set({name:n, phone:p, balance:0});} else await auth.signInWithEmailAndPassword(email,pw); } catch(e){ document.getElementById('auth-error').textContent=e.message; document.getElementById('auth-error').classList.remove('hidden'); }};
    document.getElementById('toggle-auth-mode').onclick=()=>{const n=document.getElementById('auth-name'); n.classList.toggle('hidden'); document.getElementById('auth-title').textContent=n.classList.contains('hidden')?'Iniciar Sesión':'Registro'; document.getElementById('auth-submit-btn').textContent=n.classList.contains('hidden')?'Acceder':'Registrarme';};
    
    document.getElementById('recharge-btn').onclick=()=>{
        renderPaymentInfo(); 
        document.getElementById('pay-date').valueAsDate = new Date(); // Fecha hoy por defecto
        document.getElementById('deposit-modal').style.display='flex';
    };

    document.getElementById('withdraw-btn').onclick=()=>{document.getElementById('withdraw-form-area').style.display='flex';};
    
    document.getElementById('withdraw-form').onsubmit=async(e)=>{
        e.preventDefault(); 
        const a=parseFloat(document.getElementById('withdraw-amount').value); 
        if(a>userBalance) return alert("Saldo insuficiente"); 
        const bancoSelect = document.getElementById('w-banco');
        const selectedBank = bancoSelect.value;
        if(!selectedBank) return alert("Por favor seleccione un banco.");

        const d = {
            amount:a, 
            tlf:document.getElementById('w-tlf').value, 
            cedula:document.getElementById('w-cedula').value, 
            banco: selectedBank, 
            uid:auth.currentUser.uid, 
            name:auth.currentUser.displayName, 
            userPhone:auth.currentUser.email.split('@')[0], 
            status:'PENDING', 
            timestamp:firebase.database.ServerValue.TIMESTAMP
        }; 
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-a); 
        await db.ref(`users/${auth.currentUser.uid}/balance_pending_withdrawal`).transaction(c=>(c||0)+a); 
        await db.ref('withdrawal_requests').push(d); 
        alert("Enviado"); 
        document.getElementById('withdraw-form-area').style.display='none';
    };
    initTicker(); db.ref('config/tripleta').on('value', s => { if(s.exists()) tripletaConfig = s.val(); });
});

function populateBankSelect() {
    const sel = document.getElementById('w-banco');
    if(!sel) return;
    sel.innerHTML = '<option value="">Seleccione Banco...</option>';
    VENEZUELA_BANKS.sort().forEach(bank => {
        const opt = document.createElement('option');
        opt.value = bank;
        opt.textContent = bank;
        sel.appendChild(opt);
    });
}

function renderPaymentInfo() {
    const data = SYSTEM_CONFIG.payment_methods.pago_movil;
    document.getElementById('pm-bank').textContent = data.bank;
    document.getElementById('pm-id').textContent = data.id;
    document.getElementById('pm-phone').textContent = data.phone;
}

window.copyToClipboard = (elementId) => {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast-notification');
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

// ==========================================
//  LÓGICA DE VERIFICACIÓN CON RAYOS X (FIX FINAL)
// ==========================================
window.verifyPayment = async () => {
    if(!auth.currentUser) return;
    
    const refInput = document.getElementById('pay-ref').value.trim();
    const amountInput = parseFloat(document.getElementById('pay-amount').value);
    
    const btn = document.getElementById('btn-verify');
    const feedback = document.getElementById('verify-feedback');
    const btnSupport = document.getElementById('btn-support-manual');
    const originalBtnText = '<i class="fas fa-search mr-2"></i> VERIFICAR AHORA';

    if(refInput.length < 4) { alert("Revisa la referencia (mínimo 4 números)."); return; }
    if(!amountInput || amountInput <= 0) { alert("Monto inválido."); return; }

    btn.disabled = true; 
    btn.className = "w-full bg-gray-500 text-white font-bold py-3 rounded-lg shadow-inner cursor-not-allowed flex justify-center items-center";
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2 text-xl"></i> BUSCANDO PAGO...';
    
    feedback.classList.remove('hidden');
    feedback.className = "mt-3 text-center p-3 rounded-lg text-xs text-gray-500 font-mono animate-pulse";
    feedback.innerHTML = "Escaneando transferencias entrantes...";
    btnSupport.classList.add('hidden');

    try {
        await new Promise(r => setTimeout(r, 1500));

        const snapshot = await db.ref('pagos_entrantes').once('value');
        let matchFound = null;

        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const raw = child.val();
                
                // Función interna para buscar en profundidad (RAYOS X)
                const checkMatch = (data, key) => {
                    if (!data) return null;
                    if (data.mensaje_banco) {
                        const txt = data.mensaje_banco.toLowerCase();
                        const hasRef = txt.includes(refInput);
                        const amountStr = amountInput.toString(); 
                        const amountComa = amountStr.replace('.', ',');
                        const hasMonto = txt.includes(amountStr) || txt.includes(amountComa);
                        
                        if (hasRef && hasMonto && (!data.status || data.status === 'pendiente_revision')) {
                            return { key: key, data: data };
                        }
                    }
                    return null;
                };

                // 1. Probar directo
                let result = checkMatch(raw, child.key);
                
                // 2. Si no, probar adentro (si es carpeta SIN_REF)
                if (!result && typeof raw === 'object') {
                    Object.keys(raw).forEach(subKey => {
                        const subResult = checkMatch(raw[subKey], child.key + "/" + subKey); // Guardamos la ruta compuesta
                        if (subResult) result = subResult;
                    });
                }

                if (result) matchFound = result;
            });
        }

        if (matchFound) {
            // ÉXITO
            await db.ref(`pagos_entrantes/${matchFound.key}`).update({
                status: 'claimed',
                claimed_by: auth.currentUser.uid,
                claimed_at: firebase.database.ServerValue.TIMESTAMP
            });

            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(current => (current || 0) + amountInput);

            btn.className = "w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center transform scale-105 transition-all";
            btn.innerHTML = '<i class="fas fa-check-circle mr-2 text-2xl"></i> ¡APROBADO!';
            
            feedback.className = "mt-3 text-center p-3 rounded-lg text-sm font-bold bg-green-100 text-green-700 border border-green-300";
            feedback.innerHTML = `✅ Recarga exitosa de ${amountInput} Bs.`;

            setTimeout(() => {
                document.getElementById('deposit-modal').style.display='none';
                document.getElementById('verify-payment-form').reset();
                btn.disabled = false;
                btn.className = "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center";
                btn.innerHTML = originalBtnText;
                feedback.classList.add('hidden');
            }, 2500);

        } else {
            // FALLO
            btn.disabled = false;
            btn.className = "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center";
            btn.innerHTML = '<i class="fas fa-redo mr-2"></i> INTENTAR DE NUEVO';

            feedback.className = "mt-3 text-center p-3 rounded-lg text-sm font-bold bg-red-100 text-red-700 border border-red-300";
            feedback.innerHTML = `⚠️ No encontrado. Verifica que el SMS del banco haya llegado.`;
            
            const msg = `Soporte: Pagué y no se acreditó.%0A%0A*Ref:* ${refInput}%0A*Monto:* ${amountInput}`;
            btnSupport.href = `https://wa.me/584129394787?text=${msg}`;
            btnSupport.classList.remove('hidden');
        }

    } catch (error) {
        console.error(error);
        btn.disabled = false;
        btn.className = "w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg shadow-lg";
        btn.innerHTML = 'Error de conexión. Probar otra vez.';
    }
};


// --- FIN LÓGICA VERIFICACIÓN ---
// (El resto del código sigue igual)

function initTicker(){const t=document.getElementById('ticker-content'); if(t){const names=["Carlos R.","Maria G.","Jose L.","Ana P.","Luis M.","Elena S."]; const actions=[{label:"Ganó",min:400,max:2500,icon:"fas fa-ticket-alt"},{label:"Tripleta",min:100000,max:100000,icon:"fas fa-layer-group"}]; let h=""; for(let i=0;i<30;i++){const n=names[Math.floor(Math.random()*names.length)]; const act=actions[Math.floor(Math.random()*actions.length)]; const a=Math.floor(Math.random()*(act.max-act.min+1))+act.min; h+=`<div class="ticker__item"><i class="${act.icon}"></i> ${n} <span class="ticker__action">${act.label}</span>: <span class="ticker__amount">${a.toLocaleString('es-VE')} Bs</span></div>`;} t.innerHTML=h;}}

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{userBalance=s.val()||0; document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;});
    
    db.ref(`users/${auth.currentUser.uid}/free_bingo_credits`).on('value', s => {
        freeBingoCredits = s.val() || 0;
        const badge = document.getElementById('free-ticket-badge');
        if(badge) {
            if(freeBingoCredits > 0) { badge.classList.remove('hidden'); badge.textContent = `¡TIENES ${freeBingoCredits} GRATIS!`; } 
            else { badge.classList.add('hidden'); }
        }
    });

    db.ref('config/limits').on('value', s => { if(s.exists()) currentLimits = s.val(); });
    syncTime(); startCountdown();
    db.ref('draw_status').on('value', s=>{ const d = s.val() || {}; currentDate = d.date; if(d.status==='active') { db.ref(`draw_details/${d.date}`).once('value', v=>{ const val=v.val()||{}; currentCardPrice=val.price||0; globalLimit=val.limit||0; if(document.getElementById('starter-card-price')) document.getElementById('starter-card-price').textContent=currentCardPrice.toFixed(2); updateUrgency(); }); } });
    db.ref('bingo_aprobados_estelar').on('value',s=>{ let c=0; s.forEach(x=>{if(x.val().date===currentDate)c++}); totalSold=c; updateUrgency(); });
}

function startCountdown(){setInterval(()=>{const now=new Date(); let t=new Date(); t.setHours(20,0,0,0); if(now>t) t.setDate(t.getDate()+1); const d=t-now, h=Math.floor(d/3600000), m=Math.floor((d%3600000)/60000), s=Math.floor((d%60000)/1000); document.getElementById('countdown-timer').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;},1000);}
async function syncTime(){try{const r=await fetch('https://worldtimeapi.org/api/timezone/America/Caracas');const d=await r.json();serverTimeOffset=new Date(d.datetime).getTime()-Date.now();}catch(e){}updateGameDate();}
function updateGameDate(){const now=new Date(Date.now()+serverTimeOffset); if(now.getHours()>=20) now.setDate(now.getDate()+1); currentDateStr=`${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`; document.getElementById('game-date-display').textContent=currentDateStr; db.ref(`results_log/${currentDateStr}`).on('value',s=>{dailyResults=s.val()||{}; loadMyDailyBets();}); loadMyDailyBets();}

function switchMode(t){
    ['section-bingo','section-animalitos'].forEach(x=>{ document.getElementById(x).classList.add('hidden'); document.getElementById(x).style.display='none'; }); 
    document.getElementById(`section-${t}`).classList.remove('hidden'); document.getElementById(`section-${t}`).style.display='block'; 
    document.getElementById('game-selector').classList.add('hidden');
    const btn = document.getElementById('main-live-btn'); if(btn) { if(t === 'animalitos') btn.style.display = 'none'; else btn.style.display = 'block'; }
}

function updateUrgency(){const b=document.getElementById('urgency-bar-fixed'); if(currentCardPrice>0){b.classList.remove('hidden'); let r=globalLimit-totalSold; document.getElementById('urgency-text').textContent=(r<50&&globalLimit>0)?`¡SOLO ${r} DISPONIBLES!`:`${totalSold}/${globalLimit} VENDIDOS`;}else{b.classList.add('hidden');}}

// BINGO LOGIC
if(document.getElementById('start-purchase-btn')) document.getElementById('start-purchase-btn').onclick=()=>{document.getElementById('chat-flow-area').classList.remove('hidden'); document.getElementById('bot-message-display').innerHTML="¿Cuántos cartones?"; document.getElementById('quantity-selector-area').classList.remove('hidden'); const q=document.getElementById('quantity-grid'); q.innerHTML=''; for(let i=1;i<=15;i++){ const b=document.createElement('div'); b.className="qty-btn"; b.textContent=i; b.onclick=()=>startBingoSel(i); q.appendChild(b); }}
function startBingoSel(n){ purchaseState={totalQty:n, currentCardIndex:0, draftCards:[]}; document.getElementById('quantity-selector-area').classList.add('hidden'); document.getElementById('animal-selector-area').classList.remove('hidden'); renderBingoSel(); }
function renderBingoSel(){ currentSelection.clear(); document.getElementById('current-card-num').textContent=purchaseState.currentCardIndex+1; document.getElementById('confirm-card-btn').disabled=true; document.getElementById('confirm-card-btn').classList.add('opacity-50', 'cursor-not-allowed'); document.getElementById('selection-counter').textContent="0/15"; const g=document.getElementById('animal-selection-grid'); g.innerHTML=''; for(let i=1; i<=25; i++) { const b=document.createElement('div'); b.className="select-animal-btn"; b.innerHTML = `<span class="emoji-font">${ANIMAL_MAP_BINGO[i].i}</span>${i}-${ANIMAL_MAP_BINGO[i].n}`; b.onclick=()=>{ if(currentSelection.has(i)) { currentSelection.delete(i); b.classList.remove('selected'); } else if(currentSelection.size<15) { currentSelection.add(i); b.classList.add('selected'); } const done = currentSelection.size === 15; document.getElementById('confirm-card-btn').disabled = !done; if(done) document.getElementById('confirm-card-btn').classList.remove('opacity-50', 'cursor-not-allowed'); else document.getElementById('confirm-card-btn').classList.add('opacity-50', 'cursor-not-allowed'); document.getElementById('selection-counter').textContent = currentSelection.size + "/15"; }; g.appendChild(b); } }
window.fillRandomAnimals=()=>{ currentSelection.clear(); Array.from({length:25},(_,i)=>i+1).sort(()=>Math.random()-0.5).slice(0,15).forEach(x=>currentSelection.add(x)); const ds=document.getElementById('animal-selection-grid').children; for(let i=0;i<25;i++) if(currentSelection.has(i+1)) ds[i].classList.add('selected'); else ds[i].classList.remove('selected'); document.getElementById('selection-counter').textContent="15/15"; document.getElementById('confirm-card-btn').disabled=false; document.getElementById('confirm-card-btn').classList.remove('opacity-50'); }

window.confirmCurrentCard=async()=>{ 
    purchaseState.draftCards.push(Array.from(currentSelection).sort((a,b)=>a-b)); purchaseState.currentCardIndex++; 
    if(purchaseState.currentCardIndex<purchaseState.totalQty) { renderBingoSel(); } 
    else { 
        let paidCount = purchaseState.totalQty, usedFree = 0;
        if(freeBingoCredits > 0) { usedFree = Math.min(purchaseState.totalQty, freeBingoCredits); paidCount = purchaseState.totalQty - usedFree; }
        const cost = paidCount * currentCardPrice; 
        if(cost > userBalance) return alert("Saldo insuficiente"); 
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c || 0) - cost);
        if(usedFree > 0) { await db.ref(`users/${auth.currentUser.uid}/free_bingo_credits`).transaction(c => (c || 0) - usedFree); }
        const cards = purchaseState.draftCards.map(n => ({numbers:n, id:sha256(JSON.stringify(n)).substring(0,8)})); 
        await Promise.all(cards.map((c, index) => {
            const isFree = index < usedFree;
            return db.ref('bingo_aprobados_estelar').push({ numbers:c.numbers, id:c.id, uid:auth.currentUser.uid, date:currentDate, status:'APROBADO', payment_method: isFree ? 'GRATIS' : 'SALDO' });
        })); 
        document.getElementById('bot-message-display').innerHTML = `\u2705 Listo. ${purchaseState.totalQty} cartones.`; 
        setTimeout(() => document.getElementById('chat-flow-area').classList.add('hidden'), 3000); 
        document.getElementById('my-cards-btn').click(); 
    } 
}

window.loadMyBingoHistory = () => {
    document.getElementById('carton-display-container').classList.remove('hidden'); const listCards = document.getElementById('carton-list'); listCards.innerHTML=''; 
    db.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(auth.currentUser.uid).once('value',s=>{ let found = false; s.forEach(c=>{ if(c.val().date===currentDate){ found = true; const gridHtml = c.val().numbers.map(n => { const animal = ANIMAL_MAP_BINGO[n]; return `<div class='animal-cell'><span style='font-size:14px; display:block;'>${animal.i}</span>${n}</div>`; }).join(''); const d=document.createElement('div'); d.className="bingo-card"; d.innerHTML=`<div class='text-center font-bold text-gray-700 mb-1'>ID: ${c.val().id}</div><div class='animal-grid'>${gridHtml}</div>`; listCards.appendChild(d); }}); if(!found) document.getElementById('no-cards-msg').classList.remove('hidden'); else document.getElementById('no-cards-msg').classList.add('hidden'); });
}

// ANIMALITOS MODES
window.toggleTripletaMode = () => { isTripletaMode = !isTripletaMode; isDupletaMode = false; updateModeUI(); }
window.toggleDupletaMode = () => { isDupletaMode = !isDupletaMode; isTripletaMode = false; updateModeUI(); }

function updateModeUI() {
    const btnTrip = document.getElementById('tripleta-toggle-btn'), btnDup = document.getElementById('dupleta-toggle-btn');
    const banTrip = document.getElementById('tripleta-banner'), banDup = document.getElementById('dupleta-banner');
    btnTrip.className = btnDup.className = "w-full py-2 rounded-lg font-bold text-white bg-gray-400 hover:bg-gray-500 shadow-md transition-all";
    banTrip.classList.add('hidden'); banDup.classList.add('hidden');
    document.getElementById('amount-input-container').classList.remove('hidden'); document.getElementById('lottery-grid-container').classList.remove('hidden');
    document.getElementById('selection-label').textContent = "ELIGE TUS ANIMALITOS:";
    if(isTripletaMode) {
        btnTrip.className = "w-full py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-all";
        banTrip.classList.remove('hidden'); document.getElementById('amount-input-container').classList.add('hidden'); document.getElementById('lottery-grid-container').classList.add('hidden');
        document.getElementById('selection-label').textContent = "SELECCIONA 3 ANIMALES:"; selectLottery('Lotto Activo', 0); document.getElementById('selected-lottery-title').textContent = "TRIPLETA (Todas las Loterías)";
    } else if(isDupletaMode) {
        btnDup.className = "w-full py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all";
        banDup.classList.remove('hidden'); document.getElementById('amount-input-container').classList.add('hidden'); document.getElementById('lottery-grid-container').classList.add('hidden');
        document.getElementById('selection-label').textContent = "SELECCIONA 2 ANIMALES:"; selectLottery('Lotto Activo', 0); document.getElementById('selected-lottery-title').textContent = "DUPLETA (Lotto, Granjita, Selva)";
    }
    if(selectedLotto) renderLottoGrid(false);
}

window.selectLottery = (name, payout) => {
    selectedLotto = name; document.getElementById('animalitos-game-area').classList.remove('hidden');
    if(!isTripletaMode && !isDupletaMode) {
        document.getElementById('selected-lottery-title').textContent = `${name} (Ganas x${payout})`;
        document.querySelectorAll('.lottery-btn').forEach(b=>b.classList.remove('lottery-selected'));
        let btnId = 'btn-lotto-activo'; if(name.includes('Granjita')) btnId='btn-la-granjita'; if(name.includes('Rey')) btnId='btn-lotto-rey'; if(name.includes('Guacharo')) btnId='btn-el-guacharo'; if(name.includes('Ruleta')) btnId='btn-ruleta-activa'; if(name.includes('Mega')) btnId='btn-mega-animal-40'; if(name.includes('Selva')) btnId='btn-selva-plus';
        if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('lottery-selected');
    }
    renderLottoTime(name); renderLottoGrid((name === 'El Guacharo' && !isTripletaMode && !isDupletaMode));
};

function renderLottoTime(name) {
    const sel = document.getElementById('lotto-time-select'); sel.innerHTML = '';
    const now = new Date(Date.now() + serverTimeOffset), refDate = new Date(now); if(now.getHours() >= 20) { refDate.setDate(refDate.getDate()+1); refDate.setHours(7,0,0,0); }
    let start = 8; if (isTripletaMode || isDupletaMode || name === 'Mega Animal 40') start = 9; else if (name === 'Lotto Rey') start = 8.5;
    let end = (name === 'Lotto Rey') ? 19.5 : 19;
    for(let h=start; h<=end; h++) {
        const hour = Math.floor(h), min = (h % 1) * 60, drawTime = new Date(refDate); drawTime.setHours(hour, min, 0, 0);
        if(now < new Date(drawTime.getTime() - 600000)) { const txt = `${(hour > 12 ? hour - 12 : hour)}:${(min === 0 ? '00' : '30')} ${hour >= 12 ? 'PM' : 'AM'}`; const opt = document.createElement('option'); opt.value = txt; opt.textContent = txt; sel.appendChild(opt); }
    }
}

function renderLottoGrid(isGuacharo) {
    const g = document.getElementById('lotto-animal-grid'); g.innerHTML=''; selectedLottoAnimals.clear(); updateLottoTotal();
    const limit = (isTripletaMode || isDupletaMode) ? 36 : (isGuacharo ? 75 : 36);
    const keys = ['0','00', ...Array.from({length:limit},(_,i)=>(i+1).toString())];
    keys.forEach(k => {
        const a = ANIMAL_MAP_LOTTO[k] || {n:`Num ${k}`, i:"\u2753"};
        const d = document.createElement('div'); d.className = 'select-animal-btn'; d.innerHTML = `<span class="emoji-font-lg">${a.i}</span><span class="text-[10px] font-bold">${k}</span><span class="text-[8px] truncate w-full text-center">${a.n}</span>`;
        d.onclick = () => {
            if(isTripletaMode || isDupletaMode) {
                const max = isTripletaMode ? 3 : 2, css = isTripletaMode ? 'tripleta-mark' : 'dupleta-mark';
                if(selectedLottoAnimals.has(k)) { selectedLottoAnimals.delete(k); d.classList.remove('selected', css); } else if(selectedLottoAnimals.size < max) { selectedLottoAnimals.add(k); d.classList.add('selected', css); }
            } else { if(selectedLottoAnimals.has(k)) { selectedLottoAnimals.delete(k); d.classList.remove('selected'); } else { selectedLottoAnimals.add(k); d.classList.add('selected'); } }
            updateLottoTotal();
        }; g.appendChild(d);
    });
}

function updateLottoTotal() {
    if(isTripletaMode) { const done = selectedLottoAnimals.size === 3; document.getElementById('lotto-total-display').textContent = done ? `Tripleta Lista` : `Selecciona 3`; document.getElementById('lotto-play-btn').disabled=!done; document.getElementById('lotto-play-btn').classList.toggle('opacity-50', !done); }
    else if (isDupletaMode) { const done = selectedLottoAnimals.size === 2; document.getElementById('lotto-total-display').textContent = done ? `Dupleta Lista` : `Selecciona 2`; document.getElementById('lotto-play-btn').disabled=!done; document.getElementById('lotto-play-btn').classList.toggle('opacity-50', !done); }
    else { const amt = parseFloat(document.getElementById('lotto-amount').value) || 0; document.getElementById('lotto-total-display').textContent = `Total: ${(amt * selectedLottoAnimals.size).toFixed(2)} Bs`; document.getElementById('lotto-play-btn').disabled=false; document.getElementById('lotto-play-btn').classList.remove('opacity-50'); }
}
document.getElementById('lotto-amount').addEventListener('input', updateLottoTotal);

window.placeBet = async () => {
    if(isProcessing) return; isProcessing = true; const time = document.getElementById('lotto-time-select').value;
    const [hStr, mStr] = time.split(':'); let [mins, period] = mStr.split(' '); let hour = parseInt(hStr);
    if(period === 'PM' && hour < 12) hour += 12; if(period === 'AM' && hour === 12) hour = 0;
    const drawDate = new Date(Date.now() + serverTimeOffset); drawDate.setHours(hour, parseInt(mins), 0, 0);
    const limitTimestamp = drawDate.getTime() - (10 * 60 * 1000); 

    try {
        if(isTripletaMode) {
            if(selectedLottoAnimals.size !== 3) throw new Error("Debes seleccionar 3 animales.");
            const cost = tripletaConfig.cost; if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost);
            await db.ref(`bets_tripletas/${currentDateStr}/${auth.currentUser.uid}`).push({ lottery: selectedLotto, time, animals: Array.from(selectedLottoAnimals), amount: cost, status: 'PENDING', limit_timestamp: limitTimestamp, timestamp: firebase.database.ServerValue.TIMESTAMP });
            await db.ref(`users/${auth.currentUser.uid}/free_bingo_credits`).transaction(c => (c || 0) + 1);
            alert("\u2705 ¡Tripleta Jugada! \n🎁 Tienes 1 Ticket de Bingo GRATIS.");
        } else if (isDupletaMode) {
            if(selectedLottoAnimals.size !== 2) throw new Error("Debes seleccionar 2 animales.");
            const cost = dupletaConfig.cost; if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost);
            await db.ref(`bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`).push({ lottery: "Dupleta", time, animals: Array.from(selectedLottoAnimals), amount: cost, status: 'PENDING', limit_timestamp: limitTimestamp, timestamp: firebase.database.ServerValue.TIMESTAMP });
            alert("\u2705 ¡Dupleta Jugada!");
        } else {
            const amt = parseFloat(document.getElementById('lotto-amount').value); if(selectedLottoAnimals.size === 0 || !amt || amt<1) throw new Error("Faltan datos");
            const cost = amt * selectedLottoAnimals.size; if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost); const u={}; const baseRef = `bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`;
            selectedLottoAnimals.forEach(animal => { const k = db.ref(baseRef).push().key; u[`${baseRef}/${k}`] = { lottery: selectedLotto, time, animal, amount: amt, status: 'PENDING', limit_timestamp: limitTimestamp, timestamp: firebase.database.ServerValue.TIMESTAMP }; });
            await db.ref().update(u); alert("\u2705 ¡Ticket Jugado!");
        }
        selectedLottoAnimals.clear(); updateModeUI();
    } catch(e) { alert(e.message); } finally { isProcessing = false; }
};

function getIndividualResult(lottery, timeStr) {
    if(!dailyResults || !dailyResults[lottery]) return null;
    let cleanTime = timeStr.replace(/^0+/, '').replace(/:/g, '-').replace(/\./g, '').trim();
    const possibleKeys = [cleanTime, `0${cleanTime}`];
    for (let key of possibleKeys) { if (dailyResults[lottery][key]) return String(dailyResults[lottery][key]); }
    return null;
}

// --- HISTORIAL (TRIPLETAS/DUPLETAS) CON FECHAS ---
window.openTripletaModal = () => { document.getElementById('modal-tripletas').style.display = 'flex'; const todayISO = new Date(Date.now() + serverTimeOffset).toISOString().split('T')[0]; const input = document.getElementById('history-date-trip'); if(input) input.value = todayISO; watchHistory('tripletas', todayISO); }
window.openDupletaModal = () => { document.getElementById('modal-dupletas').style.display = 'flex'; const todayISO = new Date(Date.now() + serverTimeOffset).toISOString().split('T')[0]; const input = document.getElementById('history-date-dup'); if(input) input.value = todayISO; watchHistory('dupletas', todayISO); }

window.watchHistory = (type, dateInputVal) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const [year, month, day] = dateInputVal.split('-');
    const dbDateStr = `${day}-${month}-${year}`;

    const container = type === 'tripletas' ? document.getElementById('popup-tripletas-list') : document.getElementById('popup-dupletas-list');
    container.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i><p class="text-xs text-gray-400 mt-2">Buscando tickets...</p></div>';

    if (type === 'tripletas' && historyRefs.trip) historyRefs.trip.off();
    if (type === 'dupletas' && historyRefs.dup) historyRefs.dup.off();
    if (historyRefs.results) historyRefs.results.off();

    historyRefs.results = db.ref(`results_log/${dbDateStr}`);
    historyRefs.results.on('value', rSnap => {
        historyResults = rSnap.val() || {}; 
        const path = type === 'tripletas' ? `bets_tripletas/${dbDateStr}/${uid}` : `bets_dupletas/${dbDateStr}/${uid}`;
        const ref = db.ref(path);
        
        if (type === 'tripletas') historyRefs.trip = ref; else historyRefs.dup = ref;

        ref.on('value', s => {
            container.innerHTML = '';
            if (!s.exists()) { container.innerHTML = `<div class="text-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl"><i class="far fa-calendar-times text-4xl mb-2 opacity-30"></i><br>Sin jugadas el ${dbDateStr}</div>`; return; }
            const bets = []; 
            s.forEach(c => { bets.push(c.val()); });
            bets.reverse().forEach(b => { renderHistoryTicket(type, b, container, dbDateStr); });
        });
    });
};

function renderHistoryTicket(type, b, container, dateLabel) {
    let stHtml = b.status === 'WIN' ? '<span class="text-white bg-green-500 px-2 rounded font-bold text-[10px] shadow animate-pulse">¡GANADORA!</span>' : (b.status === 'LOST' ? '<span class="text-white bg-red-500 px-2 rounded font-bold text-[10px]">NO ACERTADO</span>' : '<span class="text-gray-600 bg-gray-200 px-2 rounded text-[10px] border">EN JUEGO</span>');
    let animalsSafe = b.animals || []; if (!Array.isArray(animalsSafe)) animalsSafe = Object.values(animalsSafe);
    const hitData = calculateHitsHistory(type, b.time, animalsSafe);
    const animalsWithEmojis = animalsSafe.map(num => {
        const strNum = String(num); const info = ANIMAL_MAP_LOTTO[strNum] || { i: '\u2753', n: '?' }; const isHit = hitData.hits.includes(strNum);
        return `<div class="flex flex-col items-center mx-1 p-1 rounded-lg border ${isHit ? 'border-green-500 bg-green-100 shadow transform scale-105' : 'border-gray-200 bg-white'}"><span class="text-xl">${info.i}</span><span class="font-black text-gray-800 text-xs">${strNum}</span></div>`;
    }).join('');
    const colorClass = type === 'tripletas' ? 'purple' : 'blue'; const title = type === 'tripletas' ? 'TRIPLETA' : 'DUPLETA'; const target = type === 'tripletas' ? 3 : 2;
    const tDiv = document.createElement('div'); tDiv.className = `bg-white border-l-4 border-${colorClass}-500 rounded-r-lg shadow-sm mb-3 overflow-hidden border-t border-r border-b border-gray-100`;
    tDiv.innerHTML = `<div class="p-2 border-b border-gray-100 flex justify-between items-center bg-gray-50"><div><span class="font-black text-${colorClass}-700 text-xs block">${title}</span><span class="text-[10px] text-gray-500 font-bold">${dateLabel} - ${b.time}</span></div>${stHtml}</div><div class="p-2"><div class="flex justify-center mb-3 bg-${colorClass}-50 p-2 rounded-lg border border-${colorClass}-100">${animalsWithEmojis}</div><div class="bg-gray-50 p-2 rounded border border-dashed border-gray-300"><p class="text-[9px] text-gray-500 text-center mb-1 font-bold tracking-widest uppercase">Resultados Sorteo</p><div class="flex justify-center gap-2 overflow-x-auto pb-1 min-h-[35px]">${hitData.resultsHtml}</div></div><div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100"><span class="text-xs font-bold text-gray-400">Jugado: <span class="text-gray-700">${b.amount} Bs</span></span><span class="text-xs font-bold ${hitData.hitCount >= target ? 'text-green-600' : 'text-gray-500'}">Aciertos: ${hitData.hitCount}/${target}</span></div></div>`;
    container.appendChild(tDiv);
}

function calculateHitsHistory(ticketType, timeStr, userAnimals) {
    if (!historyResults) return { hitCount: 0, hits: [], resultsHtml: '<span class="text-[10px] text-gray-400">Esperando resultados...</span>' };
    let cleanTime = timeStr.replace(/^0+/, '').replace(/:/g, '-').replace(/\./g, '').trim(); 
    const userSet = new Set(userAnimals.map(String)); let hitCount = 0; let hits = []; let ticketResults = [];
    let lotteriesToCheck = []; if (ticketType === 'tripletas') lotteriesToCheck = ['Lotto Activo', 'La Granjita', 'Selva Plus', 'Ruleta Activa', 'Mega Animal 40']; else if (ticketType === 'dupletas') lotteriesToCheck = ['Lotto Activo', 'La Granjita', 'Selva Plus'];
    lotteriesToCheck.forEach(lotto => {
        let winningAnimal = null; if (historyResults[lotto]) { const possibleKeys = [cleanTime, `0${cleanTime}`]; for (let key of possibleKeys) { if (historyResults[lotto][key]) { winningAnimal = String(historyResults[lotto][key]); break; } } }
        let logo = LOTTO_IMGS[lotto]; if(logo && !logo.startsWith('http')) logo = 'https://bingotexier.com/archivos/imagenes/' + logo;
        if (winningAnimal) {
            const isHit = userSet.has(winningAnimal); if (isHit) { hitCount++; hits.push(winningAnimal); } const animalInfo = ANIMAL_MAP_LOTTO[winningAnimal] || {i:'?', n:''};
            ticketResults.push(`<div class="flex flex-col items-center min-w-[30px] mx-1"><img src="${logo}" class="w-5 h-5 rounded-full border border-gray-300 bg-white mb-1 shadow-sm"><span class="text-[9px] font-bold ${isHit ? 'text-green-600 bg-green-50 px-1 rounded':'text-gray-400'}">${animalInfo.i} ${winningAnimal}</span></div>`);
        } else { ticketResults.push(`<div class="flex flex-col items-center opacity-30 min-w-[30px] mx-1"><img src="${logo}" class="w-5 h-5 rounded-full grayscale border border-gray-200 mb-1"><span class="text-[8px]">-</span></div>`); }
    });
    const uniqueHits = [...new Set(hits)]; return { hitCount: uniqueHits.length, hits: uniqueHits, resultsHtml: ticketResults.join('') };
}

window.loadMyDailyBets = () => {
    if(!auth.currentUser) return;
    const uid = auth.currentUser.uid; const listAnimalitos = document.getElementById('my-bets-list');
    if(activeAnimalitosRef) activeAnimalitosRef.off();
    const animRef = db.ref(`bets_animalitos/${currentDateStr}/${uid}`); activeAnimalitosRef = animRef;
    animRef.on('value', s => {
        listAnimalitos.innerHTML=''; if(!s.exists()){ listAnimalitos.innerHTML = '<div class="text-center text-gray-400 p-2 text-xs">Sin tickets de animalitos hoy.</div>'; return; }
        const tickets = {}; s.forEach(c => { const b = c.val(); const tid = b.timestamp || c.key; if(!tickets[tid]) tickets[tid] = []; tickets[tid].push(b); });
        Object.values(tickets).reverse().forEach(group => {
            const first = group[0]; const totalTicket = group.reduce((sum, b) => sum + parseFloat(b.amount), 0); const winningNum = getIndividualResult(first.lottery, first.time);
            let resultDisplay = "", statusColor = "text-gray-500", statusText = "PENDIENTE";
            if (first.status === 'WIN') { statusColor = "text-green-600"; statusText = "GANÓ"; } else if (first.status === 'LOST') { statusColor = "text-red-500"; statusText = "PERDIÓ"; }
            if (winningNum) { let logo = LOTTO_IMGS[first.lottery]; if(logo && !logo.startsWith('http')) logo = 'https://bingotexier.com/archivos/imagenes/' + logo; const info = ANIMAL_MAP_LOTTO[winningNum] || {i:'?',n:''}; resultDisplay = `<div class="flex items-center justify-end mt-1 pt-1 border-t border-gray-100 bg-yellow-50 px-2 rounded"><span class="text-[9px] text-gray-500 mr-1">Resultado:</span><img src="${logo}" class="w-4 h-4 rounded-full mr-1"><span class="text-xs font-bold text-blue-600">${info.i} ${winningNum}</span></div>`; }
            const animalsHtml = group.map(g => { const info = ANIMAL_MAP_LOTTO[String(g.animal)] || {n:'?', i:''}; const isWinner = winningNum && String(winningNum) === String(g.animal); const bgClass = isWinner ? "bg-green-500 text-white border-green-600 shadow-md transform scale-105" : "bg-gray-100 text-gray-700 border-gray-200"; return `<span class="inline-block ${bgClass} px-2 py-1 rounded border mr-1 mb-1 font-bold text-xs transition-all">${info.i} ${g.animal}</span>`; }).join('');
            const tDiv = document.createElement('div'); tDiv.className = "bg-white border rounded mb-2 overflow-hidden shadow-sm";
            tDiv.innerHTML = `<div class="bg-gray-100 p-2 flex justify-between items-center text-xs font-bold"><span class="text-gray-700"><i class="far fa-clock mr-1"></i>${first.lottery} - ${first.time}</span><span class="${statusColor}">${statusText}</span></div><div class="p-2 text-xs"><div class="mb-2 flex flex-wrap">${animalsHtml}</div><div class="flex justify-between items-center mt-1"><span class="text-gray-400 italic">${group.length} Animal(es)</span><span class="font-bold text-gray-800">Total: Bs ${totalTicket.toFixed(2)}</span></div>${resultDisplay}</div>`; listAnimalitos.appendChild(tDiv);
        });
    });
}
