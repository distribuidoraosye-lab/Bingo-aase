/* ============================================================
   BINGO TEXIER - CÓDIGO PRINCIPAL (francisca.js)
   Versión: Final - Promo Blindada + Torneo Express Independiente + Video Custom
   ============================================================ */

/* --- 1. CONSTANTES Y MAPAS DE DATOS --- */
const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};

const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"},'26':{n:"Vaca",i:"\u{1F404}"},'27':{n:"Perro",i:"\u{1F415}"},'28':{n:"Zamuro",i:"\u{1F985}"},'29':{n:"Elefante",i:"\u{1F418}"},'30':{n:"Caimán",i:"\u{1F40A}"},'31':{n:"Lapa",i:"\u{1F9AB}"},'32':{n:"Ardilla",i:"\u{1F43F}"},'33':{n:"Pescado",i:"\u{1F41F}"},'34':{n:"Venado",i:"\u{1F98C}"},'35':{n:"Jirafa",i:"\u{1F992}"},'36':{n:"Culebra",i:"\u{1F40D}"},'37':{n:"Tortuga",i:"\u{1F422}"},'38':{n:"Búfalo",i:"\u{1F403}"},'39':{n:"Lechuza",i:"\u{1F989}"},'40':{n:"Avispa",i:"\u{1F41D}"},'41':{n:"Canguro",i:"\u{1F998}"},'42':{n:"Tucán",i:"\u{1F99C}"},'43':{n:"Mariposa",i:"\u{1F98B}"},'44':{n:"Chigüire",i:"\u{1F9AB}"},'45':{n:"Garza",i:"\u{1F9A9}"},'46':{n:"Puma",i:"\u{1F408}"},'47':{n:"Pavo Real",i:"\u{1F99A}"},'48':{n:"Puercoespín",i:"\u{1F994}"},'49':{n:"Pereza",i:"\u{1F9A5}"},'50':{n:"Canario",i:"\u{1F424}"},'51':{n:"Pelícano",i:"\u{1F9A4}"},'52':{n:"Pulpo",i:"\u{1F419}"},'53':{n:"Caracol",i:"\u{1F40C}"},'54':{n:"Grillo",i:"\u{1F997}"},'55':{n:"Oso Hormig.",i:"\u{1F9A1}"},'56':{n:"Tiburón",i:"\u{1F988}"},'57':{n:"Pato",i:"\u{1F986}"},'58':{n:"Hormiga",i:"\u{1F41C}"},'59':{n:"Pantera",i:"\u{1F408}\u{200D}\u{2B1B}"},'60':{n:"Camaleón",i:"\u{1F98E}"},'61':{n:"Panda",i:"\u{1F43C}"},'62':{n:"Cachicamo",i:"\u{1F993}"},'63':{n:"Cangrejo",i:"\u{1F980}"},'64':{n:"Gavilán",i:"\u{1F985}"},'65':{n:"Araña",i:"\u{1F577}"},'66':{n:"Lobo",i:"\u{1F43A}"},'67':{n:"Avestruz",i:"\u{1F426}"},'68':{n:"Jaguar",i:"\u{1F406}"},'69':{n:"Conejo",i:"\u{1F407}"},'70':{n:"Bisonte",i:"\u{1F9AC}"},'71':{n:"Guacamaya",i:"\u{1F99C}"},'72':{n:"Gorila",i:"\u{1F98D}"},'73':{n:"Hipopótamo",i:"\u{1F99B}"},'74':{n:"Turpial",i:"\u{1F426}"},'75':{n:"Guácharo",i:"\u{1F987}"}};

const LOTTO_IMGS = {
    'Lotto Activo': 'https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png',
    'La Granjita': 'https://bingotexier.com/archivos/imagenes/21e0b011b246a96b2561eeea537bcc519ab647a9.jpeg',
    'Ruleta Activa': 'https://i.imgur.com/UmUCfrE.png',
    'Mega Animal 40': 'https://i.imgur.com/A4Nkefb.png',
    'Selva Plus': 'https://i.imgur.com/MbtPoOD.png',
    'El Guacharo': 'https://bingotexier.com/archivos/imagenes/47daee24c785a3386efd5ffba129ec82ef65e09f.png',
    'Lotto Rey': 'https://bingotexier.com/archivos/imagenes/d1760139a96b1c4a49272b76c8473687e13b7c2c.jpeg'
};

const VENEZUELA_BANKS = [
    "Banco de Venezuela", "Banesco", "Mercantil", "Provincial", "Bancamiga", 
    "Banco Nacional de Crédito (BNC)", "Banco del Tesoro", "Banco Exterior", 
    "Bancaribe", "Banco Plaza", "Banplus", "Banco Caroní", "100% Banco", 
    "Sofitasa", "Del Sur", "Banco Activo", "Banco Digital de los trabajadores"
];

let SYSTEM_CONFIG = {
    payment_methods: {
        pago_movil: { bank: "Cargando...", id: "...", phone: "..." }
    }
};

const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };
firebase.initializeApp(firebaseConfig); const auth = firebase.auth(); const db = firebase.database();

/* --- VARIABLES GLOBALES --- */
let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null, globalLimit=0, totalSold=0;
let purchaseState = {totalQty:0, currentCardIndex:0, draftCards:[]}, currentSelection=new Set();
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "", torneoDateStr = "", miniGameStatus = 'closed', currentLimits = { general: 700, guacharo: 350 };
let isProcessing = false;
let freeBingoCredits = 0; 

let tripletaConfig = { cost: 0 };
let dupletaConfig = { cost: 0 };
let isTripletaMode = false;
let isDupletaMode = false;
let dailyResults = {};
let activeAnimalitosRef = null;
let historyRefs = { trip: null, dup: null, results: null };
let activeWithdrawalInterval = null;

// Variables Torneo Express
let torneoConfig = { price: 1000, basePrize: 10000, percentage: 100, status: 'closed' };
let torneoSelection = new Set();
let torneoSoldTickets = 0;
let lastKnownButtonState = "";
const TORNEO_LOTTOS = ['Lotto Activo', 'La Granjita', 'Ruleta Activa', 'Mega Animal 40', 'Selva Plus'];
const TORNEO_HOURS = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
let currentTorneoWinningNumbers = new Set();

/* --- 2. INICIALIZACIÓN Y EVENTOS DOM --- */
document.addEventListener('DOMContentLoaded', () => {
    populateBankSelect();
    
    db.ref('config/payment_methods').on('value', s => {
        if(s.exists()) { 
            SYSTEM_CONFIG.payment_methods = s.val(); 
            const bankEl = document.getElementById('pm-bank');
            if(bankEl) renderPaymentInfo(); 
        }
    });
    
    auth.onAuthStateChanged(u=>{ 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { 
            document.getElementById('logged-in-area').classList.remove('hidden'); 
            document.getElementById('logged-in-area').style.display='block'; 
            document.getElementById('nav-logout-btn').classList.remove('hidden'); 
            init(); 
        } else { 
            document.getElementById('logged-in-area').classList.add('hidden'); 
            document.getElementById('logged-in-area').style.display='none'; 
            document.getElementById('nav-logout-btn').classList.add('hidden'); 
        }
    });
    
    document.getElementById('auth-form').onsubmit=async(e)=>{e.preventDefault(); const p=document.getElementById('auth-phone').value.replace(/\D/g,''), pw=document.getElementById('auth-password').value, n=document.getElementById('auth-name').value; const email = p+"@bingotexier.com"; try { if(!document.getElementById('auth-name').classList.contains('hidden')){const u=await auth.createUserWithEmailAndPassword(email,pw); await u.user.updateProfile({displayName:n}); await db.ref(`users/${u.user.uid}`).set({name:n, phone:p, balance:0});} else await auth.signInWithEmailAndPassword(email,pw); } catch(e){ document.getElementById('auth-error').textContent=e.message; document.getElementById('auth-error').classList.remove('hidden'); }};
    document.getElementById('toggle-auth-mode').onclick=()=>{const n=document.getElementById('auth-name'); n.classList.toggle('hidden'); document.getElementById('auth-title').textContent=n.classList.contains('hidden')?'Iniciar Sesión':'Registro'; document.getElementById('auth-submit-btn').textContent=n.classList.contains('hidden')?'Acceder':'Registrarme';};
    
    document.getElementById('recharge-btn').onclick=()=>{
        renderPaymentInfo(); 
        document.getElementById('pay-date').valueAsDate = new Date(); 
        document.getElementById('deposit-modal').style.display='flex';
    };

    document.getElementById('withdraw-btn').onclick=()=>{
        document.getElementById('withdraw-form-area').style.display='flex';
        renderFullTransactionHistory(); 
    };
    
    document.getElementById('withdraw-form').onsubmit=async(e)=>{
        e.preventDefault(); 
        const a=parseFloat(document.getElementById('withdraw-amount').value); 
        if(a>userBalance) return alert("Saldo insuficiente"); 
        const bancoSelect = document.getElementById('w-banco');
        const selectedBank = bancoSelect.value;
        if(!selectedBank) return alert("Por favor seleccione un banco.");

        const now = new Date(Date.now() + serverTimeOffset);
        let estimatedTime = new Date(now);
        const currentHour = now.getHours();
        
        if (currentHour >= 10 && currentHour < 23) {
            estimatedTime.setHours(now.getHours() + 1);
        } else if (currentHour < 10) {
            estimatedTime.setHours(10, 0, 0, 0);
        } else {
            estimatedTime.setDate(estimatedTime.getDate() + 1);
            estimatedTime.setHours(10, 0, 0, 0);
        }

        const d = {
            amount:a, 
            tlf:document.getElementById('w-tlf').value, 
            cedula:document.getElementById('w-cedula').value, 
            banco: selectedBank, 
            uid:auth.currentUser.uid, 
            name:auth.currentUser.displayName, 
            userPhone:auth.currentUser.email.split('@'), 
            status:'PENDING', 
            request_timestamp: firebase.database.ServerValue.TIMESTAMP,
            estimated_process_timestamp: estimatedTime.getTime()
        }; 
        
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-a); 
        await db.ref(`users/${auth.currentUser.uid}/balance_pending_withdrawal`).transaction(c=>(c||0)+a); 
        await db.ref('withdrawal_requests').push(d); 
        
        alert("Solicitud enviada. Revisa el estado en tu pantalla."); 
        document.getElementById('withdraw-form-area').style.display='none';
    };
    
    initTicker(); 
    db.ref('config/tripleta').on('value', s => { if(s.exists()) tripletaConfig = s.val(); });
    db.ref('config/dupleta').on('value', s => { if(s.exists()) dupletaConfig = s.val(); });
});

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    
    monitorWithdrawals();
    renderFullTransactionHistory();

    db.ref('config/payment_methods').on('value', s => {
        if(s.exists()) { SYSTEM_CONFIG.payment_methods = s.val(); }
    });

    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{userBalance=s.val()||0; document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;});
    
    db.ref(`users/${auth.currentUser.uid}/free_bingo_credits`).on('value', s => {
        freeBingoCredits = s.val() || 0;
        const badge = document.getElementById('free-ticket-badge');
        if(badge) {
            if(freeBingoCredits > 0) { badge.classList.remove('hidden'); badge.textContent = `\u00A1TIENES ${freeBingoCredits} GRATIS!`; } 
            else { badge.classList.add('hidden'); }
        }
    });

    db.ref('config/limits').on('value', s => { if(s.exists()) currentLimits = s.val(); });

    db.ref('config/torneo_express').on('value', s => {
        if(s.exists()) {
            torneoConfig = s.val();
            if (typeof torneoConfig.percentage === 'undefined') torneoConfig.percentage = 100;

            const priceDisplay = document.getElementById('torneo-ticket-price-display');
            if(priceDisplay) priceDisplay.textContent = torneoConfig.price;
            
            updateTorneoButtonState();
            renderTorneoPotDisplay();
        }
    });

    syncTime(); startCountdown();
    
    setInterval(() => {
        const now = new Date(Date.now() + serverTimeOffset);
        let target = new Date(now);
        target.setHours(12, 50, 0, 0); 
        
        const display = document.getElementById('torneo-countdown');

        if(now > target && now.getHours() < 18) {
            if(display && display.textContent !== "\u00A1EN JUEGO!") display.textContent = "\u00A1EN JUEGO!";
        } else {
            if(now.getHours() >= 18) target.setDate(target.getDate() + 1);
            const diff = target - now;
            if(diff > 0 && display) {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                const timeText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                if(display.textContent !== timeText) display.textContent = timeText;
            }
        }
        updateTorneoButtonState(); 
    }, 1000);

    db.ref('draw_status').on('value', s=>{ 
        const d = s.val() || {}; 
        currentDate = d.date; 
        miniGameStatus = d.status; 
        if(d.status==='active') { 
            db.ref(`draw_details/${d.date}`).once('value', v=>{ 
                const val=v.val()||{}; 
                currentCardPrice=val.price||0; 
                globalLimit=val.limit||0; 
                if(document.getElementById('starter-card-price')) document.getElementById('starter-card-price').textContent=currentCardPrice.toFixed(2); 
                updateUrgency(); 
            }); 
        } 
    });
    db.ref('bingo_aprobados_estelar').on('value',s=>{ let c=0; s.forEach(x=>{if(x.val().date===currentDate)c++}); totalSold=c; updateUrgency(); });
}

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
    if(SYSTEM_CONFIG && SYSTEM_CONFIG.payment_methods && SYSTEM_CONFIG.payment_methods.pago_movil) {
        const data = SYSTEM_CONFIG.payment_methods.pago_movil;
        const bankEl = document.getElementById('pm-bank');
        if(bankEl) bankEl.textContent = data.bank || '...';
        const idEl = document.getElementById('pm-id');
        if(idEl) idEl.textContent = data.id || '...';
        const phoneEl = document.getElementById('pm-phone');
        if(phoneEl) phoneEl.textContent = data.phone || '...';
    }
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

/* --- 3. LÓGICA DE VERIFICACIÓN --- */
window.verifyPayment = async () => {
    if(!auth.currentUser) return;
    const btn = document.getElementById('btn-verify'); 
    const fb = document.getElementById('verify-feedback');
    const btnSupport = document.getElementById('btn-support-manual');
    const refInput = document.getElementById('pay-ref').value.trim();

    const showError = (titulo, detalle) => { 
        btn.disabled = false; 
        btn.className = "w-full bg-red-600 text-white font-bold py-3 rounded-lg";
        btn.innerHTML = 'REINTENTAR'; 
        fb.innerHTML = `\u26A0\uFE0F <b>${titulo}:</b> ${detalle}`;
        if(btnSupport) {
            btnSupport.classList.remove('hidden');
            const mensajeWsp = `Soporte: Mi pago dio error.%0ARef: ${refInput}%0AMonto: ${document.getElementById('pay-amount').value}%0AError: ${detalle}`;
            btnSupport.href = `https://wa.me/584220153364?text=${mensajeWsp}`;
        }
    };

    try {
        const uid = auth.currentUser.uid;
        const userRef = db.ref(`users/${uid}`);
        const uData = (await userRef.once('value')).val() || {};
        const now = Date.now();

        if (uData.bloqueo_hasta && now < uData.bloqueo_hasta) {
            const resto = Math.ceil((uData.bloqueo_hasta - now) / 60000);
            return alert(`\u26A0\uFE0F ESPERA: Sistema bloqueado. Intenta en ${resto} minutos.`);
        }

        let rawAmt = document.getElementById('pay-amount').value.trim().replace(/\./g, '').replace(',', '.');
        const amtInp = parseFloat(rawAmt);

        if(refInput.length < 4 || isNaN(amtInp) || amtInp <= 0) return alert("Por favor revisa la referencia y el monto.");

        if(btnSupport) btnSupport.classList.add('hidden');
        btn.disabled = true; 
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> VERIFICANDO...';
        fb.classList.remove('hidden'); 
        fb.innerHTML = "Buscando en el banco...";

        const used = await db.ref(`referencias_usadas/${refInput}`).once('value');
        if (used.exists()) { showError("DENEGADO", "Esta referencia ya fue utilizada."); return; }

        const formatVE = (num) => { let parts = num.toFixed(2).split('.'); parts = parts.replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.join(','); }
        const exacto = formatVE(amtInp);
        const simple = amtInp.toFixed(2).replace('.', ',');
        const crudo = amtInp.toFixed(2);

        const containsExactAmount = (fullText, amountStr) => {
            const txt = fullText.toLowerCase(); const search = amountStr.toLowerCase(); const idx = txt.indexOf(search);
            if (idx === -1) return false;
            const prevChar = idx > 0 ? txt[idx - 1] : ' '; const nextChar = idx + search.length < txt.length ? txt[idx + search.length] : ' '; const isDigit = (c) => c >= '0' && c <= '9';
            if (isDigit(prevChar) || prevChar === ',') return false;
            if (prevChar === '.') { const prevPrevChar = idx > 1 ? txt[idx - 2] : ' '; if (isDigit(prevPrevChar)) return false; }
            if (isDigit(nextChar)) return false;
            return true;
        };

        const logSnap = await db.ref('pagos_entrantes').once('value');
        let found = null;
        if (logSnap.exists()) {
            logSnap.forEach(child => {
                const data = child.val(); if (!data || !data.mensaje_banco) return;
                const msgBanco = data.mensaje_banco;
                if (!msgBanco.toLowerCase().includes(refInput)) return;
                const matchMonto = containsExactAmount(msgBanco, exacto) || containsExactAmount(msgBanco, simple) || containsExactAmount(msgBanco, crudo);
                if (matchMonto) { found = { k: child.key, s: (data.status === 'claimed' ? 'fraud' : 'valid') }; }
            });
        }

        if (found && found.s === 'valid') {
            const updates = {};
            updates[`pagos_entrantes/${found.k}/status`] = 'claimed';
            updates[`pagos_entrantes/${found.k}/claimed_by`] = uid;
            updates[`pagos_entrantes/${found.k}/claimed_date`] = firebase.database.ServerValue.TIMESTAMP;
            updates[`referencias_usadas/${refInput}`] = { uid, amt: amtInp, date: now };
            updates[`users/${uid}/intentos_fallidos`] = 0;
            
            let msgPromo = "";
            if (currentCardPrice > 0) {
                if (amtInp >= (currentCardPrice * 3)) {
                    const currentFree = uData.free_bingo_credits || 0;
                    updates[`users/${uid}/free_bingo_credits`] = currentFree + 1;
                    msgPromo = "<br>\u{1F381} <b>\u00A1GANASTE 1 CART\u00D3N GRATIS!</b>";
                }
            }

            await db.ref().update(updates);
            await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) + amtInp);
            
            btn.className = "w-full bg-green-600 text-white font-bold py-3 rounded-lg";
            btn.innerHTML = '\u00A1APROBADO! \u{1F389}';
            fb.innerHTML = `\u2705 Recarga de Bs ${exacto} exitosa.${msgPromo}`;
            setTimeout(() => location.reload(), 3000); 

        } else if (found && found.s === 'fraud') {
            showError("ERROR", "Pago ya reclamado por otro usuario.");
        } else {
            const f = (uData.intentos_fallidos || 0) + 1;
            if (f >= 5) {
                const bloqueo = now + (3 * 60 * 60 * 1000);
                await userRef.update({ intentos_fallidos: 0, bloqueo_hasta: bloqueo });
                alert("\u26D4 Demasiados intentos fallidos. Bloqueo temporal de 3 horas.");
                location.reload();
            } else {
                await userRef.update({ intentos_fallidos: f });
                showError("NO ENCONTRADO", `No vemos el pago de <b>Bs ${exacto}</b> (Ref: ${refInput}). Intento ${f}/5.`);
            }
        }

    } catch (e) { console.error("Error crítico:", e); showError("ERROR DEL SISTEMA", e.message || "Fallo desconocido"); }
};

/* --- 4. FUNCIONES GLOBALES Y TORNEO EXPRESS --- */
function initTicker(){const t=document.getElementById('ticker-content'); if(t){const names=["Carlos R.","Maria G.","Jose L.","Ana P.","Luis M.","Elena S."]; const actions=[{label:"Ganó",min:400,max:2500,icon:"fas fa-ticket-alt"},{label:"Tripleta",min:100000,max:100000,icon:"fas fa-layer-group"}]; let h=""; for(let i=0;i<30;i++){const n=names[Math.floor(Math.random()*names.length)]; const act=actions[Math.floor(Math.random()*actions.length)]; const a=Math.floor(Math.random()*(act.max-act.min+1))+act.min; h+=`<div class="ticker__item"><i class="${act.icon}"></i> ${n} <span class="ticker__action">${act.label}</span>: <span class="ticker__amount">${a.toLocaleString('es-VE')} Bs</span></div>`;} t.innerHTML=h;}}
function startCountdown(){setInterval(()=>{const now=new Date(); let t=new Date(); t.setHours(20,0,0,0); if(now>t) t.setDate(t.getDate()+1); const d=t-now, h=Math.floor(d/3600000), m=Math.floor((d%3600000)/60000), s=Math.floor((d%60000)/1000); document.getElementById('countdown-timer').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;},1000);}

function syncTime(){
    updateGameDate();
    fetch('https://worldtimeapi.org/api/timezone/America/Caracas')
        .then(r => r.json())
        .then(d => {
            serverTimeOffset = new Date(d.datetime).getTime() - Date.now();
            updateGameDate();
        }).catch(e => {});
}

function updateGameDate(){
    const now=new Date(Date.now()+serverTimeOffset); 
    
    // --- LÓGICA GENERAL (BINGO Y CLÁSICOS) Salto a las 8 PM ---
    let generalDate = new Date(now);
    if(generalDate.getHours() >= 20) generalDate.setDate(generalDate.getDate()+1); 
    currentDateStr=`${String(generalDate.getDate()).padStart(2,'0')}-${String(generalDate.getMonth()+1).padStart(2,'0')}-${generalDate.getFullYear()}`; 
    
    // --- LÓGICA TORNEO EXPRESS: Salto a las 6 PM ---
    let torneoDate = new Date(now);
    if(torneoDate.getHours() >= 18) torneoDate.setDate(torneoDate.getDate()+1);
    torneoDateStr=`${String(torneoDate.getDate()).padStart(2,'0')}-${String(torneoDate.getMonth()+1).padStart(2,'0')}-${torneoDate.getFullYear()}`;

    // Actualizar interfaz visual
    document.getElementById('game-date-display').textContent=current
