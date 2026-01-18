// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

// --- DATOS ---
const ANIMAL_MAP_BINGO={1:{n:"Carnero",i:"\u{1F40F}"},2:{n:"Toro",i:"\u{1F402}"},3:{n:"Ciempiés",i:"\u{1F41B}"},4:{n:"Alacrán",i:"\u{1F982}"},5:{n:"León",i:"\u{1F981}"},6:{n:"Rana",i:"\u{1F438}"},7:{n:"Perico",i:"\u{1F99C}"},8:{n:"Ratón",i:"\u{1F401}"},9:{n:"Águila",i:"\u{1F985}"},10:{n:"Tigre",i:"\u{1F405}"},11:{n:"Gato",i:"\u{1F408}"},12:{n:"Caballo",i:"\u{1F40E}"},13:{n:"Mono",i:"\u{1F412}"},14:{n:"Paloma",i:"\u{1F54A}"},15:{n:"Zorro",i:"\u{1F98A}"},16:{n:"Oso",i:"\u{1F43B}"},17:{n:"Pavo",i:"\u{1F983}"},18:{n:"Burro",i:"\u{1F434}"},19:{n:"Chivo",i:"\u{1F410}"},20:{n:"Cochino",i:"\u{1F416}"},21:{n:"Gallo",i:"\u{1F413}"},22:{n:"Camello",i:"\u{1F42A}"},23:{n:"Cebra",i:"\u{1F993}"},24:{n:"Iguana",i:"\u{1F98E}"},25:{n:"Gallina",i:"\u{1F414}"}};
const ANIMAL_MAP_LOTTO={'0':{n:"Delfín",i:"\u{1F42C}"},'00':{n:"Ballena",i:"\u{1F433}"},'1':{n:"Carnero",i:"\u{1F40F}"},'2':{n:"Toro",i:"\u{1F402}"},'3':{n:"Ciempiés",i:"\u{1F41B}"},'4':{n:"Alacrán",i:"\u{1F982}"},'5':{n:"León",i:"\u{1F981}"},'6':{n:"Rana",i:"\u{1F438}"},'7':{n:"Perico",i:"\u{1F99C}"},'8':{n:"Ratón",i:"\u{1F401}"},'9':{n:"Águila",i:"\u{1F985}"},'10':{n:"Tigre",i:"\u{1F405}"},'11':{n:"Gato",i:"\u{1F408}"},'12':{n:"Caballo",i:"\u{1F40E}"},'13':{n:"Mono",i:"\u{1F412}"},'14':{n:"Paloma",i:"\u{1F54A}"},'15':{n:"Zorro",i:"\u{1F98A}"},'16':{n:"Oso",i:"\u{1F43B}"},'17':{n:"Pavo",i:"\u{1F983}"},'18':{n:"Burro",i:"\u{1F434}"},'19':{n:"Chivo",i:"\u{1F410}"},'20':{n:"Cochino",i:"\u{1F416}"},'21':{n:"Gallo",i:"\u{1F413}"},'22':{n:"Camello",i:"\u{1F42A}"},'23':{n:"Cebra",i:"\u{1F993}"},'24':{n:"Iguana",i:"\u{1F98E}"},'25':{n:"Gallina",i:"\u{1F414}"},'26':{n:"Vaca",i:"\u{1F404}"},'27':{n:"Perro",i:"\u{1F415}"},'28':{n:"Zamuro",i:"\u{1F985}"},'29':{n:"Elefante",i:"\u{1F418}"},'30':{n:"Caimán",i:"\u{1F40A}"},'31':{n:"Lapa",i:"\u{1F9AB}"},'32':{n:"Ardilla",i:"\u{1F43F}"},'33':{n:"Pescado",i:"\u{1F41F}"},'34':{n:"Venado",i:"\u{1F98C}"},'35':{n:"Jirafa",i:"\u{1F992}"},'36':{n:"Culebra",i:"\u{1F40D}"},'37':{n:"Tortuga",i:"\u{1F422}"},'38':{n:"Búfalo",i:"\u{1F403}"},'39':{n:"Lechuza",i:"\u{1F989}"},'40':{n:"Avispa",i:"\u{1F41D}"},'41':{n:"Canguro",i:"\u{1F998}"},'42':{n:"Tucán",i:"\u{1F99C}"},'43':{n:"Mariposa",i:"\u{1F98B}"},'44':{n:"Chigüire",i:"\u{1F9AB}"},'45':{n:"Garza",i:"\u{1F9A9}"},'46':{n:"Puma",i:"\u{1F408}"},'47':{n:"Pavo Real",i:"\u{1F99A}"},'48':{n:"Puercoespín",i:"\u{1F994}"},'49':{n:"Pereza",i:"\u{1F9A5}"},'50':{n:"Canario",i:"\u{1F424}"},'51':{n:"Pelícano",i:"\u{1F9A4}"},'52':{n:"Pulpo",i:"\u{1F419}"},'53':{n:"Caracol",i:"\u{1F40C}"},'54':{n:"Grillo",i:"\u{1F997}"},'55':{n:"Oso Hormig.",i:"\u{1F9A1}"},'56':{n:"Tiburón",i:"\u{1F988}"},'57':{n:"Pato",i:"\u{1F986}"},'58':{n:"Hormiga",i:"\u{1F41C}"},'59':{n:"Pantera",i:"\u{1F408}\u{200D}\u{2B1B}"},'60':{n:"Camaleón",i:"\u{1F98E}"},'61':{n:"Panda",i:"\u{1F43C}"},'62':{n:"Cachicamo",i:"\u{1F993}"},'63':{n:"Cangrejo",i:"\u{1F980}"},'64':{n:"Gavilán",i:"\u{1F985}"},'65':{n:"Araña",i:"\u{1F577}"},'66':{n:"Lobo",i:"\u{1F43A}"},'67':{n:"Avestruz",i:"\u{1F426}"},'68':{n:"Jaguar",i:"\u{1F406}"},'69':{n:"Conejo",i:"\u{1F407}"},'70':{n:"Bisonte",i:"\u{1F9AC}"},'71':{n:"Guacamaya",i:"\u{1F99C}"},'72':{n:"Gorila",i:"\u{1F98D}"},'73':{n:"Hipopótamo",i:"\u{1F99B}"},'74':{n:"Turpial",i:"\u{1F426}"},'75':{n:"Guácharo",i:"\u{1F987}"}};

// VARIABLES ESTADO
let userBalance=0, serverTimeOffset=0, currentCardPrice=0, currentDateStr="";
let selectedLotto=null, selectedLottoAnimals=new Set(), isProcessing=false;
let isTripletaMode=false, tripletaConfig={cost:300,reward:100000};
let isDupletaMode=false, dupletaConfig={cost:300,reward:18000};
let countdownInterval = null;

// --- INICIO ---
window.onload = function() {
    auth.onAuthStateChanged(u => {
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u){
            document.getElementById('logged-in-area').classList.remove('hidden');
            document.getElementById('logged-in-area').style.display='block';
            document.getElementById('nav-logout-btn').classList.remove('hidden');
            init();
        }else{
            document.getElementById('logged-in-area').classList.add('hidden');
            document.getElementById('logged-in-area').style.display='none';
            document.getElementById('nav-logout-btn').classList.add('hidden');
        }
    });

    document.getElementById('auth-form').onsubmit = async(e)=>{
        e.preventDefault();
        const p=document.getElementById('auth-phone').value.replace(/\D/g,'');
        const pw=document.getElementById('auth-password').value;
        const n=document.getElementById('auth-name').value;
        try{
            if(!document.getElementById('auth-name').classList.contains('hidden')){
                const u=await auth.createUserWithEmailAndPassword(p+"@bingotexier.com",pw);
                await u.user.updateProfile({displayName:n});
                await db.ref(`users/${u.user.uid}`).set({name:n, phone:p, balance:0});
            }else await auth.signInWithEmailAndPassword(p+"@bingotexier.com",pw);
        }catch(err){
            document.getElementById('auth-error').textContent="Error de datos";
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
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-a);
        await db.ref('withdrawal_requests').push({
            uid:auth.currentUser.uid, amount:a,
            tlf:document.getElementById('w-tlf').value,
            cedula:document.getElementById('w-cedula').value,
            banco:document.getElementById('w-banco').value,
            status:'PENDING', timestamp:firebase.database.ServerValue.TIMESTAMP
        });
        alert("Enviado"); document.getElementById('withdraw-form-area').style.display='none';
    };

    // BOTÓN COMPRAR BINGO (CORREGIDO PARA REGLAS)
    document.getElementById('start-purchase-btn').onclick = async function(){
        if(isProcessing) return; isProcessing=true;
        try{
            if(!auth.currentUser) throw new Error("Inicia sesión");
            if(userBalance < currentCardPrice) throw new Error("Saldo insuficiente");
            
            // 1. Cobrar
            await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>{
                if((c||0)>=currentCardPrice) return c-currentCardPrice;
                return c; 
            }, (err, committed)=>{
                if(err || !committed) throw new Error("Saldo insuficiente");
            });

            // 2. Generar Cartón
            let card=[]; while(card.length<15){ let n=Math.floor(Math.random()*75)+1; if(!card.includes(n))card.push(n); }
            
            // 3. Guardar en bets_bingo_first (ESTO ES LO QUE PIDE TUS REGLAS)
            if(!currentDateStr) updateGameDate();
            await db.ref(`bets_bingo_first/${currentDateStr}/${auth.currentUser.uid}`).push({
                card: card, timestamp: firebase.database.ServerValue.TIMESTAMP, status:'active'
            });
            
            alert("¡Cartón Comprado!");
            loadMyBingoHistory();
        }catch(e){ alert(e.message); }
        finally{ isProcessing=false; }
    };
};

function init(){
    if(!auth.currentUser) return;
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    
    // Saldo
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value',s=>{
        userBalance=s.val()||0;
        document.getElementById('balance-display').textContent=`Bs ${userBalance.toFixed(2)}`;
    });

    // Precio (Dentro de Auth para pasar reglas)
    db.ref('config/bingo_price').on('value', s=>{
        currentCardPrice = s.val()||50;
        document.getElementById('starter-card-price').textContent = currentCardPrice;
    });

    // Ticker (Barra superior)
    const ticker = document.getElementById('ticker-content');
    if(ticker && ticker.innerHTML === "") {
        ticker.innerHTML = '<div class="ticker__item">🚀 ¡Bienvenido a BingoTexier!</div><div class="ticker__item">💰 Recargas al instante</div>';
    }

    // Configuración Tripleta/Dupleta
    db.ref('config/tripleta').on('value', s=>{ if(s.exists()) tripletaConfig=s.val(); });
    db.ref('config/dupleta').on('value', s=>{ if(s.exists()) dupletaConfig=s.val(); });

    syncTime();
    updateGameDate();
    startClock(); // Iniciar reloj
}

async function syncTime(){ try{const r=await fetch('https://worldtimeapi.org/api/timezone/America/Caracas');const d=await r.json();serverTimeOffset=new Date(d.datetime).getTime()-Date.now();}catch(e){} updateGameDate(); }

function updateGameDate(){
    const now=new Date(Date.now()+serverTimeOffset);
    if(now.getHours()>=20) now.setDate(now.getDate()+1);
    currentDateStr=`${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;
    if(document.getElementById('game-date-display')) document.getElementById('game-date-display').textContent=currentDateStr;
    loadMyDailyBets();
    loadMyBingoHistory();
}

function startClock() {
    if(countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        // Simulación de sorteo a las 8PM (puedes cambiarlo a leer de DB)
        const now = new Date(Date.now() + serverTimeOffset);
        let target = new Date(now);
        target.setHours(20, 0, 0, 0); // 8:00 PM
        if(now > target) target.setDate(target.getDate() + 1);
        
        let diff = target - now;
        let h = Math.floor(diff / 3600000);
        let m = Math.floor((diff % 3600000) / 60000);
        let s = Math.floor((diff % 60000) / 1000);
        
        const el = document.getElementById('countdown-timer');
        if(el) el.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }, 1000);
}

// --- FUNCIONES UI ---
window.switchMode=function(m){
    document.getElementById('game-selector').style.display='none';
    document.getElementById('section-bingo').style.display=m=='bingo'?'block':'none';
    document.getElementById('section-animalitos').style.display=m=='animalitos'?'block':'none';
    if(m=='animalitos') loadMyDailyBets();
    if(m=='bingo') loadMyBingoHistory();
}

window.selectLottery=function(n){
    isTripletaMode=false; isDupletaMode=false; selectedLotto=n;
    document.getElementById('tripleta-banner').classList.add('hidden');
    document.getElementById('dupleta-banner').classList.add('hidden');
    document.querySelectorAll('.lottery-btn').forEach(b=>b.classList.remove('lottery-selected'));
    
    // Mapeo ID para selección visual
    const id = 'btn-'+n.toLowerCase().replace(/ /g,'-');
    const el = document.getElementById(id);
    if(el) el.classList.add('lottery-selected');
    
    document.getElementById('selected-lottery-title').textContent=`JUGANDO: ${n.toUpperCase()}`;
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    document.getElementById('animalitos-game-area').style.display='block';
    
    renderLottoGrid(n=='El Guacharo'?75:36); renderTimeOptions();
    selectedLottoAnimals.clear(); updateModeUI();
}

window.toggleTripletaMode=function(){
    isTripletaMode=!isTripletaMode; isDupletaMode=false;
    document.getElementById('tripleta-banner').classList.toggle('hidden',!isTripletaMode);
    document.getElementById('dupleta-banner').classList.add('hidden');
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    document.getElementById('animalitos-game-area').style.display='block';
    if(isTripletaMode){ selectedLotto="Tripleta"; document.getElementById('selected-lottery-title').textContent="TRIPLETA"; renderLottoGrid(36); renderTimeOptions(); }
    selectedLottoAnimals.clear(); updateModeUI();
}

window.toggleDupletaMode=function(){
    isDupletaMode=!isDupletaMode; isTripletaMode=false;
    document.getElementById('dupleta-banner').classList.toggle('hidden',!isDupletaMode);
    document.getElementById('tripleta-banner').classList.add('hidden');
    document.getElementById('animalitos-game-area').classList.remove('hidden');
    document.getElementById('animalitos-game-area').style.display='block';
    if(isDupletaMode){ selectedLotto="Dupleta"; document.getElementById('selected-lottery-title').textContent="DUPLETA"; renderLottoGrid(36); renderTimeOptions(); }
    selectedLottoAnimals.clear(); updateModeUI();
}

window.placeBet = async function(){
    if(isProcessing) return; isProcessing=true;
    if(!auth.currentUser) {alert("Inicia sesión"); isProcessing=false; return;}
    
    try{
        let cost=0;
        let amt = parseFloat(document.getElementById('lotto-amount').value);
        
        if(isTripletaMode){
            if(selectedLottoAnimals.size!==3) throw new Error("Elige 3 animales");
            cost = tripletaConfig.cost;
        }else if(isDupletaMode){
            if(selectedLottoAnimals.size!==2) throw new Error("Elige 2 animales");
            cost = dupletaConfig.cost;
        }else{
            if(!amt || amt<1) throw new Error("Monto inválido");
            cost = amt * selectedLottoAnimals.size;
        }
        
        if(userBalance<cost) throw new Error("Saldo insuficiente");
        
        // Cobrar
        await db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c=>(c||0)-cost);
        
        // Guardar
        let path = `bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`;
        if(isTripletaMode) path = `bets_tripletas/${currentDateStr}/${auth.currentUser.uid}`;
        if(isDupletaMode) path = `bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`;
        
        await db.ref(path).push({
            lottery: isTripletaMode?"Tripleta":isDupletaMode?"Dupleta":selectedLotto,
            animals: Array.from(selectedLottoAnimals),
            amount: isTripletaMode||isDupletaMode ? cost : amt,
            time: document.getElementById('lotto-time-select').value,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        alert("¡Jugada realizada!");
        selectedLottoAnimals.clear(); updateModeUI(); loadMyDailyBets();
    }catch(e){alert(e.message);}
    finally{isProcessing=false;}
};

// Renderizadores
function renderTimeOptions(){
    const s=document.getElementById('lotto-time-select'); s.innerHTML='';
    ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'].forEach(h=>{
        let o=document.createElement('option'); o.value=h; o.textContent=h; s.appendChild(o);
    });
}
function renderLottoGrid(max){
    const g=document.getElementById('lotto-animal-grid'); g.innerHTML='';
    let keys=max==36?['0','00']:[]; for(let i=1;i<=max;i++) keys.push(i.toString());
    keys.forEach(k=>{
        if(ANIMAL_MAP_LOTTO[k]){
            let b=document.createElement('div'); b.className='select-animal-btn';
            b.innerHTML=`<span class="emoji-font">${ANIMAL_MAP_LOTTO[k].i}</span>${k}`;
            b.onclick=()=>{
                if(selectedLottoAnimals.has(k)){ selectedLottoAnimals.delete(k); b.classList.remove('selected'); }
                else{
                    if(isTripletaMode && selectedLottoAnimals.size>=3) return alert("Máximo 3");
                    if(isDupletaMode && selectedLottoAnimals.size>=2) return alert("Máximo 2");
                    selectedLottoAnimals.add(k); b.classList.add('selected');
                }
                updateModeUI();
            };
            g.appendChild(b);
        }
    });
}
function updateModeUI(){
    const d=document.getElementById('lotto-total-display');
    const i=document.getElementById('amount-input-container');
    const a=parseFloat(document.getElementById('lotto-amount').value)||0;
    if(isTripletaMode){ i.style.display='none'; d.textContent=`Total: ${tripletaConfig.cost} Bs`; }
    else if(isDupletaMode){ i.style.display='none'; d.textContent=`Total: ${dupletaConfig.cost} Bs`; }
    else{ i.style.display='block'; d.textContent=`Total: ${a*selectedLottoAnimals.size} Bs`; }
}

function loadMyDailyBets(){
    if(!auth.currentUser || !currentDateStr) return;
    const c=document.getElementById('my-bets-list'); c.innerHTML='';
    const render=(s, type)=>{
        if(s.exists()){
            s.forEach(child=>{
                let val=child.val();
                let div=document.createElement('div');
                div.className="bg-white border rounded p-2 mb-1 shadow-sm flex justify-between items-center";
                div.innerHTML=`<div><span class="font-bold text-xs">${val.lottery}</span> <span class="text-xs">(${val.time})</span><br><span class="text-xs text-gray-500">${val.animals}</span></div><div class="font-bold text-green-600 text-sm">${val.amount} Bs</div>`;
                c.appendChild(div);
            });
        }
    };
    db.ref(`bets_animalitos/${currentDateStr}/${auth.currentUser.uid}`).once('value',s=>render(s,'n'));
    db.ref(`bets_tripletas/${currentDateStr}/${auth.currentUser.uid}`).once('value',s=>render(s,'t'));
    db.ref(`bets_dupletas/${currentDateStr}/${auth.currentUser.uid}`).once('value',s=>render(s,'d'));
}

function loadMyBingoHistory(){
    if(!auth.currentUser) return;
    const c=document.getElementById('carton-list'); c.innerHTML='';
    // CORREGIDO: Usar bets_bingo_first que es la ruta permitida
    if(!currentDateStr) updateGameDate();
    db.ref(`bets_bingo_first/${currentDateStr}/${auth.currentUser.uid}`).once('value',s=>{
        if(s.exists()){
            document.getElementById('no-cards-msg').classList.add('hidden');
            s.forEach(child=>{
                let data=child.val();
                let div=document.createElement('div'); div.className='bingo-card';
                // Recuperar dibujo de animales
                let gridHTML = data.card.map(n=>{
                    let emoji = ANIMAL_MAP_BINGO[n] ? ANIMAL_MAP_BINGO[n].i : '';
                    return `<div class="animal-cell flex flex-col"><span class="text-[10px]">${emoji}</span><span class="font-bold">${n}</span></div>`;
                }).join('');
                div.innerHTML=`<div class="animal-grid">${gridHTML}</div>`;
                c.appendChild(div);
            });
            document.getElementById('carton-display-container').classList.remove('hidden');
        }else{
            document.getElementById('no-cards-msg').classList.remove('hidden');
        }
    });
}

window.openTripletaModal = function() { document.getElementById('modal-tripletas').style.display = 'flex'; }
window.openDupletaModal = function() { document.getElementById('modal-dupletas').style.display = 'flex'; }
