/* ============================================================
   BINGO TEXIER - MÓDULO RULETA HORA LOCA (V3.0 - FRONTEND PRO)
   - Textos en la rueda, Botón de Girar, Evita Cartones Gratis
   - Conectado a Probabilidades del Admin
   ============================================================ */

const dbRuleta = firebase.database();

let horaLocaState = { activa: false, terminaEn: 0 };
let ruletaProbs = { jackpot: 0.5, dia: 4.5, nivel3: 10, c10: 30, c5: 55 }; // Valores por defecto

// 1. INYECTAR CSS Y HTML DESDE JAVASCRIPT
function inyectarInterfazRuleta() {
    const css = `
        @keyframes pulse-rojo { 0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.6); } 50% { box-shadow: 0 0 25px rgba(239,68,68,1); } }
        .anim-pulse-rojo { animation: pulse-rojo 2s infinite; }
        .ruleta-slice { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 40px; height: 50%; margin-left: -20px; display: flex; justify-content: center; align-items: flex-start; padding-top: 15px; font-weight: 900; font-size: 11px; color: white; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

    if (!document.getElementById('modal-ruleta')) {
        const modalHTML = `
        <div id="modal-ruleta" class="hidden fixed inset-0 bg-black/90 z- flex items-center justify-center" style="display: none;">
            <div class="bg-gradient-to-b from-purple-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] overflow-hidden">
                <h3 class="relative z-10 text-2xl font-black text-yellow-400 mb-1 drop-shadow-md">RULETA TEXIER</h3>
                <p class="relative z-10 text-xs text-purple-200 mb-6 font-bold uppercase tracking-widest">Giro de cortesía</p>
                
                <div class="relative z-10 mx-auto w-64 h-64 mb-6">
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-yellow-400 text-4xl drop-shadow-lg"><i class="fas fa-caret-down"></i></div>
                    
                    <div id="ruleta-rueda" class="w-full h-full rounded-full border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] overflow-hidden relative" style="background: conic-gradient(#eab308 0 72deg, #10b981 72deg 144deg, #8b5cf6 144deg 216deg, #3b82f6 216deg 288deg, #f97316 288deg 360deg);">
                        <div class="ruleta-slice" style="transform: rotate(36deg);">$50</div>
                        <div class="ruleta-slice" style="transform: rotate(108deg);">+1 DÍA</div>
                        <div class="ruleta-slice" style="transform: rotate(180deg);">NIVEL 3</div>
                        <div class="ruleta-slice" style="transform: rotate(252deg);">10 CART</div>
                        <div class="ruleta-slice" style="transform: rotate(324deg);">5 CART</div>
                        
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-12 h-12 bg-black rounded-full border-2 border-yellow-400 z-10 flex items-center justify-center shadow-inner"><i class="fas fa-star text-yellow-400 text-xl"></i></div>
                        </div>
                    </div>
                </div>

                <button id="btn-iniciar-giro" onclick="dispararGiro()" class="relative z-10 w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.8)] transition uppercase text-lg mb-2 transform active:scale-95">
                    ¡GIRAR AHORA!
                </button>

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

    const checkDashboard = setInterval(() => {
        const area = document.getElementById('logged-in-area');
        if (area && !document.getElementById('hora-loca-banner')) {
            const bannerHTML = `
            <div id="hora-loca-banner" class="hidden mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 p-3 rounded-xl border-2 border-yellow-300 anim-pulse-rojo text-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/20"></div>
                <h3 class="relative z-10 text-white font-black text-lg tracking-widest"><i class="fas fa-fire mr-2"></i>¡HORA LOCA!</h3>
                <p class="relative z-10 text-yellow-100 text-xs font-bold mt-1">Compra ahora y recibe 1 Giro Gratis. <span id="hora-loca-timer" class="font-mono text-sm bg-black/40 px-2 py-0.5 rounded ml-1"></span></p>
            </div>`;
            area.insertAdjacentHTML('afterbegin', bannerHTML);
            clearInterval(checkDashboard);
            renderBannerHoraLoca(); 
        }
    }, 500);
}

// 2. ESCUCHAR AL ADMIN EN TIEMPO REAL
function initRuletaListener() {
    inyectarInterfazRuleta();

    dbRuleta.ref('config/hora_loca').on('value', snap => {
        const config = snap.val() || {};
        horaLocaState.activa = config.activa === true;
        horaLocaState.terminaEn = config.terminaEn || 0;
        
        // Cargar las probabilidades dictadas por el Admin
        if(config.probabilidades) {
            ruletaProbs = config.probabilidades;
        }
        renderBannerHoraLoca();
    });
    
    interceptarCompras();
}

function renderBannerHoraLoca() {
    const banner = document.getElementById('hora-loca-banner');
    if (!banner) return;
    if (horaLocaState.activa) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
}

// 3. INTERCEPTAR COMPRAS (BLOQUEANDO GRATIS Y POR TRANSACCIÓN)
function interceptarCompras() {
    // A. BINGO ESTELAR
    const originalConfirmarBingo = window.confirmCurrentCard;
    if (typeof originalConfirmarBingo === 'function' && !window.bingoInterceptado) {
        window.confirmCurrentCard = async function() {
            const saldoAnterior = typeof userBalance !== 'undefined' ? userBalance : 0;
            
            await originalConfirmarBingo.apply(this, arguments);
            
            const saldoActual = typeof userBalance !== 'undefined' ? userBalance : 0;
            const gastoReal = saldoAnterior - saldoActual;

            // SOLO gira si la Hora Loca está activa Y gastó saldo real (Gasto > 0)
            if (horaLocaState.activa && gastoReal > 0) {
                setTimeout(() => {
                    const modalExito = document.getElementById('purchase-success-modal');
                    if (modalExito) modalExito.style.display = 'none';
                    abrirModalPreparado();
                }, 1000);
            }
        };
        window.bingoInterceptado = true;
    }

    // B. TORNEO EXPRESS
    const originalConfirmarTorneo = window.confirmTorneoPurchase;
    if (typeof originalConfirmarTorneo === 'function' && !window.torneoInterceptado) {
        window.confirmTorneoPurchase = async function() {
            const saldoAnterior = typeof userBalance !== 'undefined' ? userBalance : 0;
            await originalConfirmarTorneo.apply(this, arguments);
            const saldoActual = typeof userBalance !== 'undefined' ? userBalance : 0;
            const gastoReal = saldoAnterior - saldoActual;

            if (horaLocaState.activa && gastoReal > 0) {
                setTimeout(() => { abrirModalPreparado(); }, 1500);
            }
        };
        window.torneoInterceptado = true;
    }
}

// 4. LÓGICA DE GIRO Y CÁLCULO DESDE ADMIN
let premioPrecalculado = null; // Almacena el premio antes de girar

function abrirModalPreparado() {
    const modal = document.getElementById('modal-ruleta');
    document.getElementById('ruleta-resultado-box').classList.add('hidden');
    document.getElementById('btn-cerrar-ruleta').classList.add('hidden');
    document.getElementById('btn-iniciar-giro').classList.remove('hidden');
    document.getElementById('btn-iniciar-giro').disabled = false;
    document.getElementById('btn-iniciar-giro').innerHTML = "¡GIRAR AHORA!";
    
    const rueda = document.getElementById('ruleta-rueda');
    rueda.style.transform = 'rotate(0deg)';
    rueda.style.transition = 'none';
    modal.style.display = 'flex';

    // 1. Convertir porcentajes del Admin a rangos de 10,000
    const pJackpot = (ruletaProbs.jackpot || 0) * 100;
    const pDia = (ruletaProbs.dia || 0) * 100;
    const pNivel3 = (ruletaProbs.nivel3 || 0) * 100;
    const pC10 = (ruletaProbs.c10 || 0) * 100;
    const pC5 = (ruletaProbs.c5 || 0) * 100;

    const MAPA = [
        { nombre: "$50 EFECTIVO", tipo: "cash", valor: 50, color: "#eab308", tope: pJackpot, deg: 360 - 36 },
        { nombre: "+1 DÍA DE RACHA", tipo: "racha_dia", valor: 1, color: "#10b981", tope: pJackpot + pDia, deg: 360 - 108 },
        { nombre: "SALTO NIVEL 3", tipo: "racha_nivel", valor: 3, color: "#8b5cf6", tope: pJackpot + pDia + pNivel3, deg: 360 - 180 },
        { nombre: "10 CARTONES", tipo: "free_cards", valor: 10, color: "#3b82f6", tope: pJackpot + pDia + pNivel3 + pC10, deg: 360 - 252 },
        { nombre: "5 CARTONES", tipo: "free_cards", valor: 5, color: "#f97316", tope: pJackpot + pDia + pNivel3 + pC10 + pC5, deg: 360 - 324 }
    ];

    const rng = Math.floor(Math.random() * 10000) + 1;
    premioPrecalculado = MAPA; // Default

    for (let i = 0; i < MAPA.length; i++) {
        if (rng <= MAPA[i].tope) {
            premioPrecalculado = MAPA[i];
            break;
        }
    }
}

// Botón "GIRAR" accionado por el usuario
window.dispararGiro = function() {
    const btnGiro = document.getElementById('btn-iniciar-giro');
    btnGiro.disabled = true;
    btnGiro.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GIRANDO...';
    btnGiro.classList.add('opacity-50', 'cursor-not-allowed');

    const rueda = document.getElementById('ruleta-rueda');
    rueda.offsetHeight; // Reset CSS
    rueda.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    // Gira 5 vueltas completas + el ángulo exacto para que el puntero caiga en el premio elegido
    const rotacionTotal = (5 * 360) + premioPrecalculado.deg;
    rueda.style.transform = `rotate(${rotacionTotal}deg)`;

    setTimeout(() => {
        btnGiro.classList.add('hidden');
        aplicarPremio(premioPrecalculado);
    }, 4000);
}

window.cerrarRuletaHTML = function() {
    document.getElementById('modal-ruleta').style.display = 'none';
    location.reload();
}

// 5. APLICAR PREMIOS
async function aplicarPremio(premio) {
    const user = firebase.auth().currentUser;
    if(!user) return;
    const uid = user.uid;
    const userName = user.displayName;
    
    const mostrarTexto = (texto, color) => {
        document.getElementById('ruleta-premio-texto').textContent = texto;
        document.getElementById('ruleta-premio-texto').style.color = color;
        document.getElementById('ruleta-resultado-box').classList.remove('hidden');
        document.getElementById('ruleta-resultado-box').classList.add('animate-bounce-in');
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
