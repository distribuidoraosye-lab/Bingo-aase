// --- CONFIGURACIÓN Y VARIABLES ---
// (Tus constantes ANIMAL_MAP, firebaseConfig, etc se mantienen arriba)

// VARIABLES PARA EL SORTEO ANIMADO
let userYTPlayer;
let drawSequence = [];
let allParticipantsData = [];
let syncTimer;

// INICIALIZACIÓN DE FIREBASE Y AUTH
window.onload=()=>{
    auth.onAuthStateChanged(u=>{ 
        document.getElementById('auth-area').classList.toggle('hidden', !!u);
        if(u) { 
            document.getElementById('logged-in-area').classList.remove('hidden'); 
            document.getElementById('logged-in-area').style.display='block'; 
            document.getElementById('nav-logout-btn').classList.remove('hidden'); 
            init(); 
        } 
        else { 
            document.getElementById('logged-in-area').classList.add('hidden'); 
            document.getElementById('logged-in-area').style.display='none'; 
            document.getElementById('nav-logout-btn').classList.add('hidden'); 
        }
    });
    
    // (Tus eventos de auth-form, withdraw-form, etc se mantienen igual)
};

// FUNCIÓN PARA EL MODO DE SORTEO ANIMADO
function initAnimatedDraw() {
    // Escuchar el sorteo activo publicado desde el Admin
    db.ref('sorteo_animado_actual').on('value', snap => {
        if(!snap.exists()) return;
        const data = snap.val();
        drawSequence = data.secuencia;
        
        if(!userYTPlayer && window.YT && window.YT.Player) {
            userYTPlayer = new YT.Player('user-player', {
                height: '100%',
                width: '100%',
                videoId: data.video_id,
                playerVars: { 'autoplay': 1, 'modestbranding': 1, 'rel': 0 },
                events: { 'onStateChange': onPlayerStateChange }
            });
        }
    });

    // Cargar datos de apuestas para el ranking (Usando tu ruta estelar)
    db.ref(`bingo_to_grade/estelar/${currentDateStr}/bets`).on('value', s => {
        if(!s.exists()) return;
        allParticipantsData = Object.values(s.val());
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        syncTimer = setInterval(updateLiveSync, 500);
    } else {
        clearInterval(syncTimer);
    }
}

function updateLiveSync() {
    if(!userYTPlayer || !userYTPlayer.getCurrentTime) return;
    
    const time = userYTPlayer.getCurrentTime();
    const out = drawSequence.filter(s => s.seg <= time);
    const outIds = out.map(s => s.animal.toString());

    if(out.length > 0) {
        const last = out[out.length - 1];
        document.getElementById('live-animal-name').textContent = `#${last.animal} ${last.nombre}`;
    }

    // Calcular Ranking dinámico
    const ranked = allParticipantsData.map(p => {
        const pNums = Array.isArray(p.numbers) ? p.numbers : Object.values(p.numbers || {});
        const hits = pNums.filter(n => outIds.includes(n.toString())).length;
        return { name: p.name, hits: hits };
    }).sort((a,b) => b.hits - a.hits);

    renderLiveRanking(ranked);
}

function renderLiveRanking(list) {
    const container = document.getElementById('live-ranking-list');
    const myName = auth.currentUser ? auth.currentUser.displayName : "";
    
    container.innerHTML = list.slice(0, 6).map((p, i) => {
        const isMe = p.name === myName;
        if(isMe) document.getElementById('live-user-hits').textContent = p.hits;
        
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

// EXTENSIÓN DE SWITCHMODE (Para gestionar la nueva pestaña)
const originalSwitchMode = window.switchMode;
window.switchMode = function(mode) {
    // Limpieza previa
    document.getElementById('section-sorteo-vivo').classList.add('hidden');
    clearInterval(syncTimer);

    if(mode === 'sorteo-vivo') {
        document.getElementById('section-bingo').classList.add('hidden');
        document.getElementById('section-animalitos').classList.add('hidden');
        document.getElementById('section-sorteo-vivo').classList.remove('hidden');
        initAnimatedDraw();
    } else {
        // Ejecutar lógica original de Bingo o Animalitos
        if(originalSwitchMode) originalSwitchMode(mode);
    }
};

// (Tus funciones init, syncTime, placeBet, etc. se mantienen igual en el archivo)
