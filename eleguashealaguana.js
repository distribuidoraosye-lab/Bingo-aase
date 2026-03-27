/* ============================================================
   BINGO TEXIER - CÓDIGO PRINCIPAL (francisca.js)
   Versión: Final - Promo Blindada + Torneo Express Independiente + Video Custom + Pausa
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

    // --- NUEVA LÓGICA DE ESCUCHA DE BINGO (CON PAUSA VISUAL) ---
    db.ref('draw_status').on('value', s=>{ 
        const d = s.val() || {}; 
        currentDate = d.date; 
        miniGameStatus = d.minigame_status || d.status; 
        if(d.status==='active') { 
            db.ref(`draw_details/${d.date}`).once('value', v=>{ 
                const val=v.val()||{}; 
                currentCardPrice=val.price||0; 
                globalLimit=val.limit||0; 
                if(document.getElementById('starter-card-price')) document.getElementById('starter-card-price').textContent=currentCardPrice.toFixed(2); 
                updateUrgency(); 
            }); 
        } 
        
        const btnCompraBingo = document.getElementById('start-purchase-btn');
        if(btnCompraBingo) {
            if(d.minigame_status === 'paused') {
                if(!btnCompraBingo.dataset.originalHtml) btnCompraBingo.dataset.originalHtml = btnCompraBingo.innerHTML;
                if(!btnCompraBingo.dataset.originalCss) btnCompraBingo.dataset.originalCss = btnCompraBingo.className;
                
                btnCompraBingo.innerHTML = '<i class="fas fa-pause-circle"></i> VENTA PAUSADA';
                btnCompraBingo.className = 'w-full py-3 rounded-lg font-bold text-white shadow-md transition-all bg-gray-500 cursor-not-allowed opacity-80';
            } else {
                if(btnCompraBingo.dataset.originalHtml) {
                    btnCompraBingo.innerHTML = btnCompraBingo.dataset.originalHtml;
                    btnCompraBingo.className = btnCompraBingo.dataset.originalCss;
                }
            }
        }
    });
    // -----------------------------------------------------------

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

        // ESTE ES EL ÚNICO CAMBIO: Se arregló el formatVE original para que Javascript no dé error de "replace"
        const formatVE = (num) => { let p = num.toFixed(2).split('.'); p = p.replace(/\B(?=(\d{3})+(?!\d))/g, "."); return p.join(','); }
        
        const exacto = formatVE(amtInp);
        const simple = amtInp.toFixed(2).replace('.', ',');
        const crudo = amtInp.toFixed(2);

        // TU FUNCIÓN ORIGINAL EXACTA
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
    document.getElementById('game-date-display').textContent=currentDateStr; 
    
    // Inyectar fechas en el Torneo Express
    if(document.getElementById('ui-date-buy')) document.getElementById('ui-date-buy').textContent = torneoDateStr;
    if(document.getElementById('ui-date-results')) document.getElementById('ui-date-results').textContent = currentDateStr;
    if(document.getElementById('ui-date-ranking')) document.getElementById('ui-date-ranking').textContent = currentDateStr;
    if(document.getElementById('ui-date-cards')) document.getElementById('ui-date-cards').textContent = currentDateStr;

    // Mostrar aviso si estamos vendiendo para mañana
    const noticeEl = document.getElementById('torneo-next-day-notice');
    if(noticeEl) {
        if(now.getHours() >= 18) { noticeEl.classList.remove('hidden'); } 
        else { noticeEl.classList.add('hidden'); }
    }

    db.ref(`results_log/${currentDateStr}`).on('value',s=>{
        dailyResults=s.val()||{}; 
        loadMyDailyBets();
    }); 
    loadMyDailyBets();
    
    listenTorneoPot();
    renderTorneoTimeline();
    loadMyTorneoCards();
    loadTorneoRanking();
}

function switchMode(t){
    ['section-bingo','section-animalitos'].forEach(x=>{ document.getElementById(x).classList.add('hidden'); document.getElementById(x).style.display='none'; }); 
    document.getElementById(`section-${t}`).classList.remove('hidden'); document.getElementById(`section-${t}`).style.display='block'; 
    document.getElementById('game-selector').classList.add('hidden');
    const btn = document.getElementById('main-live-btn'); if(btn) { if(t === 'animalitos') btn.style.display = 'none'; else btn.style.display = 'block'; }
}

function updateUrgency(){const b=document.getElementById('urgency-bar-fixed'); if(currentCardPrice>0){b.classList.remove('hidden'); let r=globalLimit-totalSold; document.getElementById('urgency-text').textContent=(r<50&&globalLimit>0)?`\u00A1SOLO ${r} DISPONIBLES!`:`${totalSold}/${globalLimit} VENDIDOS`;}else{b.classList.add('hidden');}}

// BINGO LOGIC
if(document.getElementById('start-purchase-btn')) document.getElementById('start-purchase-btn').onclick=()=>{
    if(miniGameStatus === 'paused') return alert("\u23F8\uFE0F La venta est\u00E1 pausada temporalmente."); 
    document.getElementById('chat-flow-area').classList.remove('hidden'); 
    document.getElementById('bot-message-display').innerHTML="\u00BFCu\u00E1ntos cartones?"; 
    document.getElementById('quantity-selector-area').classList.remove('hidden'); 
    const q=document.getElementById('quantity-grid'); 
    q.innerHTML=''; 
    for(let i=1;i<=15;i++){ 
        const b=document.createElement('div'); 
        b.className="qty-btn"; 
        b.textContent=i; 
        b.onclick=()=>startBingoSel(i); 
        q.appendChild(b); 
    }
}
function startBingoSel(n){ purchaseState={totalQty:n, currentCardIndex:0, draftCards:[]}; document.getElementById('quantity-selector-area').classList.add('hidden'); document.getElementById('animal-selector-area').classList.remove('hidden'); renderBingoSel(); }
function renderBingoSel(){ currentSelection.clear(); document.getElementById('current-card-num').textContent=purchaseState.currentCardIndex+1; document.getElementById('confirm-card-btn').disabled=true; document.getElementById('confirm-card-btn').classList.add('opacity-50', 'cursor-not-allowed'); document.getElementById('selection-counter').textContent="0/15"; const g=document.getElementById('animal-selection-grid'); g.innerHTML=''; for(let i=1; i<=25; i++) { const b=document.createElement('div'); b.className="select-animal-btn"; b.innerHTML = `<span class="emoji-font">${ANIMAL_MAP_BINGO[i].i}</span>${i}-${ANIMAL_MAP_BINGO[i].n}`; b.onclick=()=>{ if(currentSelection.has(i)) { currentSelection.delete(i); b.classList.remove('selected'); } else if(currentSelection.size<15) { currentSelection.add(i); b.classList.add('selected'); } const done = currentSelection.size === 15; document.getElementById('confirm-card-btn').disabled = !done; if(done) document.getElementById('confirm-card-btn').classList.remove('opacity-50', 'cursor-not-allowed'); else document.getElementById('confirm-card-btn').classList.add('opacity-50', 'cursor-not-allowed'); document.getElementById('selection-counter').textContent = currentSelection.size + "/15"; }; g.appendChild(b); } }
window.fillRandomAnimals=()=>{ currentSelection.clear(); Array.from({length:25},(_,i)=>i+1).sort(()=>Math.random()-0.5).slice(0,15).forEach(x=>currentSelection.add(x)); const ds=document.getElementById('animal-selection-grid').children; for(let i=0;i<25;i++) if(currentSelection.has(i+1)) ds[i].classList.add('selected'); else ds[i].classList.remove('selected'); document.getElementById('selection-counter').textContent="15/15"; document.getElementById('confirm-card-btn').disabled=false; document.getElementById('confirm-card-btn').classList.remove('opacity-50'); }

window.confirmCurrentCard=async()=>{ 
    if(miniGameStatus === 'paused') return alert("\u23F8\uFE0F La venta ha sido pausada. No se pudo procesar la compra."); 
    purchaseState.draftCards.push(Array.from(currentSelection).sort((a,b)=>a-b)); purchaseState.currentCardIndex++; 
    if(purchaseState.currentCardIndex<purchaseState.totalQty) { renderBingoSel(); } 
    else { 
        let paidCount = purchaseState.totalQty, usedFree = 0;
        if(freeBingoCredits > 0) { usedFree = Math.min(purchaseState.totalQty, freeBingoCredits); paidCount = purchaseState.totalQty - usedFree; }
        const cost = paidCount * currentCardPrice; 
        if(cost > userBalance) return alert("Saldo insuficiente"); 
        
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c || 0) - cost);
        if(usedFree > 0) { await db.ref(`users/${auth.currentUser.uid}/free_bingo_credits`).transaction(c => (c || 0) - usedFree); }
        
        const cards = purchaseState.draftCards.map(n => ({numbers:n, id:Math.random().toString(36).substring(7).toUpperCase()})); 
        await Promise.all(cards.map((c, index) => {
            const isFree = index < usedFree;
            return db.ref('bingo_aprobados_estelar').push({ numbers:c.numbers, id:c.id, uid:auth.currentUser.uid, date:currentDate, status:'APROBADO', payment_method: isFree ? 'GRATIS' : 'SALDO' });
        })); 
        
        document.getElementById('bot-message-display').innerHTML = `\u2705 Listo. ${purchaseState.totalQty} cartones.`; 
        document.getElementById('chat-flow-area').classList.add('hidden'); 
        
        const modalHtml = `
            <div id="purchase-success-modal" class="fixed inset-0 bg-black/80 z- flex items-center justify-center">
                <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-2xl border-t-4 border-green-500">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-3xl text-green-500"></i>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 mb-2">\u00A1COMPRA EXITOSA!</h3>
                    <p class="text-gray-600 font-bold mb-6">Tienes ${purchaseState.totalQty} cartones asegurados para el sorteo de hoy.</p>
                    <div class="flex flex-col gap-3">
                        <a href="https://bingotexier.com/web/pagina/112" class="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition flex justify-center items-center gap-2">
                            <i class="fas fa-ticket-alt"></i> IR A LA SALA DE SORTEOS
                        </a>
                        <button onclick="document.getElementById('purchase-success-modal').remove(); location.reload();" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition">
                            SEGUIR AQUI
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
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
            alert("\u2705 \u00A1Tripleta Jugada!");
        } else if (isDupletaMode) {
            if(selectedLottoAnimals.size !== 2) throw new Error("Debes seleccionar 2 animales.");
            const cost = dupletaConfig.cost; if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost);
            await db.ref(`bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`).push({ lottery: "Dupleta", time, animals: Array.from(selectedLottoAnimals), amount: cost, status: 'PENDING', limit_timestamp: limitTimestamp, timestamp: firebase.database.ServerValue.TIMESTAMP });
            alert("\u2705 \u00A1Dupleta Jugada!");
        } else {
            const amt = parseFloat(document.getElementById('lotto-amount').value); if(selectedLottoAnimals.size === 0 || !amt || amt<1) throw new Error("Faltan datos");
            
            const lottoLimit = (selectedLotto === 'El Guacharo') ? (currentLimits.guacharo || 350) : (currentLimits.general || 700);
            if(amt > lottoLimit) throw new Error(`El l\u00EDmite por jugada para ${selectedLotto} es Bs ${lottoLimit}.`);

            const cost = amt * selectedLottoAnimals.size; if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost); const u={}; const baseRef = `bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`;
            selectedLottoAnimals.forEach(animal => { const k = db.ref(baseRef).push().key; u[`${baseRef}/${k}`] = { lottery: selectedLotto, time, animal, amount: amt, status: 'PENDING', limit_timestamp: limitTimestamp, timestamp: firebase.database.ServerValue.TIMESTAMP }; });
            await db.ref().update(u); alert("\u2705 \u00A1Ticket Jugado!");
        }
        selectedLottoAnimals.clear(); updateModeUI();
    } catch(e) { alert(e.message); } finally { isProcessing = false; }
};

window.openTripletaModal = () => { document.getElementById('modal-tripletas').style.display = 'flex'; const todayISO = new Date(Date.now() + serverTimeOffset).toISOString().split('T'); const input = document.getElementById('history-date-trip'); if(input) input.value = todayISO; watchHistory('tripletas', todayISO); }
window.openDupletaModal = () => { document.getElementById('modal-dupletas').style.display = 'flex'; const todayISO = new Date(Date.now() + serverTimeOffset).toISOString().split('T'); const input = document.getElementById('history-date-dup'); if(input) input.value = todayISO; watchHistory('dupletas', todayISO); }

window.watchHistory = (type, dateInputVal) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const [year, month, day] = dateInputVal.split('-');
    const dbDateStr = `${day}-${month}-${year}`;
    const container = type === 'tripletas' ? document.getElementById('popup-tripletas-list') : document.getElementById('popup-dupletas-list');
    container.innerHTML = 'Buscando...';
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
            if (!s.exists()) { container.innerHTML = `Sin jugadas el ${dbDateStr}`; return; }
            s.forEach(c => { renderHistoryTicket(type, c.val(), container, dbDateStr); });
        });
    });
};

function calculateHitsHistory(ticketType, timeStr, userAnimals) {
    if (!historyResults) return { hitCount: 0, hits: [], resultsHtml: 'Pendiente...', winningAnimals: new Set(), hasResults: false };
    let cleanTime = timeStr.replace(/^0+/, '').replace(/:/g, '-').replace(/\./g, '').trim(); 
    const userSet = new Set(userAnimals.map(String)); let hitCount = 0; let ticketResults = [];
    let winningAnimals = new Set();
    let hasResults = false;
    let lotteriesToCheck = ticketType === 'tripletas' ? ['Lotto Activo', 'La Granjita', 'Selva Plus', 'Ruleta Activa', 'Mega Animal 40'] : ['Lotto Activo', 'La Granjita', 'Selva Plus'];
    lotteriesToCheck.forEach(lotto => {
        let win = null; if (historyResults[lotto]) { const keys = [cleanTime, `0${cleanTime}`]; for (let k of keys) { if (historyResults[lotto][k]) { win = String(historyResults[lotto][k]); break; } } }
        if (win) { 
            hasResults = true;
            if (userSet.has(win)) { hitCount++; winningAnimals.add(win); }
            const imgPath = LOTTO_IMGS[lotto] || '';
            const imgTag = imgPath ? `<img src="${imgPath}" class="w-4 h-4 inline-block rounded-full">` : '';
            const winInfo = ANIMAL_MAP_LOTTO[win] || {i:'\u2753', n:'?'};
            ticketResults.push(`<div class="flex items-center gap-1 text-xs">${imgTag} <b>${lotto}:</b> <span>${winInfo.i}</span> ${win}</div>`); 
        }
    });
    return { hitCount, resultsHtml: ticketResults.length > 0 ? `<div class="mt-2 space-y-1">${ticketResults.join('')}</div>` : 'Pendiente...', winningAnimals, hasResults };
}

function renderHistoryTicket(type, b, container, dateLabel) {
    let animalsSafe = b.animals || []; if (!Array.isArray(animalsSafe)) animalsSafe = Object.values(animalsSafe);
    const hitData = calculateHitsHistory(type, b.time, animalsSafe);
    const animalsWithEmojis = animalsSafe.map(num => {
        const info = ANIMAL_MAP_LOTTO[String(num)] || { i: '\u2753', n: '?' };
        let colorClass = "bg-white text-gray-800";
        if (hitData.hasResults) {
            colorClass = hitData.winningAnimals.has(String(num)) ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700";
        }
        return `<div class="mx-1 p-1 border rounded ${colorClass} flex flex-col items-center min-w-[40px]"><span>${info.i}</span><b>${num}</b></div>`;
    }).join('');
    const tDiv = document.createElement('div'); tDiv.className = "bg-gray-50 border rounded p-2 mb-2";
    tDiv.innerHTML = `<div class="flex justify-between items-center mb-1"><b>${type.toUpperCase()}</b> <span class="text-xs bg-gray-200 px-2 py-1 rounded">${b.time}</span></div><div class="flex justify-center my-2">${animalsWithEmojis}</div><div>${hitData.resultsHtml}</div><div class="text-right text-xs mt-2 border-t pt-1">Total: <b>${b.amount} Bs</b></div>`;
    container.appendChild(tDiv);
}

window.loadMyDailyBets = () => {
    if(!auth.currentUser) return;
    const uid = auth.currentUser.uid; const listAnimalitos = document.getElementById('my-bets-list');
    if(activeAnimalitosRef) activeAnimalitosRef.off();
    const animRef = db.ref(`bets_animalitos/${currentDateStr}/${uid}`); activeAnimalitosRef = animRef;
    animRef.on('value', s => {
        listAnimalitos.innerHTML=''; if(!s.exists()){ listAnimalitos.innerHTML = 'Sin tickets.'; return; }
        s.forEach(c => { 
            const b = c.val(); 
            const aInfo = ANIMAL_MAP_LOTTO[String(b.animal)] || {i: '\u2753', n: '?'};
            const imgPath = LOTTO_IMGS[b.lottery] || '';
            const imgTag = imgPath ? `<img src="${imgPath}" class="w-6 h-6 inline-block rounded-full border border-gray-300">` : '';
            
            const tDiv = document.createElement('div'); 
            tDiv.className = "bg-white border rounded mb-1 p-2 text-xs flex items-center gap-3"; 
            tDiv.innerHTML = `<span class="text-2xl">${aInfo.i}</span> <div class="flex-1"><div class="flex items-center gap-1 mb-1">${imgTag} <b>${b.lottery}</b> - ${b.time}</div> Animal: <b>${b.animal} (${aInfo.n})</b> | Bs ${b.amount} | <b class="${b.status === 'PENDING' ? 'text-yellow-600' : 'text-blue-600'}">${b.status}</b></div>`; 
            listAnimalitos.appendChild(tDiv); 
        });
    });
}

/* ============================================================
   NUEVAS FUNCIONES: GESTIÓN DE RETIROS, POPUPS FLOTANTES Y TOAST
   ============================================================ */

function monitorWithdrawals() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    
    db.ref('withdrawal_requests').orderByChild('uid').equalTo(uid).limitToLast(5).on('value', s => {
        if(!s.exists()) {
            removeFloatingBanner();
            return;
        }

        let pendingFound = false;

        s.forEach(snap => {
            const data = snap.val();
            const txId = snap.key;
            
            const storageKey = `notified_${txId}_${data.status}`;
            const alreadyNotified = localStorage.getItem(storageKey);

            if (data.status !== 'PENDING' && !alreadyNotified) {
                showFloatingToast(data.status, data.amount);
                localStorage.setItem(storageKey, 'true');
            }

            if (data.status === 'PENDING') {
                pendingFound = true;
                showFloatingCounter(data);
            }
        });

        if (!pendingFound) {
            removeFloatingBanner();
        }
    });
}

function showFloatingToast(status, amount) {
    const isApproved = status === 'APPROVED';
    const bgColor = isApproved ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
    const textColor = isApproved ? 'text-green-800' : 'text-red-800';
    const icon = isApproved ? 'fa-check-circle' : 'fa-times-circle';
    const title = isApproved ? '\u00A1Retiro Aprobado!' : 'Retiro Rechazado';
    const msg = isApproved ? `Tu pago de Bs ${amount} ha sido enviado.` : `Se han devuelto Bs ${amount} a tu saldo.`;

    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-4 z- w-80 p-4 rounded-lg shadow-2xl border-l-4 flex items-start gap-3 transform transition-all duration-500 translate-x-full ${bgColor}`;
    
    toast.innerHTML = `
        <div class="mt-1"><i class="fas ${icon} ${textColor} text-xl"></i></div>
        <div class="flex-1">
            <h4 class="font-bold ${textColor} text-sm">${title}</h4>
            <p class="text-xs text-gray-600 mt-1 leading-tight">${msg}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => { toast.classList.remove('translate-x-full'); });
    try { const audio = new Audio(isApproved ? 'https://bingotexier.com/archivos/sonidos/success.mp3' : 'https://bingotexier.com/archivos/sonidos/error.mp3'); audio.play().catch(e => {}); } catch(e){}
    setTimeout(() => { if(document.body.contains(toast)){ toast.classList.add('translate-x-full', 'opacity-0'); setTimeout(() => toast.remove(), 500); } }, 6000);
}

function showFloatingCounter(data) {
    let container = document.getElementById('withdrawal-ticker-sticky');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'withdrawal-ticker-sticky';
        container.className = "fixed bottom-0 left-0 w-full bg-blue-900 text-white p-3 z-50 shadow-lg border-t-2 border-yellow-400";
        document.body.appendChild(container);
    }
    
    if (activeWithdrawalInterval) clearInterval(activeWithdrawalInterval);
    
    activeWithdrawalInterval = setInterval(() => {
        const now = Date.now() + serverTimeOffset;
        const target = data.estimated_process_timestamp || now;
        const diff = target - now;

        if (diff > 0) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            
            container.innerHTML = `<div class="flex justify-between items-center max-w-md mx-auto"><div class="text-sm"><p class="font-bold text-yellow-300"><i class="fas fa-clock"></i> Retiro en proceso</p><p class="text-xs text-gray-300">Tiempo estimado:</p></div><div class="text-2xl font-mono font-bold">${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</div></div>`;
        } else {
            container.classList.remove('bg-blue-900'); container.classList.add('bg-red-900');
            const msgWsp = `Hola Soporte, mi retiro de Bs ${data.amount} est\u00E1 retrasado. ID Usuario: ${auth.currentUser.uid}`;
            container.innerHTML = `<div class="text-center max-w-md mx-auto"><p class="text-xs font-bold text-yellow-300 mb-1">\u26A0\uFE0F Alta demanda de pagos</p><p class="text-xs mb-2">Tu pago est\u00E1 garantizado y es el siguiente en cola.</p><a href="https://wa.me/584220153364?text=${encodeURIComponent(msgWsp)}" target="_blank" class="block w-full bg-green-500 text-white text-sm font-bold py-1 px-4 rounded-full shadow hover:bg-green-600 transition"><i class="fab fa-whatsapp"></i> Contactar Soporte Prioritario</a></div>`;
        }
    }, 1000);
}

function removeFloatingBanner() {
    const el = document.getElementById('withdrawal-ticker-sticky');
    if (el) el.remove();
    if (activeWithdrawalInterval) clearInterval(activeWithdrawalInterval);
}

async function renderFullTransactionHistory() {
    const container = document.getElementById('transaction-history-container');
    if (!container) return; 

    container.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Cargando movimientos...</div>';
    const uid = auth.currentUser.uid;
    
    const withdrawalsSnap = await db.ref('withdrawal_requests').orderByChild('uid').equalTo(uid).limitToLast(20).once('value');
    const depositsSnap = await db.ref('referencias_usadas').orderByChild('uid').equalTo(uid).limitToLast(20).once('value');

    let history = [];

    if(withdrawalsSnap.exists()) {
        withdrawalsSnap.forEach(s => {
            history.push({
                type: 'withdrawal',
                amount: s.val().amount,
                date: s.val().request_timestamp || s.val().timestamp || 0,
                status: s.val().status
            });
        });
    }

    if(depositsSnap.exists()) {
        depositsSnap.forEach(s => {
            history.push({
                type: 'deposit',
                amount: s.val().amt,
                date: s.val().date || 0,
                status: 'APPROVED'
            });
        });
    }

    history.sort((a,b) => (b.date || 0) - (a.date || 0));

    let html = '<div class="space-y-2 mt-2">';
    if (history.length === 0) {
        html += '<p class="text-center text-gray-500 text-sm">Sin movimientos recientes.</p>';
    } else {
        history.forEach(h => {
            let dateStr = "Fecha desconocida";
            if(h.date > 0) {
                const dateObj = new Date(h.date);
                dateStr = `${dateObj.getDate()}/${dateObj.getMonth()+1} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
            }

            let icon = ''; let colorClass = '';
            
            if (h.type === 'deposit') {
                icon = '<i class="fas fa-check-circle text-green-500 text-xl"></i>'; colorClass = 'border-l-4 border-green-500';
            } else {
                if (h.status === 'APPROVED') { icon = '<i class="fas fa-check-circle text-green-500 text-xl"></i>'; colorClass = 'border-l-4 border-green-500'; } 
                else if (h.status === 'REJECTED') { icon = '<i class="fas fa-times-circle text-red-500 text-xl"></i>'; colorClass = 'border-l-4 border-red-500'; } 
                else { icon = '<i class="fas fa-clock text-yellow-500 text-xl fa-spin"></i>'; colorClass = 'border-l-4 border-yellow-500'; }
            }

            html += `<div class="bg-white p-3 rounded shadow-sm flex justify-between items-center ${colorClass}"><div class="flex items-center space-x-3">${icon}<div><p class="font-bold text-gray-800">${h.type === 'deposit' ? 'Recarga' : 'Retiro'}</p><p class="text-xs text-gray-500">${dateStr}</p></div></div><div class="font-bold ${h.type === 'deposit' ? 'text-green-600' : 'text-red-600'}">${h.type === 'deposit' ? '+' : '-'} Bs ${h.amount.toLocaleString('es-VE')}</div></div>`;
        });
    }
    html += '</div>';
    container.innerHTML = html;
}

/* ============================================================
   FASE 4: MOTOR DEL TORNEO EXPRESS (1 PM - 6 PM)
   ============================================================ */

window.toggleClassicArea = () => {
    const area = document.getElementById('classic-animalitos-area');
    const icon = document.getElementById('classic-toggle-icon');
    if(area && icon) {
        area.classList.toggle('hidden');
        if (area.classList.contains('hidden')) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }
};

function renderTorneoPotDisplay() {
    const p = torneoConfig.price || 1000;
    const bp = torneoConfig.basePrize || 10000;
    const prc = (torneoConfig.percentage || 100) / 100;
    
    const totalCollected = (torneoSoldTickets * p) * prc;
    const potValue = totalCollected > bp ? totalCollected : bp;
    
    const potDisplay = document.getElementById('torneo-user-pot');
    if(potDisplay) potDisplay.textContent = potValue.toLocaleString('es-VE') + " Bs";
}

function listenTorneoPot() {
    if(!torneoDateStr) return;
    db.ref(`bets_torneo_express/${torneoDateStr}`).on('value', s => {
        torneoSoldTickets = 0;
        
        if(s.exists()) {
            s.forEach(userNode => { torneoSoldTickets += Object.keys(userNode.val()).length; });
        }
        
        renderTorneoPotDisplay();
    });
}

function updateTorneoButtonState() {
    const buyBtn = document.getElementById('btn-buy-torneo');
    if(!buyBtn) return;
    
    const now = new Date(Date.now() + serverTimeOffset);
    let target = new Date(now);
    target.setHours(12, 50, 0, 0);
    const isPastDeadline = (now > target && now.getHours() < 18);
    
    const effectiveStatus = isPastDeadline ? 'closed_time' : torneoConfig.status;
    const stateHash = effectiveStatus + "_" + torneoConfig.price;
    
    if (lastKnownButtonState === stateHash) return;
    lastKnownButtonState = stateHash;

    if(effectiveStatus === 'open') {
        buyBtn.disabled = false;
        buyBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
        buyBtn.classList.add('bg-yellow-400', 'hover:bg-yellow-500');
        buyBtn.innerHTML = `COMPRAR TICKET - <span id="torneo-ticket-price-display">${torneoConfig.price}</span> Bs`;
    } else {
        buyBtn.disabled = true;
        buyBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
        buyBtn.classList.remove('bg-yellow-400', 'hover:bg-yellow-500');
        buyBtn.textContent = isPastDeadline ? "CERRADO HASTA LAS 6PM" : "VENTA CERRADA";
    }
}

window.openTorneoSelection = () => {
    document.getElementById('torneo-selection-modal').style.display='flex';
    renderTorneoGrid();
};

function renderTorneoGrid() {
    torneoSelection.clear();
    updateTorneoBtn();
    const g = document.getElementById('torneo-animal-grid');
    g.innerHTML = '';
    
    const keys = ['0','00', ...Array.from({length:36},(_,i)=>(i+1).toString())];
    
    keys.forEach(k => {
        const a = ANIMAL_MAP_LOTTO[k] || {n:`Num ${k}`, i:"\u2753"};
        const d = document.createElement('div');
        d.className = 'select-animal-btn bg-white shadow-sm'; 
        d.innerHTML = `<span class="emoji-font-lg">${a.i}</span><span class="text-[10px] font-black">${k}</span><span class="text-[8px] truncate w-full text-center text-gray-500">${a.n}</span>`;
        
        d.onclick = () => {
            if(torneoSelection.has(k)) { 
                torneoSelection.delete(k); 
                d.classList.remove('selected', 'bg-orange-500', 'border-orange-600', 'text-white'); 
                d.classList.add('bg-white');
            } else if(torneoSelection.size < 15) { 
                torneoSelection.add(k); 
                d.classList.remove('bg-white');
                d.classList.add('selected', 'bg-orange-500', 'border-orange-600', 'text-white'); 
            }
            updateTorneoBtn();
        }; 
        g.appendChild(d);
    });
}

function updateTorneoBtn() {
    const counter = document.getElementById('torneo-selection-counter');
    const btn = document.getElementById('btn-confirm-torneo-card');
    if(counter) counter.textContent = `${torneoSelection.size} / 15`;
    
    if(btn) {
        if(torneoSelection.size === 15) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

window.fillRandomTorneo = () => {
    torneoSelection.clear();
    const keys = ['0','00', ...Array.from({length:36},(_,i)=>(i+1).toString())];
    keys.sort(() => Math.random() - 0.5).slice(0,15).forEach(k => torneoSelection.add(k));
    
    const ds = document.getElementById('torneo-animal-grid').children;
    Array.from(ds).forEach(d => {
        const k = d.querySelector('.font-black').textContent;
        if(torneoSelection.has(k)) {
            d.classList.remove('bg-white');
            d.classList.add('selected', 'bg-orange-500', 'border-orange-600', 'text-white');
        } else {
            d.classList.remove('selected', 'bg-orange-500', 'border-orange-600', 'text-white');
            d.classList.add('bg-white');
        }
    });
    updateTorneoBtn();
};

window.clearTorneoSelection = () => {
    torneoSelection.clear();
    const ds = document.getElementById('torneo-animal-grid').children;
    Array.from(ds).forEach(d => {
        d.classList.remove('selected', 'bg-orange-500', 'border-orange-600', 'text-white');
        d.classList.add('bg-white');
    });
    updateTorneoBtn();
};

window.confirmTorneoPurchase = async () => {
    if(torneoSelection.size !== 15) return;
    const cost = torneoConfig.price || 1000;
    if(userBalance < cost) return alert("Saldo insuficiente.");
    
    const btn = document.getElementById('btn-confirm-torneo-card');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
    
    try {
        const uid = auth.currentUser.uid;
        const numbers = Array.from(torneoSelection).sort((a,b) => {
            if(a==='00') return -1; if(b==='00') return 1; if(a==='0') return -1; if(b==='0') return 1;
            return parseInt(a) - parseInt(b);
        });
        
        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - cost);
        
        const cardId = Math.random().toString(36).substring(2, 8).toUpperCase();
        await db.ref(`bets_torneo_express/${torneoDateStr}/${uid}`).push({
            id: cardId,
            numbers: numbers,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        alert(`\u2705 \u00A1Ticket Comprado con \u00E9xito para el sorteo del ${torneoDateStr}!`);
        document.getElementById('torneo-selection-modal').style.display='none';
        
    } catch (e) {
        alert("Error en la compra: " + e.message);
        btn.disabled = false;
        btn.innerHTML = 'PAGAR TICKET';
    }
};

function renderTorneoTimeline() {
    if(!currentDateStr) return;
    const container = document.getElementById('torneo-results-timeline');
    if(!container) return;

    db.ref(`results_log/${currentDateStr}`).on('value', s => {
        const logs = s.val() || {};
        container.innerHTML = '';
        
        let hasAnyResult = false;

        TORNEO_HOURS.forEach(hourStr => {
            const timeKey = hourStr.replace(/:/g, '-').replace(/\./g, '').trim();
            const hourResults = [];
            
            TORNEO_LOTTOS.forEach(lotto => {
                if(logs[lotto] && logs[lotto][timeKey]) {
                    const num = logs[lotto][timeKey];
                    const aInfo = ANIMAL_MAP_LOTTO[num] || {i:'\u2753', n:'?'};
                    const img = LOTTO_IMGS[lotto];
                    hourResults.push(`
                        <div class="flex flex-col items-center p-1 bg-gray-50 border border-gray-200 rounded">
                            <img src="${img}" class="w-5 h-5 rounded-full mb-1">
                            <span class="text-sm">${aInfo.i}</span>
                            <span class="text-[10px] font-bold">${num}</span>
                        </div>
                    `);
                }
            });

            if(hourResults.length > 0) {
                hasAnyResult = true;
                container.innerHTML += `
                    <div class="border-l-2 border-orange-400 pl-3 pb-3 relative">
                        <div class="absolute w-3 h-3 bg-orange-500 rounded-full -left-[7px] top-1"></div>
                        <h4 class="text-xs font-bold text-gray-700 mb-2">${hourStr}</h4>
                        <div class="flex gap-2 flex-wrap">
                            ${hourResults.join('')}
                        </div>
                    </div>
                `;
            }
        });

        if(!hasAnyResult) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4 italic">Los resultados comenzar\u00E1n a aparecer aqu\u00ED a partir de la 1:00 PM.</p>';
        }
    });
}

function getWinningNumbersFromLogs(logs) {
    const winners = new Set();
    TORNEO_HOURS.forEach(hourStr => {
        const timeKey = hourStr.replace(/:/g, '-').replace(/\./g, '').trim();
        TORNEO_LOTTOS.forEach(lotto => {
            if(logs[lotto] && logs[lotto][timeKey]) {
                winners.add(String(logs[lotto][timeKey]));
            }
        });
    });
    return winners;
}

window.loadMyTorneoCards = () => {
    if(!auth.currentUser || !currentDateStr) return;
    const uid = auth.currentUser.uid;
    const container = document.getElementById('torneo-mycards-list');
    if(!container) return;

    db.ref(`results_log/${currentDateStr}`).on('value', rSnap => {
        currentTorneoWinningNumbers = getWinningNumbersFromLogs(rSnap.val() || {});
        
        db.ref(`bets_torneo_express/${currentDateStr}/${uid}`).on('value', s => {
            container.innerHTML = '';
            if(!s.exists()) {
                container.innerHTML = `<div class="text-center py-8"><i class="fas fa-box-open text-4xl text-gray-300 mb-2"></i><p class="text-sm text-gray-500 font-bold">A\u00FAn no tienes tickets.</p></div>`;
                return;
            }

            s.forEach(c => {
                const card = c.val();
                let hits = 0;
                
                const gridHtml = card.numbers.map(num => {
                    const strNum = String(num);
                    const aInfo = ANIMAL_MAP_LOTTO[strNum] || {i:'\u2753'};
                    let bgClass = "bg-white text-gray-700 border-gray-300";
                    if(currentTorneoWinningNumbers.has(strNum)) {
                        bgClass = "bg-green-500 text-white border-green-600 shadow-inner";
                        hits++;
                    }
                    return `<div class="border rounded text-center p-1 ${bgClass} flex flex-col items-center"><span class="text-sm leading-none">${aInfo.i}</span><span class="text-[10px] font-bold mt-1">${num}</span></div>`;
                }).join('');

                container.innerHTML += `
                    <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                        <div class="flex justify-between items-center mb-2 border-b pb-2">
                            <span class="text-xs font-bold text-gray-500">ID: #${card.id}</span>
                            <span class="text-sm font-black text-orange-600 bg-orange-100 px-2 py-1 rounded">${hits} ACIERTOS</span>
                        </div>
                        <div class="grid grid-cols-5 gap-1">
                            ${gridHtml}
                        </div>
                    </div>
                `;
            });
        });
    });
};

window.loadTorneoRanking = () => {
    if(!currentDateStr) return;
    const container = document.getElementById('torneo-ranking-list');
    if(!container) return;

    db.ref(`results_log/${currentDateStr}`).on('value', rSnap => {
        const winningSet = getWinningNumbersFromLogs(rSnap.val() || {});
        
        db.ref(`bets_torneo_express/${currentDateStr}`).on('value', s => {
            container.innerHTML = '';
            if(!s.exists()) {
                container.innerHTML = '<p class="text-center text-sm text-gray-500 py-8 italic">No hay participantes a\u00FAn.</p>';
                return;
            }

            let allCards = [];

            db.ref('users').once('value', usersSnap => {
                const usersData = usersSnap.val() || {};
                
                s.forEach(userNode => {
                    const uid = userNode.key;
                    const userData = usersData[uid] || {};
                    
                    const userName = userData.name ? userData.name : 'An\u00FAnimo';
                    
                    let rawPhone = userData.phone || '';
                    let maskedPhone = '';
                    if (rawPhone.length >= 7) {
                        maskedPhone = rawPhone.substring(0, 4) + '***' + rawPhone.substring(rawPhone.length - 4);
                    } else if (rawPhone.length > 0) {
                        maskedPhone = '***' + rawPhone.substring(rawPhone.length - 2);
                    } else {
                        maskedPhone = 'Sin tlf';
                    }
                    
                    userNode.forEach(cardNode => {
                        const card = cardNode.val();
                        let hits = 0;
                        let matchedAnimals = []; // <-- NUEVO: Guardamos los números que sí acertaron
                        
                        card.numbers.forEach(n => { 
                            if(winningSet.has(String(n))) {
                                hits++; 
                                matchedAnimals.push(n); // <-- NUEVO: Lo agregamos a la lista visual
                            }
                        });
                        
                        // <-- NUEVO: Pasamos el array de 'matchedAnimals' al objeto final
                        allCards.push({ name: userName, phone: maskedPhone, hits: hits, id: card.id, matched: matchedAnimals }); 
                    });
                });

                allCards.sort((a,b) => b.hits - a.hits);

                const maxHits = allCards.length > 0 ? allCards.hits : 0;

                allCards.forEach((p, index) => {
                    let positionHtml = `<span class="font-black text-gray-500 text-lg w-6 text-center">${index + 1}</span>`;
                    let bgClass = "bg-white";
                    
                    if(p.hits === maxHits && p.hits > 0) {
                        positionHtml = `<i class="fas fa-crown text-yellow-500 text-xl w-6 text-center"></i>`;
                        bgClass = "bg-yellow-50";
                    }

                    // <-- NUEVO: Generamos el bloque visual solo para los animalitos acertados
                    let animalsHtml = p.matched.map(n => {
                        const aInfo = ANIMAL_MAP_LOTTO[String(n)] || {i:'\u2753', n:'?'};
                        return `<div class="inline-flex flex-col items-center bg-green-100 border border-green-500 rounded px-1 py-0.5 mx-0.5 mt-1 shadow-sm"><span class="text-[12px] leading-none">${aInfo.i}</span><span class="text-[9px] font-bold text-green-700">${n}</span></div>`;
                    }).join('');

                    // <-- MODIFICADO: Añadimos ${animalsHtml} debajo de los datos del usuario
                    container.innerHTML += `
                        <div class="flex justify-between items-center p-3 border-b border-gray-100 ${bgClass}">
                            <div class="flex items-start gap-3 w-full">
                                <div class="mt-1">${positionHtml}</div>
                                <div class="flex-1">
                                    <p class="font-bold text-gray-800 text-sm uppercase">${p.name}</p>
                                    <p class="text-[10px] text-gray-400">ID: #${p.id} | Tlf: ${p.phone}</p>
                                    <div class="flex flex-wrap mt-1">${animalsHtml}</div>
                                </div>
                            </div>
                            <div class="bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg ml-2 flex-shrink-0">
                                <p class="text-xs font-black ${p.hits > 0 ? 'text-green-600' : 'text-gray-500'}">${p.hits} pts</p>
                            </div>
                        </div>
                    `;
                });
            });
        });
    });
};

/* ============================================================
   CONTROLADORES DE VIDEO - YOUTUBE IFRAME API (PERSONALIZADO)
   ============================================================ */
let playerTorneo;
let playerLoterias;

// Cargar la API de YouTube de forma asíncrona
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script');
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Esta función se ejecuta sola cuando la API de YouTube está lista
function onYouTubeIframeAPIReady() {
    playerTorneo = new YT.Player('player-torneo', {
        videoId: 'ciKrcvKlLEU',
        playerVars: { 'controls': 0, 'rel': 0, 'modestbranding': 1, 'fs': 0, 'disablekb': 1, 'playsinline': 1 },
        events: { 'onStateChange': (e) => onPlayerStateChange(e, 'torneo') }
    });

    playerLoterias = new YT.Player('player-loterias', {
        videoId: 'RMCF_dOHbTk',
        playerVars: { 'controls': 0, 'rel': 0, 'modestbranding': 1, 'fs': 0, 'disablekb': 1, 'playsinline': 1 },
        events: { 'onStateChange': (e) => onPlayerStateChange(e, 'loterias') }
    });
}

// Escuchar los estados del video (Reproduciendo, Pausado, Finalizado)
function onPlayerStateChange(event, type) {
    const icon = document.getElementById(`play-icon-${type}`);
    const overlay = document.getElementById(`overlay-${type}`); // Seleccionamos la capa oscura

