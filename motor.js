// --- DATOS Y CONFIGURACIÓN ---
const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"}};

const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };
firebase.initializeApp(firebaseConfig); const auth = firebase.auth(); const db = firebase.database();

// VARIABLES GLOBALES
let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null, globalLimit=0, totalSold=0;
let purchaseState = {totalQty:0, currentCardIndex:0, draftCards:[]}, currentSelection=new Set();
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "", currentLimits = { general: 700, guacharo: 350 };
let isProcessing = false;
let activeAnimalitosRef=null, activeTripletasRef=null, isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000}, activeDupletasRef=null, dailyResults={}; 

// VARIABLES NUEVAS SORTEO
let userYTPlayer;
let drawSequence = [];
let allParticipantsData = [];
let syncTimer;
let viewingDate = "today"; // Para saber si estamos viendo hoy o historial

window.onload=()=>{
    auth.onAuthStateChanged(u=>{ 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { document.getElementById('logged-in-area').classList.remove('hidden'); document.getElementById('logged-in-area').style.display='block'; document.getElementById('nav-logout-btn').classList.remove('hidden'); init(); } 
        else { document.getElementById('logged-in-area').classList.add('hidden'); document.getElementById('logged-in-area').style.display='none'; document.getElementById('nav-logout-btn').classList.add('hidden'); }
    });
    
    document.getElementById('auth-form').onsubmit=async(e)=>{e.preventDefault(); const p=document.getElementById('auth-phone').value.replace(/\D/g,''), pw=document.getElementById('auth-password').value, n=document.getElementById('auth-name').value; const email = p+"@bingotexier.com"; try { if(!document.getElementById('auth-name').classList.contains('hidden')){const u=await auth.createUserWithEmailAndPassword(email,pw); await u.user.updateProfile({displayName:n}); await db.ref(`users/${u.user.uid}`).set({name:n, phone:p, balance:0});} else await auth.signInWithEmailAndPassword(email,pw); } catch(e){ document.getElementById('auth-error').textContent=e.message; document.getElementById('auth-error').classList.remove('hidden'); }};
    document.getElementById('toggle-auth-mode').onclick=()=>{const n=document.getElementById('auth-name'); n.classList.toggle('hidden'); document.getElementById('auth-title').textContent=n.classList.contains('hidden')?'Iniciar Sesión':'Registro'; document.getElementById('auth-submit-btn').textContent=n.classList.contains('hidden')?'Acceder':'Registrarme';};
    document.getElementById('withdraw-form').onsubmit=async(e)=>{e.preventDefault(); const a=parseFloat(document.getElementById('withdraw-amount').value); if(a>userBalance) return alert("Saldo insuficiente"); const d = {amount:a, tlf:document.getElementById('w-tlf').value, cedula:document.getElementById('w-cedula').value, banco:document.getElementById('w-banco').value, uid:auth.currentUser.uid, name:auth.currentUser.displayName, userPhone:auth.currentUser.email.split('@')[0], status:'PENDING', timestamp:firebase.database.ServerValue.TIMESTAMP}; await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-a); await db.ref(`users/${auth.currentUser.uid}/balance_pending_withdrawal`).transaction(c=>(c||0)+a); await db.ref('withdrawal_requests').push(d); alert("Enviado"); document.getElementById('withdraw-form-area').style.display='none';};
    
    // CARGAR FECHAS DE HISTORIAL AL INICIO
    loadHistoryDates();
};

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{userBalance=s.val()||0; document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;});
    syncTime();
    db.ref('draw_status').on('value', s=>{ const d = s.val() || {}; currentDate = d.date; });
}

async function syncTime(){try{const r=await fetch('https://worldtimeapi.org/api/timezone/America/Caracas');const d=await r.json();serverTimeOffset=new Date(d.datetime).getTime()-Date.now();}catch(e){}updateGameDate();}
function updateGameDate(){const now=new Date(Date.now()+serverTimeOffset); if(now.getHours()>=20) now.setDate(now.getDate()+1); currentDateStr=`${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`; db.ref(`results_log/${currentDateStr}`).on('value',s=>{dailyResults=s.val()||{}; loadMyDailyBets();});}

// *** FUNCIÓN SEGURA PARA CAMBIAR PANTALLA ***
window.cambiarPantalla = function(mode) {
    document.getElementById('section-bingo').classList.add('hidden');
    document.getElementById('section-bingo').style.display = 'none';
    document.getElementById('section-animalitos').classList.add('hidden');
    document.getElementById('section-animalitos').style.display = 'none';
    document.getElementById('section-sorteo-vivo').classList.add('hidden');
    
    clearInterval(syncTimer);
    if(userYTPlayer && userYTPlayer.stopVideo) userYTPlayer.stopVideo();

    if(mode === 'bingo') {
        document.getElementById('section-bingo').classList.remove('hidden');
        document.getElementById('section-bingo').style.display = 'block';
    } else if(mode === 'animalitos') {
        document.getElementById('section-animalitos').classList.remove('hidden');
        document.getElementById('section-animalitos').style.display = 'block';
    } else if(mode === 'sorteo-vivo') {
        document.getElementById('section-sorteo-vivo').classList.remove('hidden');
        loadHistoricalDraw('today'); // Por defecto carga hoy
    }
};

// --- GESTIÓN DE HISTORIAL ---
function loadHistoryDates() {
    db.ref('historial_sorteos_animados').once('value', snap => {
        if(!snap.exists()) return;
        const selector = document.getElementById('history-selector');
        selector.innerHTML = '<option value="today">Sorteo de Hoy (En Vivo)</option>';
        snap.forEach(child => {
            const date = child.key;
            const opt = document.createElement('option');
            opt.value = date;
            opt.innerText = `Sorteo del ${date}`;
            selector.appendChild(opt);
        });
    });
}

window.loadHistoricalDraw = function(dateKey) {
    viewingDate = dateKey;
    let dataRef, betsRef;

    if(dateKey === 'today') {
        dataRef = db.ref('sorteo_animado_actual');
        // IMPORTANTE: Busca en ESTELAR. Si ya se calificó y borró, busca en HISTORIAL_BETS/FECHA
        betsRef = db.ref(`bingo_to_grade/estelar/${currentDateStr}/bets`);
    } else {
        dataRef = db.ref(`historial_sorteos_animados/${dateKey}`);
        betsRef = db.ref(`historial_apuestas_bingo/${dateKey}`); // Asumiendo que guardas copias aquí
    }

    dataRef.on('value', snap => {
        if(!snap.exists()) { alert("No hay datos de video para esta fecha"); return; }
        const data = snap.val();
        drawSequence = data.secuencia || [];
        
        if(userYTPlayer && userYTPlayer.loadVideoById) {
            userYTPlayer.loadVideoById(data.video_id);
        } else {
            userYTPlayer = new YT.Player('user-player', {
                height: '100%',
                width: '100%',
                videoId: data.video_id,
                playerVars: { 'autoplay': 1, 'modestbranding': 1, 'rel': 0 },
                events: { 'onStateChange': onPlayerStateChange }
            });
        }
    });

    betsRef.on('value', s => {
        // Si no hay datos activos, intenta buscar en backup/historial si no es 'today'
        if(!s.exists() && dateKey === 'today') {
             // Fallback por si acaso ya lo borraste
             // db.ref(`historial_apuestas_bingo/${currentDateStr}`).on(...) 
        }
        allParticipantsData = s.exists() ? Object.values(s.val()) : [];
        console.log("Participantes cargados:", allParticipantsData.length);
    });
};

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        syncTimer = setInterval(updateLiveSync, 500);
    } else {
        clearInterval(syncTimer);
    }
}

// --- LÓGICA CENTRAL DE SINCRONIZACIÓN ---
function updateLiveSync() {
    if(!userYTPlayer || !userYTPlayer.getCurrentTime) return;
    
    const time = userYTPlayer.getCurrentTime();
    const out = drawSequence.filter(s => s.seg <= time);
    const outIds = out.map(s => s.animal.toString());

    if(out.length > 0) {
        const last = out[out.length - 1];
        document.getElementById('live-animal-name').textContent = `#${last.animal} ${last.nombre}`;
    }

    // CALCULAR RANKING
    const ranked = allParticipantsData.map(p => {
        const pNums = Array.isArray(p.numbers) ? p.numbers : Object.values(p.numbers || {});
        const hits = pNums.filter(n => outIds.includes(n.toString())).length;
        
        // Si es el usuario logueado, DIBUJAR SUS CARTONES
        if(auth.currentUser && p.name === auth.currentUser.displayName) {
             renderMyLiveCards(pNums, outIds);
        }
        return { name: p.name, hits: hits };
    }).sort((a,b) => b.hits - a.hits); // Ordenar mayor a menor

    renderLiveRanking(ranked);
    calculatePavoso(ranked);
}

// --- VISUALIZACIÓN DE CARTONES (LO QUE PEDISTE) ---
function renderMyLiveCards(myNumbers, drawnIds) {
    const container = document.getElementById('live-user-cards');
    if(!myNumbers || myNumbers.length === 0) {
        container.innerHTML = "<p class='text-center text-xs text-gray-500'>No tienes cartones activos.</p>";
        return;
    }

    // Dividir los números en grupos de 25 (cartones) o mostrarlos todos
    // Aquí asumimos visualización compacta
    let html = `<div class="bg-gray-100 p-2 rounded-lg border border-gray-300 relative shadow-sm"><div class="grid grid-cols-5 gap-1">`;
    
    myNumbers.forEach(num => {
         const isMarked = drawnIds.includes(num.toString());
         const animal = ANIMAL_MAP_BINGO[num];
         html += `
            <div class="flex flex-col items-center justify-center p-1 rounded aspect-square ${isMarked ? 'bg-green-500 text-white scale-105 shadow-lg border-green-600' : 'bg-white text-gray-700 border-gray-200'} border transition-all duration-300">
                <span class="text-xl leading-none">${animal ? animal.i : '?'}</span>
                <span class="text-[8px] font-bold">${num}</span>
            </div>
         `;
    });
    
    html += `</div></div>`;
    container.innerHTML = html;
}

// --- VISUALIZACIÓN DEL PAVOSO (LO QUE FALTABA) ---
function calculatePavoso(rankedList) {
    if(rankedList.length === 0) return;
    // El último de la lista ordenada (menor puntaje)
    const pavoso = rankedList[rankedList.length - 1]; 
    
    const zone = document.getElementById('pavoso-zone');
    const display = document.getElementById('pavoso-display');
    
    zone.classList.remove('hidden');
    display.innerHTML = `
        <span class="text-white font-bold text-sm uppercase">${pavoso.name}</span>
        <span class="bg-red-600 text-white px-2 py-1 rounded text-xs font-black">${pavoso.hits} ACIERTOS</span>
    `;
}

function renderLiveRanking(list) {
    const container = document.getElementById('live-ranking-list');
    const myName = auth.currentUser ? auth.currentUser.displayName : "";
    
    container.innerHTML = list.slice(0, 6).map((p, i) => {
        const isMe = p.name === myName;
        return `
            <div class="flex justify-between items-center p-3 rounded-xl transition-all duration-500 ${isMe ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-white/5'}">
                <span class="text-white text-xs font-bold">
                    <span class="text-gray-500 mr-2">${i+1}</span> ${p.name.substring(0, 15)}
                </span>
                <span class="${isMe ? 'text-yellow-400' : 'text-gray-400'} font-black text-sm">${p.hits} aciertos</span>
            </div>
        `;
    }).join('');
}

// FUNCIONES BÁSICAS DE APUESTA (SIN CAMBIOS)
window.placeBet = async () => {
    // ... (Tu código de placeBet original va aquí, no ha cambiado) ...
    // Para ahorrar espacio en el chat, mantén la función placeBet que ya tenías
    if(isProcessing) return; isProcessing = true;
    const time = document.getElementById('lotto-time-select').value;
    // ... resto de lógica de apuesta ...
    try {
        // ... validaciones y firebase push ...
        alert("¡Ticket Procesado!");
    } catch(e) { alert(e.message); } finally { isProcessing = false; }
};
