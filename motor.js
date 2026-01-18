// --- CONFIGURACIÓN ---
const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };
firebase.initializeApp(firebaseConfig); 
const auth = firebase.auth(); const db = firebase.database();

let userBalance = 0, serverTimeOffset = 0;
let currentDateStr = ""; // Fecha que el usuario está viendo
let realTodayStr = "";   // Fecha de hoy real
let dailyResults = {};

window.onload = () => {
    auth.onAuthStateChanged(u => { 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { 
            document.getElementById('logged-in-area').classList.remove('hidden'); 
            init(); 
        } 
    });
    
    // Auth logic sencilla respetando tu flujo
    document.getElementById('auth-form').onsubmit = async(e) => {
        e.preventDefault();
        const p = document.getElementById('auth-phone').value.replace(/\D/g,'');
        const pw = document.getElementById('auth-password').value;
        const email = p + "@bingotexier.com";
        try {
            await auth.signInWithEmailAndPassword(email, pw);
        } catch(e) { alert("Error de acceso"); }
    };
};

function init() {
    document.getElementById('user-display-name').textContent = auth.currentUser.displayName;
    db.ref(`users/${auth.currentUser.uid}/balance`).on('value', s => {
        userBalance = s.val() || 0;
        document.getElementById('balance-display').textContent = `Bs ${userBalance.toFixed(2)}`;
    });
    syncTime();
}

async function syncTime() {
    try {
        const r = await fetch('https://worldtimeapi.org/api/timezone/America/Caracas');
        const d = await r.json();
        serverTimeOffset = new Date(d.datetime).getTime() - Date.now();
    } catch(e) {}
    updateGameDate();
}

function updateGameDate() {
    const now = new Date(Date.now() + serverTimeOffset);
    if(now.getHours() >= 20) now.setDate(now.getDate() + 1);
    realTodayStr = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;
    
    // Inicializar el historial en HOY
    currentDateStr = realTodayStr;
    
    // Lanzar componentes de historial
    renderDatePagination();
    loadMyDailyBets();
}

// --- NUEVA FUNCIÓN: BOTONES DE DÍA ---
function renderDatePagination() {
    const container = document.getElementById('user-date-pagination');
    if(!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const d = new Date(Date.now() + serverTimeOffset);
        if (new Date().getHours() >= 20) d.setDate(d.getDate() + 1);
        d.setDate(d.getDate() - i);
        
        const dayStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        const label = i === 0 ? "Hoy" : (i === 1 ? "Ayer" : dayStr.split('-').slice(0,2).join('/'));

        const btn = document.createElement('button');
        // Usamos tus colores de Tailwind (Indigo-600)
        btn.className = `flex-shrink-0 px-4 py-1 rounded-full text-[10px] font-bold transition-all border-2 ${currentDateStr === dayStr ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 shadow-sm'}`;
        btn.textContent = label;
        btn.onclick = () => {
            currentDateStr = dayStr;
            renderDatePagination(); 
            loadMyDailyBets();      
        };
        container.appendChild(btn);
    }
}

// --- NUEVA FUNCIÓN: CARGAR JUGADAS POR FECHA ---
function loadMyDailyBets() {
    if(!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const list = document.getElementById('my-bets-list');
    list.innerHTML = '<p class="text-center text-gray-400 text-[10px] py-4">Cargando...</p>';

    // Obtenemos resultados del día seleccionado
    db.ref(`results_log/${currentDateStr}`).once('value', resSnap => {
        const results = resSnap.val() || {};
        
        // Obtenemos los tickets del usuario para ese día específico
        db.ref(`bets_animalitos/${currentDateStr}/${uid}`).on('value', s => {
            const data = s.val();
            list.innerHTML = '';
            
            if(!data) {
                list.innerHTML = `<p class="text-center text-gray-400 text-[10px] py-6 italic">Sin jugadas para esta fecha.</p>`;
                return;
            }

            Object.entries(data).reverse().forEach(([key, b]) => {
                const sk = b.time.replace(/:/g, '-').replace(/\./g, '');
                const res = (results[b.lottery] || {})[sk];
                
                // Determinamos el estado visual respetando tus estilos
                let statusInfo = '<span class="text-gray-400">Pendiente</span>';
                let bgColor = "bg-white border-gray-100";
                
                if(b.status === 'WIN') {
                    statusInfo = '<b class="text-green-600 uppercase">¡Ganaste!</b>';
                    bgColor = "bg-green-50 border-green-200";
                } else if(b.status === 'LOST') {
                    statusInfo = '<span class="text-red-400">No acertado</span>';
                }

                const card = document.createElement('div');
                card.className = `${bgColor} p-3 rounded-xl border shadow-sm flex justify-between items-center`;
                card.innerHTML = `
                    <div>
                        <div class="font-black text-indigo-900 text-xs">${b.lottery} <span class="text-[9px] text-gray-400 font-normal">${b.time}</span></div>
                        <div class="text-[10px] mt-1">${statusInfo} - Animal: <b>#${b.animal}</b></div>
                    </div>
                    <div class="text-right">
                        <div class="font-black text-gray-800 text-sm">${b.amount} Bs</div>
                        <div class="text-[9px] bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">Res: ${res ? '#'+res : '--'}</div>
                    </div>
                `;
                list.appendChild(card);
            });
        });
    });
}

function switchMode(mode) {
    document.getElementById('game-selector').classList.add('hidden');
    document.getElementById(`section-${mode}`).classList.remove('hidden');
}
