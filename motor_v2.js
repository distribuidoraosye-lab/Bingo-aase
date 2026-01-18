// --- DATOS Y CONFIGURACIÓN ---
const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"},'26':{n:"Vaca",i:"\u{1F404}"},'27':{n:"Perro",i:"\u{1F415}"},'28':{n:"Zamuro",i:"\u{1F985}"},'29':{n:"Elefante",i:"\u{1F418}"},'30':{n:"Caimán",i:"\u{1F40A}"},'31':{n:"Lapa",i:"\u{1F9AB}"},'32':{n:"Ardilla",i:"\u{1F43F}"},'33':{n:"Pescado",i:"\u{1F41F}"},'34':{n:"Venado",i:"\u{1F98C}"},'35':{n:"Jirafa",i:"\u{1F992}"},'36':{n:"Culebra",i:"\u{1F40D}"},'37':{n:"Tortuga",i:"\u{1F422}"},'38':{n:"Búfalo",i:"\u{1F403}"},'39':{n:"Lechuza",i:"\u{1F989}"},'40':{n:"Avispa",i:"\u{1F41D}"},'41':{n:"Canguro",i:"\u{1F998}"},'42':{n:"Tucán",i:"\u{1F99C}"},'43':{n:"Mariposa",i:"\u{1F98B}"},'44':{n:"Chigüire",i:"\u{1F9AB}"},'45':{n:"Garza",i:"\u{1F9A9}"},'46':{n:"Puma",i:"\u{1F408}"},'47':{n:"Pavo Real",i:"\u{1F99A}"},'48':{n:"Puercoespín",i:"\u{1F994}"},'49':{n:"Pereza",i:"\u{1F9A5}"},'50':{n:"Canario",i:"\u{1F424}"},'51':{n:"Pelícano",i:"\u{1F9A4}"},'52':{n:"Pulpo",i:"\u{1F419}"},'53':{n:"Caracol",i:"\u{1F40C}"},'54':{n:"Grillo",i:"\u{1F997}"},'55':{n:"Oso Hormig.",i:"\u{1F9A1}"},'56':{n:"Tiburón",i:"\u{1F988}"},'57':{n:"Pato",i:"\u{1F986}"},'58':{n:"Hormiga",i:"\u{1F41C}"},'59':{n:"Pantera",i:"\u{1F408}\u{200D}\u{2B1B}"},'60':{n:"Camaleón",i:"\u{1F98E}"},'61':{n:"Panda",i:"\u{1F43C}"},'62':{n:"Cachicamo",i:"\u{1F993}"},'63':{n:"Cangrejo",i:"\u{1F980}"},'64':{n:"Gavilán",i:"\u{1F985}"},'65':{n:"Araña",i:"\u{1F577}"},'66':{n:"Lobo",i:"\u{1F43A}"},'67':{n:"Avestruz",i:"\u{1F426}"},'68':{n:"Jaguar",i:"\u{1F406}"},'69':{n:"Conejo",i:"\u{1F407}"},'70':{n:"Bisonte",i:"\u{1F9AC}"},'71':{n:"Guacamaya",i:"\u{1F99C}"},'72':{n:"Gorila",i:"\u{1F98D}"},'73':{n:"Hipopótamo",i:"\u{1F99B}"},'74':{n:"Turpial",i:"\u{1F426}"},'75':{n:"Guácharo",i:"\u{1F987}"}};

const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };
firebase.initializeApp(firebaseConfig); const auth = firebase.auth(); const db = firebase.database();

let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDate=null, globalLimit=0, totalSold=0;
let purchaseState = {totalQty:0, currentCardIndex:0, draftCards:[]}, currentSelection=new Set();
let selectedLotto=null, selectedLottoAnimals = new Set();
let currentDateStr = "", currentLimits = { general: 700, guacharo: 350 };
let isProcessing = false;
let activeAnimalitosRef=null, activeTripletasRef=null, isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000}, activeDupletasRef=null, dailyResults={}; 

window.onload=()=>{
    auth.onAuthStateChanged(u=>{ 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { document.getElementById('logged-in-area').classList.remove('hidden'); document.getElementById('logged-in-area').style.display='block'; document.getElementById('nav-logout-btn').classList.remove('hidden'); init(); } 
        else { document.getElementById('logged-in-area').classList.add('hidden'); document.getElementById('logged-in-area').style.display='none'; document.getElementById('nav-logout-btn').classList.add('hidden'); }
    });
    
    document.getElementById('auth-form').onsubmit=async(e)=>{e.preventDefault(); const p=document.getElementById('auth-phone').value.replace(/\D/g,''), pw=document.getElementById('auth-password').value, n=document.getElementById('auth-name').value; const email = p+"@bingotexier.com"; try { if(!document.getElementById('auth-name').classList.contains('hidden')){const u=await auth.createUserWithEmailAndPassword(email,pw); await u.user.updateProfile({displayName:n}); await db.ref(`users/${u.user.uid}`).set({name:n, phone:p, balance:0});} else await auth.signInWithEmailAndPassword(email,pw); } catch(e){ document.getElementById('auth-error').textContent=e.message; document.getElementById('auth-error').classList.remove('hidden'); }};
    document.getElementById('toggle-auth-mode').onclick=()=>{const n=document.getElementById('auth-name'); n.classList.toggle('hidden'); document.getElementById('auth-title').textContent=n.classList.contains('hidden')?'Iniciar Sesión':'Registro'; document.getElementById('auth-submit-btn').textContent=n.classList.contains('hidden')?'Acceder':'Registrarme';};
    document.getElementById('withdraw-form').onsubmit=async(e)=>{e.preventDefault(); const a=parseFloat(document.getElementById('withdraw-amount').value); if(a>userBalance) return alert("Saldo insuficiente"); const d = {amount:a, tlf:document.getElementById('w-tlf').value, cedula:document.getElementById('w-cedula').value, banco:document.getElementById('w-banco').value, uid:auth.currentUser.uid, name:auth.currentUser.displayName, userPhone:auth.currentUser.email.split('@')[0], status:'PENDING', timestamp:firebase.database.ServerValue.TIMESTAMP}; await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-a); await db.ref(`users/${auth.currentUser.uid}/balance_pending_withdrawal`).transaction(c=>(c||0)+a); await db.ref('withdrawal_requests').push(d); alert("Enviado"); document.getElementById('withdraw-form-area').style.display='none';};
    db.ref('config/tripleta').on('value', s => { if(s.exists()) tripletaConfig = s.val(); });
    db.ref('config/dupleta').on('value', s => { if(s.exists()) dupletaConfig = s.val(); });
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

window.placeBet = async () => {
    if(isProcessing) return; isProcessing = true;
    const time = document.getElementById('lotto-time-select').value;
    
    // CALCULAR EL LÍMITE (10 minutos antes)
    const [hStr, mStr] = time.split(':');
    let [mins, period] = mStr.split(' ');
    let hour = parseInt(hStr);
    if(period === 'PM' && hour < 12) hour += 12;
    if(period === 'AM' && hour === 12) hour = 0;
    
    const drawDate = new Date(Date.now() + serverTimeOffset);
    drawDate.setHours(hour, parseInt(mins), 0, 0);
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
            alert("\u2705 ¡Tripleta Jugada!");
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
            alert("\u2705 ¡Dupleta Jugada!");
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
            alert("\u2705 ¡Ticket Jugado!");
        }
        selectedLottoAnimals.clear();
        updateModeUI();
    } catch(e) {
        alert(e.message);
    } finally {
        isProcessing = false;
    }
};

// ... Resto de funciones (renderLottoGrid, updateModeUI, loadMyDailyBets, etc.) se mantienen igual


