/* ============================================================
   BINGO TEXIER - MÓDULO RULETA HORA LOCA (V2.0 - INYECCIÓN DINÁMICA)
   Crea la UI y maneja la lógica sin tocar el HTML del servidor.
   ============================================================ */

const dbRuleta = firebase.database();

let horaLocaState = {
    activa: false,
    terminaEn: 0
};

const RULETA_PREMIOS = [
    { id: "jackpot", nombre: "$50 EFECTIVO", maxRNG: 50, tipo: "cash", valor: 50, color: "#eab308" },
    { id: "dia_extra", nombre: "+1 DÍA DE RACHA", maxRNG: 500, tipo: "racha_dia", valor: 1, color: "#10b981" },
    { id: "nivel_3", nombre: "SALTO NIVEL 3", maxRNG: 1500, tipo: "racha_nivel", valor: 3, color: "#8b5cf6" },
    { id: "cartones_10", nombre: "10 CARTONES", maxRNG: 4500, tipo: "free_cards", valor: 10, color: "#3b82f6" },
    { id: "cartones_5", nombre: "5 CARTONES", maxRNG: 10000, tipo: "free_cards", valor: 5, color: "#f97316" }
];

// 1. INYECTAR CSS Y HTML DESDE JAVASCRIPT
function inyectarInterfazRuleta() {
    // A. Inyectar CSS
    const css = `
        @keyframes pulse-rojo { 0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.6); } 50% { box-shadow: 0 0 25px rgba(239,68,68,1); } }
        .anim-pulse-rojo { animation: pulse-rojo 2s infinite; }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

    // B. Inyectar Modal de la Ruleta al final del body
    if (!document.getElementById('modal-ruleta')) {
        const modalHTML = `
        <div id="modal-ruleta" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center" style="display: none;">
            <div class="bg-gradient-to-b from-purple-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] overflow-hidden">
                <h3 class="relative z-10 text-2xl font-black text-yellow-400 mb-1 drop-shadow-md">RULETA TEXIER</h3>
                <p class="relative z-10 text-xs text-purple-200 mb-6 font-bold uppercase tracking-widest">Premio garantizado</p>
                <div class="relative z-10 mx-auto w-48 h-48 mb-6">
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-yellow-400 text-4xl drop-shadow-lg"><i class="fas fa-caret-down"></i></div>
                    <div id="ruleta-rueda" class="w-full h-full rounded-full border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] overflow-hidden relative transition-transform" style="background: conic-gradient(#eab308 0 20%, #10b981 20% 40%, #8b5cf6 40% 60%, #3b82f6 60% 80%, #f97316 80% 100%);">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-12 h-12 bg-black rounded-full border-2 border-yellow-400 z-10 flex items-center justify-center shadow-inner"><i class="fas fa-star text-yellow-400 text-xl"></i></div>
                        </div>
                    </div>
                </div>
                <div id="ruleta-resultado-box" class="relative z-10 hidden bg-black/60 p-4 rounded-xl border border-yellow-500 mb-2">
                    <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">¡Felicidades!</p>
                    <p id="ruleta-premio-texto" class="text-xl font-black text-white"></p>
                </div>
                <button id="btn-cerrar-ruleta" onclick="cerrarRuletaHTML()" class="relative z-10 hidden w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-3 rounded-xl shadow-lg mt-2 transition uppercase text-sm">
                    Reclamar y Continuar
                </button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // C. Inyectar Banner de Hora Loca en el Dashboard
    const checkDashboard = setInterval(() => {
        const area = document.getElementById('logged-in-area');
        if (area && !document.getElementById('hora-loca-banner')) {
            const bannerHTML = `
            <div id="hora-loca-banner" class="hidden mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 p-3 rounded-xl border-2 border-yellow-300 anim-pulse-rojo text-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/20"></div>
                <h3 class="relative z-10 text-white font-black text-lg tracking-widest"><i class="fas fa-fire mr-2"></i>¡HORA LOCA ACTIVADA!</h3>
                <p class="relative z-10 text-yellow-100 text-xs font-bold mt-1">Compra un cartón AHORA y gira la ruleta. <span id="hora-loca-timer" class="font-mono text-sm bg-black/40 px-2 py-0.5 rounded ml-1"></span></p>
            </div>`;
            area.insertAdjacentHTML('afterbegin', bannerHTML);
            clearInterval(checkDashboard);
            renderBannerHoraLoca(); // Actualizar visibilidad
        }
    }, 500);
}

// 2. ESCUCHAR AL ADMIN EN TIEMPO REAL
function initRuletaListener() {
    inyectarInterfazRuleta();

    dbRuleta.ref('config/hora_loca').on('value', snap => {
        const config = snap.val();
        if (config) {
            horaLocaState.activa = config.activa === true;
            horaLocaState.terminaEn = config.terminaEn || 0;
            renderBannerHoraLoca();
        } else {
            horaLocaState.activa = false;
            renderBannerHoraLoca();
        }
    });
    
    interceptarCompras();
}

// 3. ACTUALIZAR VISTA DEL BANNER
function renderBannerHoraLoca() {
    const banner = document.getElementById('hora-loca-banner');
    if (!banner) return;
    if (horaLocaState.activa) {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

// 4. INTERCEPTORES DE COMPRA (BINGO Y TORNEO EXPRESS)
function interceptarCompras() {
    // Interceptar Compra de Bingo
    const originalConfirmarBingo = window.confirmCurrentCard;
    if (typeof originalConfirmarBingo === 'function' && !window.bingoInterceptado) {
        window.confirmCurrentCard = async function() {
            await originalConfirmarBingo.apply(this, arguments);
            if (horaLocaState.activa) {
                setTimeout(() => {
                    const modalExito = document.getElementById('purchase-success-modal');
                    if (modalExito) modalExito.style.display = 'none';
                    iniciarGiroRuleta('bingo');
                }, 1000);
            }
        };
        window.bingoInterceptado = true;
    }

    // Interceptar Compra de Torneo
    const originalConfirmarTorneo = window.confirmTorneoPurchase;
    if (typeof originalConfirmarTorneo === 'function' && !window.torneoInterceptado) {
        window.confirmTorneoPurchase = async function() {
            await originalConfirmarTorneo.apply(this, arguments);
            if (horaLocaState.activa) {
                setTimeout(() => { iniciarGiroRuleta('torneo'); }, 1500);
            }
        };
        window.torneoInterceptado = true;
    }
}

// 5. MOTOR VISUAL Y LÓGICO DE LA RULETA
window.cerrarRuletaHTML = function() {
    document.getElementById('modal-ruleta').style.display = 'none';
    location.reload();
}

function iniciarGiroRuleta(origen) {
    const modal = document.getElementById('modal-ruleta');
    const box = document.getElementById('ruleta-resultado-box');
    const btn = document.getElementById('btn-cerrar-ruleta');
    const rueda = document.getElementById('ruleta-rueda');
    
    modal.style.display = 'flex';
    box.classList.add('hidden');
    btn.classList.add('hidden');
    rueda.style.transform = 'rotate(0deg)';
    rueda.style.transition = 'none';
    rueda.offsetHeight; // Forzar redibujado

    const rng = Math.floor(Math.random() * 10000) + 1;
    let premioGanado = RULETA_PREMIOS; // Default

    for (let i = 0; i < RULETA_PREMIOS.length; i++) {
        if (rng <= RULETA_PREMIOS[i].maxRNG) {
            premioGanado = RULETA_PREMIOS[i];
            break;
        }
    }

    // Animar
    rueda.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.15, 1)';
    const rotacionTotal = (5 * 360) + Math.floor(Math.random() * 360);
    rueda.style.transform = `rotate(${rotacionTotal}deg)`;

    setTimeout(() => {
        aplicarPremio(premioGanado);
    }, 4000);
}

// 6. APLICAR PREMIOS A FIREBASE
async function aplicarPremio(premio) {
    const user = firebase.auth().currentUser;
    if(!user) return;
    const uid = user.uid;
    const userName = user.displayName;
    
    const mostrarTexto = (texto, color) => {
        document.getElementById('ruleta-premio-texto').textContent = texto;
        document.getElementById('ruleta-premio-texto').style.color = color;
        document.getElementById('ruleta-resultado-box').classList.remove('hidden');
        document.getElementById('btn-cerrar-ruleta').classList.remove('hidden');
    };

    try {
        if (premio.tipo === "free_cards") {
            await dbRuleta.ref(`users/${uid}/free_bingo_credits`).transaction(c => (c || 0) + premio.valor);
            mostrarTexto(`¡GANASTE ${premio.valor} CARTONES GRATIS!`, premio.color);
            
        } else if (premio.tipo === "racha_dia") {
            const refRacha = dbRuleta.ref(`users/${uid}/racha_data`);
            refRacha.once('value', s => {
                let diasActuales = (s.val() && s.val().dias) ? s.val().dias : 0;
                if (diasActuales < 7) {
                    refRacha.update({ dias: diasActuales + 1 });
                    mostrarTexto(`¡Sumaste +1 Día a tu Racha!`, premio.color);
                } else {
                    dbRuleta.ref(`users/${uid}/free_bingo_credits`).transaction(c => (c || 0) + 10);
                    mostrarTexto(`¡Racha al máximo! Te llevas 10 CARTONES.`, "#3b82f6");
                }
            });

        } else if (premio.tipo === "racha_nivel") {
            const refRacha = dbRuleta.ref(`users/${uid}/racha_data`);
            refRacha.once('value', s => {
                let diasActuales = (s.val() && s.val().dias) ? s.val().dias : 0;
                if (diasActuales <= 2) {
                    refRacha.update({ nivel_pico_hoy: 3, nivel_minimo: 3 });
                    mostrarTexto(`¡UPGRADE VIP! Saltaste al Nivel 3.`, premio.color);
                } else {
                    dbRuleta.ref(`users/${uid}/free_bingo_credits`).transaction(c => (c || 0) + 15);
                    mostrarTexto(`¡Ganaste 15 CARTONES EXTRA!`, "#3b82f6");
                }
            });

        } else if (premio.tipo === "cash") {
            dbRuleta.ref('premios_horaloca_pendientes').push().set({
                uid: uid, nombre: userName, premio: premio.valor,
                fecha: firebase.database.ServerValue.TIMESTAMP, estado: 'POR_APROBAR_ADMIN'
            });
            mostrarTexto(`¡JACKPOT! Ganaste $50. El admin lo aprobará en breve.`, premio.color);
        }
    } catch (error) {
        console.error("Error premio:", error);
        mostrarTexto("Premio procesado. Recarga la página.", "#ffffff");
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRuletaListener);
else initRuletaListener();
