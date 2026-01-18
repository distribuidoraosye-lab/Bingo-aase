// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// --- DATOS Y MAPAS (Tu versión estable) ---
const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"},'26':{n:"Vaca",i:"\u{1F404}"},'27':{n:"Perro",i:"\u{1F415}"},'28':{n:"Zamuro",i:"\u{1F985}"},'29':{n:"Elefante",i:"\u{1F418}"},'30':{n:"Caimán",i:"\u{1F40A}"},'31':{n:"Lapa",i:"\u{1F9AB}"},'32':{n:"Ardilla",i:"\u{1F43F}"},'33':{n:"Pescado",i:"\u{1F41F}"},'34':{n:"Venado",i:"\u{1F98C}"},'35':{n:"Jirafa",i:"\u{1F992}"},'36':{n:"Culebra",i:"\u{1F40D}"},'37':{n:"Tortuga",i:"\u{1F422}"},'38':{n:"Búfalo",i:"\u{1F403}"},'39':{n:"Lechuza",i:"\u{1F989}"},'40':{n:"Avispa",i:"\u{1F41D}"},'41':{n:"Canguro",i:"\u{1F998}"},'42':{n:"Tucán",i:"\u{1F99C}"},'43':{n:"Mariposa",i:"\u{1F98B}"},'44':{n:"Chigüire",i:"\u{1F9AB}"},'45':{n:"Garza",i:"\u{1F9A9}"},'46':{n:"Puma",i:"\u{1F408}"},'47':{n:"Pavo Real",i:"\u{1F99A}"},'48':{n:"Puercoespín",i:"\u{1F994}"},'49':{n:"Pereza",i:"\u{1F9A5}"},'50':{n:"Canario",i:"\u{1F424}"},'51':{n:"Pelícano",i:"\u{1F9A4}"},'52':{n:"Pulpo",i:"\u{1F419}"},'53':{n:"Caracol",i:"\u{1F40C}"},'54':{n:"Grillo",i:"\u{1F997}"},'55':{n:"Oso Hormig.",i:"\u{1F9A1}"},'56':{n:"Tiburón",i:"\u{1F988}"},'57':{n:"Pato",i:"\u{1F986}"},'58':{n:"Hormiga",i:"\u{1F41C}"},'59':{n:"Pantera",i:"\u{1F408}\u{200D}\u{2B1B}"},'60':{n:"Camaleón",i:"\u{1F98E}"},'61':{n:"Panda",i:"\u{1F43C}"},'62':{n:"Cachicamo",i:"\u{1F993}"},'63':{n:"Cangrejo",i:"\u{1F980}"},'64':{n:"Gavilán",i:"\u{1F985}"},'65':{n:"Araña",i:"\u{1F577}"},'66':{n:"Lobo",i:"\u{1F43A}"},'67':{n:"Avestruz",i:"\u{1F426}"},'68':{n:"Jaguar",i:"\u{1F406}"},'69':{n:"Conejo",i:"\u{1F407}"},'70':{n:"Bisonte",i:"\u{1F9AC}"},'71':{n:"Guacamaya",i:"\u{1F99C}"},'72':{n:"Gorila",i:"\u{1F98D}"},'73':{n:"Hipopótamo",i:"\u{1F99B}"},'74':{n:"Turpial",i:"\u{1F426}"},'75':{n:"Guácharo",i:"\u{1F987}"}};

// Variables de Estado
let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null;
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "";
let isProcessing = false;
let isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000}; 

// --- INICIALIZACIÓN ---
window.onload = function() {
    auth.onAuthStateChanged(u => { 
        // Control de Vistas basado en sesión
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
    
    // Listeners de Formularios (Login, Registro, Retiro)
    document.getElementById('auth-form').onsubmit = async(e)=>{
        e.preventDefault(); 
        const p=document.getElementById('auth-phone').value.replace(/\D/g,'');
        const pw=document.getElementById('auth-password').value;
        const n=document.getElementById('auth-name').value; 
        const email = p+"@bingotexier.com"; 
        try { 
            if(!document.getElementById('auth-name').classList.contains('hidden')){
                const u=await auth.createUserWithEmailAndPassword(email,pw); 
                await u.user.updateProfile({displayName:n}); 
                await db.ref(`users/${u.user.uid}`).set({name:n, phone:p, balance:0});
            } else {
                await auth.signInWithEmailAndPassword(email,pw); 
            }
        } catch(e){ 
            document.getElementById('auth-error').textContent=e.message; 
            document.getElementById('auth-error').classList.remove('hidden'); 
        }
    };

    document.getElementById('toggle-auth-mode').onclick=()=>{
        const n=document.getElementById('auth-name'); 
        n.classList.toggle('hidden'); 
        document.getElementById('auth-title').textContent=n.classList.contains('hidden')?'Iniciar Sesión':'Registro'; 
        document.getElementById('auth-submit-btn').textContent=n.classList.contains('hidden')?'Acceder':'Registrarme';
    };
    
    document.getElementById('withdraw-form').onsubmit=async(e)=>{
        e.preventDefault(); 
        const a=parseFloat(document.getElementById('withdraw-amount').value); 
        if(a>userBalance) return alert("Saldo insuficiente"); 
        const d = {amount:a, tlf:document.getElementById('w-tlf').value, cedula:document.getElementById('w-cedula').value, banco:document.getElementById('w-banco').value, uid:auth.currentUser.uid, name:auth.currentUser.displayName, userPhone:auth.currentUser.email.split('@')[0], status:'PENDING', timestamp:firebase.database.ServerValue.TIMESTAMP}; 
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-a); 
        await db.ref(`users/${auth.currentUser.uid}/balance_pending_withdrawal`).transaction(c=>(c||0)+a); 
        await db.ref('withdrawal_requests').push(d); 
        alert("Enviado"); document.getElementById('withdraw-form-area').style.display='none';
    };

    // Listeners de Configuración
    db.ref('config/tripleta').on('value', s => { if(s.exists()) tripletaConfig = s.val(); });
    db.ref('config/dupleta').on('value', s => { if(s.exists()) dupletaConfig = s.val(); });

    // Listener Botón de Compra Bingo
    document.getElementById('start-purchase-btn').onclick = async function() {
        if(isProcessing) return; isProcessing = true;
        try {
            if(!auth.currentUser) throw new Error("Debes iniciar sesión");
            if(userBalance < currentCardPrice) throw new Error("Saldo insuficiente");
            
            // Transacción de saldo
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => {
                if((c||0) >= currentCardPrice) return c - currentCardPrice;
                return c; // Abortar si no alcanza
            }, (error, committed) => {
                if(error || !committed) throw new Error("No se pudo procesar el pago");
            });

            // Generar Cartón
            let card = []; 
            while(card.length < 15) { 
                let n = Math.floor(Math.random() * 75) + 1; 
                if(!card.includes(n)) card.push(n); 
            }
            
            // Guardar Cartón en bingo_players (Si las reglas lo permiten)
            await db.ref(`bingo_players/${auth.currentUser.uid}`).push({
                card: card,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                status: 'active'
            });
            alert("¡Cartón Comprado!");
            loadMyBingoHistory();
        } catch(e) {
            alert(e.message);
        } finally {
            isProcessing = false;
        }
    };
};

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    
    // Cargar Saldo
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{
        userBalance=s.val()||0; 
        document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;
    });

    // Cargar Precio Bingo (SOLO DESPUÉS DE ESTAR LOGUEADO)
    db.ref('config/bingo_price').on('value', s => { 
        currentCardPrice = s.val() || 50; 
        document.getElementById('starter-card-price').textContent = currentCardPrice; 
    });

    syncTime();
    updateGameDate();
}

async function syncTime(){try{const r=await fetch('https://worldtimeapi.org/api/timezone/America/Caracas');const d=await r.json();serverTimeOffset=new Date(d.datetime).getTime()-Date.now();}catch(e){}updateGameDate();}

function updateGameDate(){
    const now=new Date(Date.now()+serverTimeOffset); 
    if(now.getHours()>=20) now.setDate(now.getDate()+1); 
    currentDateStr=`${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`; 
    if(document.getElementById('game-date-display')) document.getElementById('game-date-display').textContent = currentDateStr; 
    loadMyDailyBets();
}

// --- FUNCIONES GLOBALIZADAS PARA EL HTML ---

window.switchMode = function(mode) {
    document.getElementById('game-selector').style.display = 'none';
    if(mode === 'bingo') {
        document.getElementById('section-bingo').style.display = 'block';
        document.getElementById('section-animalitos').style.display = 'none';
    } else {
        document.getElementById('section-bingo').style.display = 'none';
        document.getElementById('section-animalitos').style.display = 'block';
        updateGameDate(); 
    }
}

window.selectLottery = function(name) {
    isTripletaMode = false; isDupletaMode = false;
    document.getElementById('tripleta-banner').classList.add('hidden');
    document.getElementById('dupleta-banner').classList.add('hidden');
    document.querySelectorAll('.lottery-btn').forEach(btn => btn.classList.remove('lottery-selected'));
    
    // Mapeo simple de IDs
    const idMap = { 'Lotto Activo': 'btn-lotto-activo', 'La Granjita': 'btn-la-granjita', 'Ruleta Activa': 'btn-ruleta-activa', 'Mega Animal 40': 'btn-mega-animal-40', 'Selva Plus': 'btn-selva-plus', 'El Guacharo': 'btn-el-guacharo', 'Lotto Rey': 'btn-lotto-rey' };
    if(idMap[name]) document.getElementById(idMap[name]).classList.add('lottery-selected');

    selectedLotto = name;
    document.getElementById('selected-lottery-title').textContent = `JUGANDO: ${name.toUpperCase()}`;
    document.getElementById('animalitos-game-area').style.display = 'block';
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    
    renderTimeOptions(); 
    renderLottoGrid(name === 'El Guacharo' ? 75 : 36); 
    selectedLottoAnimals.clear();
    updateModeUI();
}

window.toggleTripletaMode = function() {
    isTripletaMode = !isTripletaMode; isDupletaMode = false;
    document.getElementById('tripleta-banner').classList.toggle('hidden', !isTripletaMode);
    document.getElementById('dupleta-banner').classList.add('hidden');
    document.getElementById('animalitos-game-area').style.display = 'block';
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    if(isTripletaMode) {
        selectedLotto = "Tripleta";
        document.getElementById('selected-lottery-title').textContent = "JUGANDO: TRIPLETA MULTI-LOTERÍA";
        renderLottoGrid(36); renderTimeOptions();
    }
    selectedLottoAnimals.clear(); updateModeUI();
}

window.toggleDupletaMode = function() {
    isDupletaMode = !isDupletaMode; isTripletaMode = false;
    document.getElementById('dupleta-banner').classList.toggle('hidden', !isDupletaMode);
    document.getElementById('tripleta-banner').classList.add('hidden');
    document.getElementById('animalitos-game-area').style.display = 'block';
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    if(isDupletaMode) {
        selectedLotto = "Dupleta";
        document.getElementById('selected-lottery-title').textContent = "JUGANDO: DUPLETA (3 Loterías)";
        renderLottoGrid(36); renderTimeOptions();
    }
    selectedLottoAnimals.clear(); updateModeUI();
}

window.placeBet = async function() {
    if(isProcessing) return; isProcessing = true;
    if(!auth.currentUser) { alert("Debes iniciar sesión"); isProcessing=false; return; }
    
    const time = document.getElementById('lotto-time-select').value;
    const drawDate = new Date(Date.now() + serverTimeOffset);
    const limitTimestamp = drawDate.getTime() - (10 * 60 * 1000); 

    try {
        if(isTripletaMode) {
            if(selectedLottoAnimals.size !== 3) throw new Error("Selecciona 3 animales.");
            const cost = tripletaConfig.cost;
            if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost);
            await db.ref(`bets_tripletas/${currentDateStr}/${auth.currentUser.uid}`).push({
                lottery: selectedLotto, time, animals: Array.from(selectedLottoAnimals),
                amount: cost, status: 'PENDING', limit_timestamp: limitTimestamp,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            alert("¡Tripleta Jugada!");
        } else if (isDupletaMode) {
            if(selectedLottoAnimals.size !== 2) throw new Error("Selecciona 2 animales.");
            const cost = dupletaConfig.cost;
            if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost);
            await db.ref(`bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`).push({
                lottery: "Dupleta", time, animals: Array.from(selectedLottoAnimals),
                amount: cost, status: 'PENDING', limit_timestamp: limitTimestamp,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            alert("¡Dupleta Jugada!");
        } else {
            const amt = parseFloat(document.getElementById('lotto-amount').value);
            if(selectedLottoAnimals.size === 0 || !amt || amt < 1) throw new Error("Faltan datos");
            const cost = amt * selectedLottoAnimals.size;
            if(userBalance < cost) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c||0) - cost);
            const updates = {};
            const baseRef = `bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`;
            selectedLottoAnimals.forEach(animal => {
                const k = db.ref(baseRef).push().key;
                updates[`${baseRef}/${k}`] = {
                    lottery: selectedLotto, time, animal, amount: amt, status: 'PENDING',
                    limit_timestamp: limitTimestamp,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };
            });
            await db.ref().update(updates);
            alert("¡Ticket Jugado!");
        }
        selectedLottoAnimals.clear();
        updateModeUI();
        loadMyDailyBets();
    } catch(e) {
        alert(e.message);
    } finally {
        isProcessing = false;
    }
};

// --- RENDERIZADORES ---
function renderTimeOptions() {
    const select = document.getElementById('lotto-time-select');
    select.innerHTML = '';
    const hours = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
    hours.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h; opt.textContent = h;
        select.appendChild(opt);
    });
}

function renderLottoGrid(max) {
    const grid = document.getElementById('lotto-animal-grid');
    grid.innerHTML = '';
    let keys = [];
    if(max === 36) keys = ['0', '00'];
    for(let i=1; i<=max; i++) keys.push(i.toString());
    
    keys.forEach(k => {
        if(!ANIMAL_MAP_LOTTO[k]) return;
        const btn = document.createElement('div');
        btn.className = 'select-animal-btn';
        btn.innerHTML = `<span class="emoji-font">${ANIMAL_MAP_LOTTO[k].i}</span><span>${k}</span>`;
        btn.onclick = () => toggleAnimalSelection(k, btn);
        grid.appendChild(btn);
    });
}

function toggleAnimalSelection(animalKey, btnElement) {
    if(selectedLottoAnimals.has(animalKey)) {
        selectedLottoAnimals.delete(animalKey);
        btnElement.classList.remove('selected');
    } else {
        if(isTripletaMode && selectedLottoAnimals.size >= 3) return alert("Máximo 3 para tripleta");
        if(isDupletaMode && selectedLottoAnimals.size >= 2) return alert("Máximo 2 para dupleta");
        selectedLottoAnimals.add(animalKey);
        btnElement.classList.add('selected');
    }
    updateModeUI();
}

function updateModeUI() {
    const btn = document.getElementById('lotto-play-btn');
    const amount = document.getElementById('lotto-amount').value || 0;
    
    if(isTripletaMode) {
        document.getElementById('amount-input-container').style.display = 'none';
        document.getElementById('lotto-total-display').textContent = `Total: ${tripletaConfig.cost} Bs`;
    } else if(isDupletaMode) {
        document.getElementById('amount-input-container').style.display = 'none';
        document.getElementById('lotto-total-display').textContent = `Total: ${dupletaConfig.cost} Bs`;
    } else {
        document.getElementById('amount-input-container').style.display = 'block';
        const total = amount * selectedLottoAnimals.size;
        document.getElementById('lotto-total-display').textContent = `Total: ${total} Bs`;
    }
}

function loadMyDailyBets() {
    if(!auth.currentUser || !currentDateStr) return;
    const container = document.getElementById('my-bets-list');
    container.innerHTML = '';
    
    const render = (s, type) => {
        if(s.exists()) {
            s.forEach(child => {
                const val = child.val();
                const div = document.createElement('div');
                div.className = "bg-white border rounded p-2 mb-1 shadow-sm flex justify-between items-center";
                div.innerHTML = `<div><span class="font-bold text-xs">${val.lottery}</span> <span class="text-xs">(${val.time})</span><br><span class="text-xs text-gray-500">${val.animals || val.animal}</span></div><div class="font-bold text-green-600 text-sm">${val.amount} Bs</div>`;
                container.appendChild(div);
            });
        }
    };
    db.ref(`bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`).once('value', s => render(s, 'normal'));
    db.ref(`bets_tripletas/${currentDateStr}/${auth.currentUser.uid}`).once('value', s => render(s, 'tripleta'));
    db.ref(`bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`).once('value', s => render(s, 'dupleta'));
}

window.loadMyBingoHistory = function() {
    if(!auth.currentUser) return;
    const container = document.getElementById('carton-list');
    container.innerHTML = ''; 
    db.ref(`bingo_players/${auth.currentUser.uid}`).once('value', s => {
        if(s.exists()) {
            document.getElementById('no-cards-msg').classList.add('hidden');
            s.forEach(c => {
                const data = c.val();
                if(data.status === 'active') {
                    const div = document.createElement('div');
                    div.className = 'bingo-card';
                    div.innerHTML = `<div class="animal-grid">${data.card.map(n => `<div class="animal-cell"><span>${n}</span></div>`).join('')}</div>`;
                    container.appendChild(div);
                }
            });
            document.getElementById('carton-display-container').classList.remove('hidden');
        } else {
            document.getElementById('no-cards-msg').classList.remove('hidden');
        }
    });
}

window.openTripletaModal = function() { document.getElementById('modal-tripletas').style.display = 'flex'; }
window.openDupletaModal = function() { document.getElementById('modal-dupletas').style.display = 'flex'; }
