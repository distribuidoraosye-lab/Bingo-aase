// --- CONFIGURACIÓN FIREBASE (Global) ---
const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };

// Inicializar solo si no existe ya una instancia
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Variables Globales necesarias para el HTML
const auth = firebase.auth();
const db = firebase.database();

// Mapas de datos
const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"},'26':{n:"Vaca",i:"\u{1F404}"},'27':{n:"Perro",i:"\u{1F415}"},'28':{n:"Zamuro",i:"\u{1F985}"},'29':{n:"Elefante",i:"\u{1F418}"},'30':{n:"Caimán",i:"\u{1F40A}"},'31':{n:"Lapa",i:"\u{1F9AB}"},'32':{n:"Ardilla",i:"\u{1F43F}"},'33':{n:"Pescado",i:"\u{1F41F}"},'34':{n:"Venado",i:"\u{1F98C}"},'35':{n:"Jirafa",i:"\u{1F992}"},'36':{n:"Culebra",i:"\u{1F40D}"},'37':{n:"Tortuga",i:"\u{1F422}"},'38':{n:"Búfalo",i:"\u{1F403}"},'39':{n:"Lechuza",i:"\u{1F989}"},'40':{n:"Avispa",i:"\u{1F41D}"},'41':{n:"Canguro",i:"\u{1F998}"},'42':{n:"Tucán",i:"\u{1F99C}"},'43':{n:"Mariposa",i:"\u{1F98B}"},'44':{n:"Chigüire",i:"\u{1F9AB}"},'45':{n:"Garza",i:"\u{1F9A9}"},'46':{n:"Puma",i:"\u{1F408}"},'47':{n:"Pavo Real",i:"\u{1F99A}"},'48':{n:"Puercoespín",i:"\u{1F994}"},'49':{n:"Pereza",i:"\u{1F9A5}"},'50':{n:"Canario",i:"\u{1F424}"},'51':{n:"Pelícano",i:"\u{1F9A4}"},'52':{n:"Pulpo",i:"\u{1F419}"},'53':{n:"Caracol",i:"\u{1F40C}"},'54':{n:"Grillo",i:"\u{1F997}"},'55':{n:"Oso Hormig.",i:"\u{1F9A1}"},'56':{n:"Tiburón",i:"\u{1F988}"},'57':{n:"Pato",i:"\u{1F986}"},'58':{n:"Hormiga",i:"\u{1F41C}"},'59':{n:"Pantera",i:"\u{1F408}\u{200D}\u{2B1B}"},'60':{n:"Camaleón",i:"\u{1F98E}"},'61':{n:"Panda",i:"\u{1F43C}"},'62':{n:"Cachicamo",i:"\u{1F993}"},'63':{n:"Cangrejo",i:"\u{1F980}"},'64':{n:"Gavilán",i:"\u{1F985}"},'65':{n:"Araña",i:"\u{1F577}"},'66':{n:"Lobo",i:"\u{1F43A}"},'67':{n:"Avestruz",i:"\u{1F426}"},'68':{n:"Jaguar",i:"\u{1F406}"},'69':{n:"Conejo",i:"\u{1F407}"},'70':{n:"Bisonte",i:"\u{1F9AC}"},'71':{n:"Guacamaya",i:"\u{1F99C}"},'72':{n:"Gorila",i:"\u{1F98D}"},'73':{n:"Hipopótamo",i:"\u{1F99B}"},'74':{n:"Turpial",i:"\u{1F426}"},'75':{n:"Guácharo",i:"\u{1F987}"}};

// Estado del juego
let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null;
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "";
let isProcessing = false;
let isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000}; 

// --- FUNCIONES DE UI CONECTADAS AL HTML ---

// Esta función maneja los botones grandes del menú
window.switchMode = function(mode) {
    document.getElementById('game-selector').style.display = 'none';
    if(mode === 'bingo') {
        document.getElementById('section-bingo').style.display = 'block';
        document.getElementById('section-animalitos').style.display = 'none';
    } else {
        document.getElementById('section-bingo').style.display = 'none';
        document.getElementById('section-animalitos').style.display = 'block';
        updateGameDate(); // Asegura tener la fecha al entrar
    }
}

// Función para seleccionar lotería
window.selectLottery = function(name, limit) {
    // Resetear modos especiales
    isTripletaMode = false;
    isDupletaMode = false;
    document.getElementById('tripleta-banner').classList.add('hidden');
    document.getElementById('dupleta-banner').classList.add('hidden');
    
    // UI Visual
    document.querySelectorAll('.lottery-btn').forEach(btn => btn.classList.remove('lottery-selected'));
    
    // Identificar botón presionado (lógica simplificada por nombre)
    const idMap = {
        'Lotto Activo': 'btn-lotto-activo',
        'La Granjita': 'btn-la-granjita',
        'Ruleta Activa': 'btn-ruleta-activa',
        'Mega Animal 40': 'btn-mega-animal-40',
        'Selva Plus': 'btn-selva-plus',
        'El Guacharo': 'btn-el-guacharo',
        'Lotto Rey': 'btn-lotto-rey'
    };
    if(idMap[name]) document.getElementById(idMap[name]).classList.add('lottery-selected');

    selectedLotto = name;
    document.getElementById('selected-lottery-title').textContent = `JUGANDO: ${name.toUpperCase()}`;
    document.getElementById('animalitos-game-area').style.display = 'block';
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    
    // Generar horas y grilla (Simulado, necesitas tu función renderLottoGrid real aquí)
    renderTimeOptions(name); 
    renderLottoGrid(name === 'El Guacharo' ? 75 : 36); 
    selectedLottoAnimals.clear();
    updateModeUI();
}

window.toggleTripletaMode = function() {
    isTripletaMode = !isTripletaMode;
    isDupletaMode = false;
    document.getElementById('tripleta-banner').classList.toggle('hidden', !isTripletaMode);
    document.getElementById('dupleta-banner').classList.add('hidden');
    document.getElementById('animalitos-game-area').style.display = 'block';
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    
    if(isTripletaMode) {
        selectedLotto = "Tripleta";
        document.getElementById('selected-lottery-title').textContent = "JUGANDO: TRIPLETA MULTI-LOTERÍA";
        renderLottoGrid(36); // Tripleta usa lotto activo base (0-36)
        renderTimeOptions('Tripleta');
    }
    selectedLottoAnimals.clear();
    updateModeUI();
}

window.toggleDupletaMode = function() {
    isDupletaMode = !isDupletaMode;
    isTripletaMode = false;
    document.getElementById('dupleta-banner').classList.toggle('hidden', !isDupletaMode);
    document.getElementById('tripleta-banner').classList.add('hidden');
    document.getElementById('animalitos-game-area').style.display = 'block';
    document.getElementById('animalitos-game-area').classList.remove('hidden');

    if(isDupletaMode) {
        selectedLotto = "Dupleta";
        document.getElementById('selected-lottery-title').textContent = "JUGANDO: DUPLETA (3 Loterías)";
        renderLottoGrid(36);
        renderTimeOptions('Dupleta');
    }
    selectedLottoAnimals.clear();
    updateModeUI();
}

// Lógica de Apuesta (Tu función original, ahora global)
window.placeBet = async function() {
    if(isProcessing) return; 
    isProcessing = true;
    
    // Validaciones básicas de UI
    if(!auth.currentUser) { alert("Debes iniciar sesión"); isProcessing=false; return; }
    
    const time = document.getElementById('lotto-time-select').value;
    // ... (Tu lógica de cálculo de hora y límites se mantiene igual aquí) ...
    // ...
    
    try {
        // Simulación de éxito para probar botón
        alert(`Procesando apuesta para: ${selectedLotto} a las ${time}`);
        // Aquí iría tu lógica completa de Firebase transaction...
        
    } catch(e) {
        alert(e.message);
    } finally {
        isProcessing = false;
    }
};

// --- FUNCIONES AUXILIARES NECESARIAS ---

function renderTimeOptions(lottoName) {
    // Generador simple de horas para que el select no esté vacío
    const select = document.getElementById('lotto-time-select');
    select.innerHTML = '';
    const hours = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
    hours.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        select.appendChild(opt);
    });
}

function renderLottoGrid(max) {
    const grid = document.getElementById('lotto-animal-grid');
    grid.innerHTML = '';
    // Usamos el mapa global ANIMAL_MAP_LOTTO
    for(let i=0; i<=max; i++) {
        let key = i.toString();
        // Ajuste para 0 y 00
        if(i===37 && max===36) key='0'; 
        if(i===38 && max===36) key='00';
        
        // Si es iteración normal 0-36
        if(max === 36 && i === 0) key = '0';
        // (Nota: Esta lógica de loop debe ajustarse a tus datos exactos, 
        // pero esto hará que se generen botones clicables)
        
        const btn = document.createElement('div');
        btn.className = 'select-animal-btn';
        if(ANIMAL_MAP_LOTTO[key]) {
            btn.innerHTML = `<span class="emoji-font">${ANIMAL_MAP_LOTTO[key].i}</span><span>${key}</span>`;
            btn.onclick = () => toggleAnimalSelection(key, btn);
            grid.appendChild(btn);
        }
    }
    // Agregar 0 y 00 manualmente si es standard
    if(max === 36) {
        ['0', '00'].forEach(k => {
             const btn = document.createElement('div');
            btn.className = 'select-animal-btn';
            btn.innerHTML = `<span class="emoji-font">${ANIMAL_MAP_LOTTO[k].i}</span><span>${k}</span>`;
            btn.onclick = () => toggleAnimalSelection(k, btn);
            grid.appendChild(btn);
        });
    }
}

function toggleAnimalSelection(animalKey, btnElement) {
    if(selectedLottoAnimals.has(animalKey)) {
        selectedLottoAnimals.delete(animalKey);
        btnElement.classList.remove('selected');
    } else {
        // Validar límites según modo
        if(isTripletaMode && selectedLottoAnimals.size >= 3) return alert("Máximo 3 para tripleta");
        if(isDupletaMode && selectedLottoAnimals.size >= 2) return alert("Máximo 2 para dupleta");
        
        selectedLottoAnimals.add(animalKey);
        btnElement.classList.add('selected');
    }
    updateModeUI();
}

function updateModeUI() {
    // Actualizar texto del botón Jugar
    const btn = document.getElementById('lotto-play-btn');
    const amount = document.getElementById('lotto-amount').value || 0;
    
    if(isTripletaMode) {
        document.getElementById('amount-input-container').style.display = 'none'; // Precio fijo
        document.getElementById('lotto-total-display').textContent = `Total: ${tripletaConfig.cost} Bs`;
    } else if(isDupletaMode) {
        document.getElementById('amount-input-container').style.display = 'none'; // Precio fijo
        document.getElementById('lotto-total-display').textContent = `Total: ${dupletaConfig.cost} Bs`;
    } else {
        document.getElementById('amount-input-container').style.display = 'block';
        const total = amount * selectedLottoAnimals.size;
        document.getElementById('lotto-total-display').textContent = `Total: ${total} Bs`;
    }
}

// Modales
window.openTripletaModal = function() { document.getElementById('modal-tripletas').style.display = 'flex'; }
window.openDupletaModal = function() { document.getElementById('modal-dupletas').style.display = 'flex'; }
window.loadMyBingoHistory = function() { alert("Cargando historial..."); }


// --- INICIALIZACIÓN ---
window.onload = function() {
    auth.onAuthStateChanged(u => { 
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
    
    // Listeners de Formularios
    const authForm = document.getElementById('auth-form');
    if(authForm) authForm.onsubmit = async(e)=>{
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

    // Toggle Registro/Login
    document.getElementById('toggle-auth-mode').onclick=()=>{
        const n=document.getElementById('auth-name'); 
        n.classList.toggle('hidden'); 
        document.getElementById('auth-title').textContent=n.classList.contains('hidden')?'Iniciar Sesión':'Registro'; 
        document.getElementById('auth-submit-btn').textContent=n.classList.contains('hidden')?'Acceder':'Registrarme';
    };
    
    // Listener Configuración
    db.ref('config/tripleta').on('value', s => { if(s.exists()) tripletaConfig = s.val(); });
    db.ref('config/dupleta').on('value', s => { if(s.exists()) dupletaConfig = s.val(); });
};

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{
        userBalance=s.val()||0; 
        document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;
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
}
