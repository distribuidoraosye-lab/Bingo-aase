/* ============================================================
   BINGO TEXIER - MÓDULO: JUGADAS GRATIS POR HORA
   Versión: 2.2 (Scroll 100% Nativo Flexbox, Emojis, Reglas Claras)
   + ACTUALIZACIÓN: Registro de Hora Exacta y Edición
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                inyectarInterfazJugadasHora();
                escucharDatosJugadasHora(user);
            }
        });
    }
});

// --- CONSTANTES Y MAPA DE ANIMALITOS INTEGRADO ---
const ANIMAL_MAP_LOTTO_JH = {
    '0':{n:"Delfín",i:"🐬"},'00':{n:"Ballena",i:"🐳"},'1':{n:"Carnero",i:"🐏"},'2':{n:"Toro",i:"🐂"},'3':{n:"Ciempiés",i:"🐛"},'4':{n:"Alacrán",i:"🦂"},'5':{n:"León",i:"🦁"},'6':{n:"Rana",i:"🐸"},'7':{n:"Perico",i:"🦜"},'8':{n:"Ratón",i:"🐁"},'9':{n:"Águila",i:"🦅"},'10':{n:"Tigre",i:"🐅"},'11':{n:"Gato",i:"🐈"},'12':{n:"Caballo",i:"🐎"},'13':{n:"Mono",i:"🐒"},'14':{n:"Paloma",i:"🕊️"},'15':{n:"Zorro",i:"🦊"},'16':{n:"Oso",i:"🐻"},'17':{n:"Pavo",i:"🦃"},'18':{n:"Burro",i:"🐴"},'19':{n:"Chivo",i:"🐐"},'20':{n:"Cochino",i:"🐖"},'21':{n:"Gallo",i:"🐓"},'22':{n:"Camello",i:"🐪"},'23':{n:"Cebra",i:"🦓"},'24':{n:"Iguana",i:"🦎"},'25':{n:"Gallina",i:"🐔"},'26':{n:"Vaca",i:"🐄"},'27':{n:"Perro",i:"🐕"},'28':{n:"Zamuro",i:"🦅"},'29':{n:"Elefante",i:"🐘"},'30':{n:"Caimán",i:"🐊"},'31':{n:"Lapa",i:"🦡"},'32':{n:"Ardilla",i:"🐿️"},'33':{n:"Pescado",i:"🐟"},'34':{n:"Venado",i:"🦌"},'35':{n:"Jirafa",i:"🦒"},'36':{n:"Culebra",i:"🐍"}
};

const HORAS_TORNEO_JH = [
    { label: '01:00 PM', h: 13 }, { label: '02:00 PM', h: 14 },
    { label: '03:00 PM', h: 15 }, { label: '04:00 PM', h: 16 },
    { label: '05:00 PM', h: 17 }, { label: '06:00 PM', h: 18 }
];

let misCartonesCountJH = 0;
let jugadasLocalesJH = {}; 
let jugadasGuardadasJH = {}; 
let slotActivoEdicionJH = null; 

function obtenerFechaTorneoJH() {
    const offset = typeof window.serverTimeOffset !== 'undefined' ? window.serverTimeOffset : 0;
    const now = new Date(Date.now() + offset);
    let torneoDate = new Date(now);
    if(torneoDate.getHours() >= 18) torneoDate.setDate(torneoDate.getDate() + 1);
    return `${String(torneoDate.getDate()).padStart(2,'0')}-${String(torneoDate.getMonth()+1).padStart(2,'0')}-${torneoDate.getFullYear()}`;
}

// --- FUNCIONES DE INTERFAZ Y DATOS ---
function inyectarInterfazJugadasHora() {
    setTimeout(() => {
        const targetArea = document.getElementById('torneo-express-area');
        if (targetArea && !document.getElementById('banner-jugadas-hora')) {
            const bannerHtml = `
                <div id="banner-jugadas-hora" class="mb-4 bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-1 shadow-lg transform transition hover:scale-[1.02] cursor-pointer animate-pulse-fast border-2 border-green-300" onclick="window.abrirPanelJugadasHora()">
                    <div class="bg-black/20 p-3 rounded-lg flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="bg-yellow-400 p-2 rounded-full shadow-inner relative">
                                <i class="fas fa-gift text-green-900 text-xl"></i>
                                <span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                            </div>
                            <div>
                                <h4 class="text-white font-black text-sm tracking-wide leading-tight">JUGADAS GRATIS CADA HORA</h4>
                                <p class="text-[10px] text-green-100 font-bold uppercase mt-0.5">Gana $5 cada vez que aciertes</p>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-white opacity-70"></i>
                    </div>
                </div>
            `;
            targetArea.insertAdjacentHTML('afterbegin', bannerHtml);
        }

        if (!document.getElementById('modal-jugadas-hora')) {
            const modalHtml = `
                <div id="modal-jugadas-hora" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center">
                    <div class="bg-gray-100 w-full max-w-md h-[90vh] md:h-[85vh] rounded-2xl flex flex-col relative overflow-hidden shadow-2xl">
                        
                        <div class="bg-gradient-to-r from-green-600 to-teal-700 p-4 shadow-md z-10 flex justify-between items-center text-white flex-shrink-0">
                            <div>
                                <h3 class="font-black text-lg leading-none"><i class="fas fa-gift mr-1"></i> JUGADAS POR HORA</h3>
                                <p class="text-[10px] text-green-100 font-bold uppercase mt-1">Lotto Activo (1 PM a 6 PM)</p>
                            </div>
                            <button onclick="window.cerrarPanelJugadasHora()" class="text-white hover:text-green-200"><i class="fas fa-times text-2xl"></i></button>
                        </div>
                        
                        <div class="bg-green-50 p-3 border-b border-green-200 text-center z-10 shadow-inner flex-shrink-0">
                            <p class="text-[11px] font-bold text-green-800 leading-tight">
                                <i class="fas fa-info-circle mr-1 text-green-600"></i> Por cada cartón del Torneo Express que juegues, obtienes una jugada GRATIS. Elige qué animal saldrá en Lotto Activo cada hora y <span class="text-green-700 font-black">GANA 5$ CADA VEZ QUE ACIERTES.</span>
                            </p>
                        </div>
                        
                        <div class="bg-white p-3 border-b border-gray-200 shadow-sm z-10 flex justify-between items-center flex-shrink-0">
                            <span class="text-xs font-bold text-gray-500 uppercase">Cartones para el Torneo:</span>
                            <span id="jh-cartones-count" class="bg-green-100 text-green-800 font-black px-3 py-1 rounded border border-green-300 text-sm">0</span>
                        </div>

                        <div id="jh-horas-list" class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-gray-100">
                            <div class="text-center py-10 text-gray-400 text-xs italic">Cargando tus jugadas...</div>
                        </div>

                        <div class="p-4 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20 flex-shrink-0">
                            <button id="btn-guardar-jh" onclick="window.guardarJugadasHora()" class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 text-sm">
                                <i class="fas fa-save mr-2"></i> CONFIRMAR JUGADAS
                            </button>
                        </div>
                    </div>
                </div>

                <div id="modal-selector-animal-jh" class="hidden fixed inset-0 bg-black/80 z- flex items-end justify-center sm:items-center">
                    <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[80vh] shadow-2xl animate-bounce-in">
                        <div class="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h4 class="font-bold text-gray-700 text-sm">Elige para las <span id="lbl-hora-select" class="text-green-600 font-black">--</span></h4>
                            <button onclick="window.cerrarSelectorAnimalJH()" class="text-gray-400 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>
                        </div>
                        <div class="p-2 overflow-y-auto custom-scrollbar flex-1 bg-white">
                            <div id="jh-animal-grid" class="grid grid-cols-4 sm:grid-cols-5 gap-2"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }, 1500);
}

function escucharDatosJugadasHora(user) {
    const uid = user.uid;
    const fechaTorneo = obtenerFechaTorneoJH();
    
    firebase.database().ref(`bets_torneo_express/${fechaTorneo}/${uid}`).on('value', snap => {
        misCartonesCountJH = snap.exists() ? Object.keys(snap.val()).length : 0;
        const countDisplay = document.getElementById('jh-cartones-count');
        if(countDisplay) countDisplay.textContent = misCartonesCountJH;
        
        const modal = document.getElementById('modal-jugadas-hora');
        if (modal && !modal.classList.contains('hidden')) renderizarListaHorasJH();
    });

    firebase.database().ref(`torneo_hourly_picks/${fechaTorneo}/${uid}`).on('value', snap => {
        jugadasGuardadasJH = snap.exists() ? snap.val() : {};
        jugadasLocalesJH = JSON.parse(JSON.stringify(jugadasGuardadasJH));
        
        const modal = document.getElementById('modal-jugadas-hora');
        if (modal && !modal.classList.contains('hidden')) renderizarListaHorasJH();
    });
}

window.abrirPanelJugadasHora = () => {
    document.getElementById('modal-jugadas-hora').classList.remove('hidden');
    renderizarListaHorasJH();
};

window.cerrarPanelJugadasHora = () => {
    document.getElementById('modal-jugadas-hora').classList.add('hidden');
};

function renderizarListaHorasJH() {
    const container = document.getElementById('jh-horas-list');
    container.innerHTML = '';
    const offset = typeof window.serverTimeOffset !== 'undefined' ? window.serverTimeOffset : 0;
    const now = new Date(Date.now() + offset);

    HORAS_TORNEO_JH.forEach(bloque => {
        let limitTime = new Date(now);
        limitTime.setHours(bloque.h - 1, 50, 0, 0); 
        const estaBloqueada = now > limitTime;

        const picksUsuario = jugadasLocalesJH[bloque.label] || [];
        let slotsHtml = '';
        
        const noTieneCartones = misCartonesCountJH === 0;
        const iteraciones = noTieneCartones ? 1 : misCartonesCountJH;
        
        for (let i = 0; i < iteraciones; i++) {
            
            if (noTieneCartones) {
                slotsHtml += `
                    <div onclick="alert('⚠️ Debes comprar al menos un ticket del Torneo Express para poder activar y elegir tu jugada gratis de esta hora.')" class="w-14 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition opacity-80">
                        <i class="fas fa-lock text-gray-400 mb-1"></i>
                        <span class="text-[8px] font-bold text-gray-500 text-center leading-none px-1 uppercase">Activar</span>
                    </div>
                `;
            } else {
                const rawPick = picksUsuario[i]; 
                if (rawPick) {
                    // Extraer el número del animal sea formato viejo (string) o nuevo (objeto con timestamp)
                    const pickNum = typeof rawPick === 'object' ? rawPick.animal : rawPick;
                    const animalInfo = ANIMAL_MAP_LOTTO_JH[pickNum] || {i:'❓', n:'?'};
                    slotsHtml += `
                        <div onclick="window.abrirSelectorAnimalJH('${bloque.label}', ${i}, ${estaBloqueada})" class="w-14 h-16 bg-white border-2 border-green-500 rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-sm relative hover:bg-green-50 transition ${estaBloqueada ? 'opacity-70 grayscale' : ''}">
                            <span class="text-xl">${animalInfo.i}</span>
                            <span class="text-[10px] font-black text-green-700 mt-1">${pickNum}</span>
                            ${estaBloqueada ? '<div class="absolute -top-2 -right-2 bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"><i class="fas fa-lock text-white text-[9px]"></i></div>' : ''}
                        </div>
                    `;
                } else {
                    slotsHtml += `
                        <div onclick="window.abrirSelectorAnimalJH('${bloque.label}', ${i}, ${estaBloqueada})" class="w-14 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition ${estaBloqueada ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}">
                            <i class="fas ${estaBloqueada ? 'fa-lock' : 'fa-plus'} text-gray-400"></i>
                        </div>
                    `;
                }
            }
        }

        let statusBadge = estaBloqueada 
            ? '<span class="bg-gray-200 text-gray-600 text-[9px] font-bold px-2 py-1 rounded"><i class="fas fa-lock mr-1"></i> Cerrado</span>'
            : '<span class="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded"><i class="fas fa-door-open mr-1"></i> Abierto</span>';

        const imgSrc = 'https://bingotexier.com/archivos/imagenes/b619cd4a138baf5860c9c2250f9fe9d78ca2abd3.png';

        container.innerHTML += `
            <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2 relative">
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div class="flex items-center gap-2">
                        <img src="${imgSrc}" class="w-5 h-5 rounded-full shadow-sm">
                        <h4 class="font-black text-gray-700 text-sm">${bloque.label} <span class="text-[10px] text-gray-400 font-bold ml-1 uppercase">Lotto Activo</span></h4>
                    </div>
                    ${statusBadge}
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                    ${slotsHtml}
                </div>
            </div>
        `;
    });
}

window.abrirSelectorAnimalJH = (horaStr, slotIndex, estaBloqueada) => {
    if (estaBloqueada) return alert("⏳ Este sorteo ya cerró (límite: 10 min antes de la hora).");
    
    slotActivoEdicionJH = { hora: horaStr, index: slotIndex };
    document.getElementById('lbl-hora-select').textContent = horaStr;
    
    const grid = document.getElementById('jh-animal-grid');
    grid.innerHTML = '';
    
    const keys = ['0','00', ...Array.from({length:36},(_,i)=>(i+1).toString())];
    keys.forEach(k => {
        const a = ANIMAL_MAP_LOTTO_JH[k] || {n:`Num ${k}`, i:"❓"};
        const btn = document.createElement('button');
        btn.className = "bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center hover:bg-green-100 hover:border-green-400 transition active:scale-95";
        btn.innerHTML = `<span class="text-2xl mb-1">${a.i}</span><span class="text-[10px] font-black text-gray-800">${k}</span><span class="text-[8px] text-gray-500 truncate w-full text-center">${a.n}</span>`;
        
        btn.onclick = () => window.seleccionarAnimalParaSlotJH(k);
        grid.appendChild(btn);
    });

    document.getElementById('modal-selector-animal-jh').classList.remove('hidden');
};

window.seleccionarAnimalParaSlotJH = (animalNum) => {
    if (!slotActivoEdicionJH) return;
    const { hora, index } = slotActivoEdicionJH;
    
    if (!jugadasLocalesJH[hora]) jugadasLocalesJH[hora] = [];
    
    while (jugadasLocalesJH[hora].length <= index) {
        jugadasLocalesJH[hora].push(null);
    }
    
    // Lógica para guardar la hora exacta y detectar si es edición
    const valActual = jugadasLocalesJH[hora][index];
    const nowTs = Date.now();
    let ts = nowTs;
    let et = null;

    if (valActual) {
        if (typeof valActual === 'object') {
            ts = valActual.timestamp || nowTs;
            // Solo marcar como editado si el animal realmente cambió
            if (valActual.animal !== animalNum) {
                et = nowTs;
            } else {
                et = valActual.editTime; // mantener igual si eligió el mismo sin querer
            }
        } else {
            // Era un string viejo (jugada anterior a esta actualización), se editó ahora
            ts = nowTs; 
            et = nowTs; 
        }
    }
    
    // Guardar el objeto completo en lugar del string simple
    jugadasLocalesJH[hora][index] = {
        animal: animalNum,
        timestamp: ts,
        editTime: et
    };
    
    window.cerrarSelectorAnimalJH();
    renderizarListaHorasJH(); 
};

window.guardarJugadasHora = async () => {
    if(misCartonesCountJH === 0) {
        return alert("⚠️ No tienes cartones activos. Compra un ticket del Torneo Express primero.");
    }

    const btn = document.getElementById('btn-guardar-jh');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> GUARDANDO...';
    btn.disabled = true;

    try {
        const uid = firebase.auth().currentUser.uid;
        const fechaTorneo = obtenerFechaTorneoJH();
        const offset = typeof window.serverTimeOffset !== 'undefined' ? window.serverTimeOffset : 0;
        const now = new Date(Date.now() + offset);
        
        let jugadasValidasParaGuardar = {};

        HORAS_TORNEO_JH.forEach(bloque => {
            let limitTime = new Date(now);
            limitTime.setHours(bloque.h - 1, 50, 0, 0); 
            const estaBloqueada = now > limitTime;

            if (!estaBloqueada) {
                const picksLimpios = (jugadasLocalesJH[bloque.label] || []).filter(v => v !== null);
                if (picksLimpios.length > 0) jugadasValidasParaGuardar[bloque.label] = picksLimpios;
            } else {
                if (jugadasGuardadasJH[bloque.label]) jugadasValidasParaGuardar[bloque.label] = jugadasGuardadasJH[bloque.label];
            }
        });

        await firebase.database().ref(`torneo_hourly_picks/${fechaTorneo}/${uid}`).set(jugadasValidasParaGuardar);
        
        btn.innerHTML = '<i class="fas fa-check mr-2"></i> ¡GUARDADO EXITOSO!';
        btn.className = "w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg transition text-sm";
        
        setTimeout(() => {
            window.cerrarPanelJugadasHora();
            btn.innerHTML = '<i class="fas fa-save mr-2"></i> CONFIRMAR JUGADAS';
            btn.className = "w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 text-sm";
            btn.disabled = false;
        }, 1500);

    } catch (e) {
        alert("Error al guardar: " + e.message);
        btn.innerHTML = '<i class="fas fa-save mr-2"></i> REINTENTAR';
        btn.disabled = false;
    }
};
