// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

// --- DATOS ---
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"🐬"},'00':{n:"Ballena",i:"🐳"},'1':{n:"Carnero",i:"🐏"},'2':{n:"Toro",i:"🐂"},'3':{n:"Ciempiés",i:"🐛"},'4':{n:"Alacrán",i:"🦂"},'5':{n:"León",i:"🦁"},'6':{n:"Rana",i:"🐸"},'7':{n:"Perico",i:"🦜"},'8':{n:"Ratón",i:"🐁"},'9':{n:"Águila",i:"🦅"},'10':{n:"Tigre",i:"🐅"},'11':{n:"Gato",i:"🐈"},'12':{n:"Caballo",i:"🐎"},'13':{n:"Mono",i:"🐒"},'14':{n:"Paloma",i:"🕊️"},'15':{n:"Zorro",i:"🦊"},'16':{n:"Oso",i:"🐻"},'17':{n:"Pavo",i:"🦃"},'18':{n:"Burro",i:"🫏"},'19':{n:"Chivo",i:"🐐"},'20':{n:"Cochino",i:"🐖"},'21':{n:"Gallo",i:"🐓"},'22':{n:"Camello",i:"🐫"},'23':{n:"Cebra",i:"🦓"},'24':{n:"Iguana",i:"🦎"},'25':{n:"Gallina",i:"🐔"},'26':{n:"Vaca",i:"🐄"},'27':{n:"Perro",i:"🐕"},'28':{n:"Zamuro",i:"🦅"},'29':{n:"Elefante",i:"🐘"},'30':{n:"Caimán",i:"🐊"},'31':{n:"Lapa",i:"🦫"},'32':{n:"Ardilla",i:"🐿️"},'33':{n:"Pescado",i:"🐟"},'34':{n:"Venado",i:"🦌"},'35':{n:"Jirafa",i:"🦒"},'36':{n:"Culebra",i:"🐍"},'37':{n:"Tortuga",i:"🐢"},'38':{n:"Búfalo",i:"🐃"},'39':{n:"Lechuza",i:"🦉"},'40':{n:"Avispa",i:"🐝"},'41':{n:"Canguro",i:"🦘"},'42':{n:"Tucán",i:"🦜"},'43':{n:"Mariposa",i:"🦋"},'44':{n:"Chigüire",i:"🐹"},'45':{n:"Garza",i:"🦩"},'46':{n:"Puma",i:"🐆"},'47':{n:"Pavo Real",i:"🦚"},'48':{n:"Puercoespín",i:"🦔"},'49':{n:"Pereza",i:"🦥"},'50':{n:"Canario",i:"🐦"},'51':{n:"Pelícano",i:"🦢"},'52':{n:"Pulpo",i:"🐙"},'53':{n:"Caracol",i:"🐌"},'54':{n:"Grillo",i:"🦗"},'55':{n:"Oso Hormig.",i:"🐜"},'56':{n:"Tiburón",i:"🦈"},'57':{n:"Pato",i:"🦆"},'58':{n:"Hormiga",i:"🐜"},'59':{n:"Pantera",i:"🐆"},'60':{n:"Camaleón",i:"🦎"},'61':{n:"Panda",i:"🐼"},'62':{n:"Cachicamo",i:"🦔"},'63':{n:"Cangrejo",i:"🦀"},'64':{n:"Gavilán",i:"🦅"},'65':{n:"Araña",i:"🕷️"},'66':{n:"Lobo",i:"🐺"},'67':{n:"Avestruz",i:"🐦"},'68':{n:"Jaguar",i:"🐆"},'69':{n:"Conejo",i:"🐇"},'70':{n:"Bisonte",i:"🦬"},'71':{n:"Guacamaya",i:"🦜"},'72':{n:"Gorila",i:"🦍"},'73':{n:"Hipopótamo",i:"🦛"},'74':{n:"Turpial",i:"🐦"},'75':{n:"Guácharo",i:"🦇"}};

let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null;
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "", isProcessing = false;
let isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000}; 

// --- INICIALIZACIÓN ---
window.onload=()=>{
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
    
    document.getElementById('auth-form').onsubmit=async(e)=>{
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
            } else await auth.signInWithEmailAndPassword(email,pw); 
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
        await db.ref('withdrawal_requests').push(d); 
        alert("Enviado"); document.getElementById('withdraw-form-area').style.display='none';
    };
    
    db.ref('config/tripleta').on('value', s => { if(s.exists()) tripletaConfig = s.val(); });
    db.ref('config/dupleta').on('value', s => { if(s.exists()) dupletaConfig = s.val(); });
    
    // BINGO: Comprar Cartón
    document.getElementById('start-purchase-btn').onclick = async function() {
        if(isProcessing) return; isProcessing = true;
        try {
            if(!auth.currentUser) throw new Error("Inicia sesión");
            if(userBalance < currentCardPrice) throw new Error("Saldo insuficiente");
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(b => (b >= currentCardPrice ? b - currentCardPrice : b));
            let card = [], used = new Set(); while(card.length < 15) { let n = Math.floor(Math.random() * 75) + 1; if(!used.has(n)) { used.add(n); card.push(n); } }
            await db.ref(`bingo_players/${auth.currentUser.uid}`).push({ card: card, timestamp: firebase.database.ServerValue.TIMESTAMP, status: 'active' });
            alert("¡Cartón Comprado!"); loadMyBingoHistory();
        } catch (e) { alert(e.message); } finally { isProcessing = false; }
    };
};

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{
        userBalance=s.val()||0; 
        document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;
    });
    db.ref('config/bingo_price').on('value', s => { 
        currentCardPrice = s.val() || 50; 
        document.getElementById('starter-card-price').textContent = currentCardPrice; 
    });
    syncTime();
    loadMyBingoHistory();
}

async function syncTime(){try{const r=await fetch('https://worldtimeapi.org/api/timezone/America/Caracas');const d=await r.json();serverTimeOffset=new Date(d.datetime).getTime()-Date.now();}catch(e){}updateGameDate();}

function updateGameDate(){
    const now=new Date(Date.now()+serverTimeOffset); 
    if(now.getHours()>=20) now.setDate(now.getDate()+1); 
    currentDateStr=`${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`; 
    if(document.getElementById('game-date-display')) document.getElementById('game-date-display').textContent = currentDateStr; 
    loadMyDailyBets();
}

// --- INTERFAZ USUARIO ---
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
        document.getElementById('selected-lottery-title').textContent = "TRIPLETA";
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
        document.getElementById('selected-lottery-title').textContent = "DUPLETA";
        renderLottoGrid(36); renderTimeOptions();
    }
    selectedLottoAnimals.clear(); updateModeUI();
}

window.placeBet = async () => {
    if(isProcessing) return; isProcessing = true;
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

// --- FUNCIONES AUXILIARES ---
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
    if(max === 36) keys = ['0','00'];
    for(let i=1; i<=max; i++) keys.push(i.toString());
    
    keys.forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'select-animal-btn';
        if(ANIMAL_MAP_LOTTO[key]) {
            btn.innerHTML = `<span class="emoji-font">${ANIMAL_MAP_LOTTO[key].i}</span><span>${key}</span>`;
            btn.onclick = () => toggleAnimalSelection(key, btn);
            grid.appendChild(btn);
        }
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
    const amountContainer = document.getElementById('amount-input-container');
    const totalDisplay = document.getElementById('lotto-total-display');
    const amount = document.getElementById('lotto-amount').value || 0;
    
    if(isTripletaMode) {
        amountContainer.style.display = 'none';
        totalDisplay.textContent = `Total: ${tripletaConfig.cost} Bs`;
    } else if(isDupletaMode) {
        amountContainer.style.display = 'none';
        totalDisplay.textContent = `Total: ${dupletaConfig.cost} Bs`;
    } else {
        amountContainer.style.display = 'block';
        totalDisplay.textContent = `Total: ${amount * selectedLottoAnimals.size} Bs`;
    }
}

window.loadMyDailyBets = function() {
    if(!auth.currentUser || !currentDateStr) return;
    const container = document.getElementById('my-bets-list');
    container.innerHTML = '';
    
    const render = (snap) => {
        snap.forEach(child => {
            const val = child.val();
            const div = document.createElement('div');
            div.className = "bg-gray-100 p-2 rounded mb-2 border";
            div.innerHTML = `<div><b>${val.lottery}</b> - ${val.animals ? val.animals : val.animal}</div><div class="text-xs">${val.time} - ${val.amount} Bs</div>`;
            container.appendChild(div);
        });
    };
    db.ref(`bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`).once('value', render);
    db.ref(`bets_tripletas/${currentDateStr}/${auth.currentUser.uid}`).once('value', render);
    db.ref(`bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`).once('value', render);
}

window.loadMyBingoHistory = function() {
    if(!auth.currentUser) return;
    db.ref(`bingo_players/${auth.currentUser.uid}`).once('value', s=>{
        const div = document.getElementById('carton-list');
        div.innerHTML = '';
        if(s.exists()) {
            document.getElementById('no-cards-msg').classList.add('hidden');
            s.forEach(c => {
                const d = document.createElement('div'); d.className='bingo-card';
                d.innerHTML = `<div class="animal-grid">${c.val().card.map(n=>`<div class="animal-cell">${n}</div>`).join('')}</div>`;
                div.appendChild(d);
            });
            document.getElementById('carton-display-container').classList.remove('hidden');
        }
    });
}

window.openTripletaModal = function() { document.getElementById('modal-tripletas').style.display = 'flex'; }
window.openDupletaModal = function() { document.getElementById('modal-dupletas').style.display = 'flex'; }
