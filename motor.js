// --- CONFIGURACIÓN Y ESTADO ---
const firebaseConfig = { apiKey: "AIzaSyDVPFhi9Vwk5DRhMOVqHPArppe-1gG1Gbw", authDomain: "bingo-nuevo.firebaseapp.com", databaseURL: "https://bingo-nuevo-default-rtdb.firebaseio.com", projectId: "bingo-nuevo", storageBucket: "bingo-nuevo-firebasestorage.app", messagingSenderId: "519445444132", appId: "1:519445444132:web:1dd8327222a6472f654ab1" };
firebase.initializeApp(firebaseConfig); 
const auth = firebase.auth(); const db = firebase.database();

let userBalance = 0, serverTimeOffset = 0;
let currentDateStr = ""; // Fecha seleccionada actualmente para el historial
let realTodayStr = "";   // Fecha real de hoy para jugadas nuevas
let dailyResults = {};

window.onload = () => {
    auth.onAuthStateChanged(u => { 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { 
            document.getElementById('logged-in-area').classList.remove('hidden'); 
            init(); 
        } 
    });
    
    // Auth logic
    document.getElementById('auth-form').onsubmit = async(e) => {
        e.preventDefault();
        const p = document.getElementById('auth-phone').value.replace(/\D/g,'');
        const pw = document.getElementById('auth-password').value;
        const n = document.getElementById('auth-name').value;
        const email = p + "@bingotexier.com";
        try {
            if(!document.getElementById('auth-name').classList.contains('hidden')){
                const u = await auth.createUserWithEmailAndPassword(email, pw);
                await u.user.updateProfile({displayName: n});
                await db.ref(`users/${u.user.uid}`).set({name: n, phone: p, balance: 0});
            } else await auth.signInWithEmailAndPassword(email, pw);
        } catch(e) { alert(e.message); }
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
    
    // Establecer fecha de hoy
    const now = new Date(Date.now() + serverTimeOffset);
    if(now.getHours() >= 20) now.setDate(now.getDate() + 1);
    realTodayStr = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;
    
    // Por defecto el historial muestra hoy
    currentDateStr = realTodayStr;
    
    renderDatePagination();
    loadMyDailyBets();
}

// --- PAGINACIÓN POR BOTONES ---
function renderDatePagination() {
    const container = document.getElementById('user-date-pagination');
    if(!container) return;
    container.innerHTML = '';

    // Mostramos Hoy, Ayer y Anteayer
    for (let i = 0; i < 3; i++) {
        const d = new Date(Date.now() + serverTimeOffset);
        if (new Date().getHours() >= 20) d.setDate(d.getDate() + 1);
        d.setDate(d.getDate() - i);
        
        const dayStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        const label = i === 0 ? "Hoy" : (i === 1 ? "Ayer" : dayStr.split('-').slice(0,2).join('/'));

        const btn = document.createElement('button');
        // El botón activo tiene fondo indigo, el resto blanco
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

function loadMyDailyBets() {
    if(!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const list = document.getElementById('my-bets-list');
    list.innerHTML = '<p class="text-center text-gray-400 text-[10px] py-4">Buscando jugadas...</p>';

    // Primero obtenemos los resultados de ese día para mostrar si ganó
    db.ref(`results_log/${currentDateStr}`).once('value', resSnap => {
        const results = resSnap.val() || {};
        
        // Luego cargamos los tickets del usuario
        db.ref(`bets_animalitos/${currentDateStr}/${uid}`).on('value', s => {
            const data = s.val();
            list.innerHTML = '';
            
            if(!data) {
                list.innerHTML = `<p class="text-center text-gray-400 text-[10px] py-6 italic">No tienes tickets para el día ${currentDateStr.replace(/-/g,'/')}</p>`;
                return;
            }

            Object.entries(data).reverse().forEach(([key, b]) => {
                const sk = b.time.replace(/:/g, '-').replace(/\./g, '');
                const winAnimal = (results[b.lottery] || {})[sk];
                
                let cardColor = "bg-white border-gray-100";
                let statusIcon = '<i class="fas fa-clock text-gray-400"></i>';
                let statusText = "Pendiente";

                if(b.status === 'WIN') {
                    cardColor = "bg-green-50 border-green-200 ring-1 ring-green-100";
                    statusIcon = '<i class="fas fa-check-circle text-green-600"></i>';
                    statusText = "¡GANASTE!";
                } else if(b.status === 'LOST') {
                    statusIcon = '<i class="fas fa-times-circle text-red-400"></i>';
                    statusText = "No acertado";
                }

                const card = document.createElement('div');
                card.className = `${cardColor} p-3 rounded-xl border shadow-sm flex justify-between items-center transition-all`;
                card.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-700 border">#${b.animal}</div>
                        <div>
                            <div class="font-black text-indigo-900 text-xs">${b.lottery}</div>
                            <div class="text-[9px] text-gray-500 font-bold">${b.time}</div>
                            <div class="text-[10px] mt-1 flex items-center gap-1">${statusIcon} <span class="${b.status === 'WIN' ? 'text-green-700 font-bold' : 'text-gray-500'}">${statusText}</span></div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-black text-gray-800 text-sm">${b.amount} Bs</div>
                        <div class="text-[9px] bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-1">
                            Res: ${winAnimal ? '#' + winAnimal : '--'}
                        </div>
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
