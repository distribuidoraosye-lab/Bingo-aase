/* ============================================================
   BINGO TEXIER - MÓDULO BONO BIENVENIDA (RULETA EMOCIONAL)
   Versión Definitiva: 100% Intuitivo, Larga duración, Cero Choques.
   ============================================================ */

const dbBono = firebase.database();

let bonoState = {
    ticketsBingo: 0,
    ticketsTorneo: 0,
    get totalTickets() { return this.ticketsBingo + this.ticketsTorneo; }
};

let currentBonoDate = null;
let syncTimerBono = null; 
let bonoUserUid = null;
let currentBonoPhone = "";

// 1. FECHAS BLINDADAS (Iguales a tu RachaBuena)
function normalizeDateBono(str) {
    if (!str) return "00-00-0000";
    let clean = String(str).replace(/\//g, '-').trim();
    let p = clean.split('-');
    let tempD = p.shift(); let tempM = p.shift(); let tempY = p.shift();
    if (tempD && tempM && tempY) {
        let d = tempD.length === 1 ? '0' + tempD : tempD;
        let m = tempM.length === 1 ? '0' + tempM : tempM;
        return d + '-' + m + '-' + tempY;
    }
    return clean;
}

function addDaysSafeBono(dateStr, daysToAdd) {
    let cleanStr = normalizeDateBono(dateStr);
    if (cleanStr === "00-00-0000") return "00-00-0000";
    let p = cleanStr.split('-');
    let d = parseInt(p, 10); let m = parseInt(p, 10) - 1; let y = parseInt(p, 10);
    let dateObj = new Date(y, m, d, 12, 0, 0);
    dateObj.setDate(dateObj.getDate() + daysToAdd);
    let dd = String(dateObj.getDate()).padStart(2, '0');
    let mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${dateObj.getFullYear()}`;
}

// 2. INTERFAZ: RULETA DE BIENVENIDA Y BÓVEDA
function injectBonoUI() {
    const container = document.getElementById('welcome-bonus-module-container');
    if (!container) return;

    if (!document.getElementById('boveda-bienvenida-box')) {
        const css = `
            @keyframes parpadeo-luces { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #ef4444; box-shadow: 0 0 40px #ef4444; } }
            @keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            .luces-casino { animation: parpadeo-luces 0.5s infinite; }
            .slice-bienvenida { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 16px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }
            .confetti { position: fixed; width: 10px; height: 10px; background-color: #facc15; z-index: 999999; animation: confetti-fall 3s linear infinite; }
        `;
        document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

        container.innerHTML = `
            <div id="modal-ruleta-bienvenida" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center" style="display: none;">
                <div class="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.6)] overflow-hidden">
                    <h3 class="relative z-10 text-2xl font-black text-yellow-400 mb-1 animate-pulse">¡REGALO DE BIENVENIDA!</h3>
                    <p class="relative z-10 text-xs text-gray-300 mb-6 font-bold uppercase tracking-widest">Gira y descubre tu bono por ser nuevo</p>
                    
                    <div class="relative z-10 mx-auto w-72 h-72 mb-6">
                        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"><i class="fas fa-caret-down"></i></div>
                        
                        <div id="rueda-bienvenida" class="w-full h-full rounded-full border-8 border-gray-800 luces-casino overflow-hidden relative" style="background: conic-gradient(#eab308 0 45deg, #10b981 45deg 90deg, #ef4444 90deg 135deg, #3b82f6 135deg 180deg, #eab308 180deg 225deg, #10b981 225deg 270deg, #ef4444 270deg 315deg, #8b5cf6 315deg 360deg);">
                            <div class="slice-bienvenida" style="transform: rotate(22.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(67.5deg);">$20</div>
                            <div class="slice-bienvenida" style="transform: rotate(112.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(157.5deg);">$50</div>
                            <div class="slice-bienvenida" style="transform: rotate(202.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(247.5deg);">$20</div>
                            <div class="slice-bienvenida" style="transform: rotate(292.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(337.5deg);">$100</div>
                            
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-16 h-16 bg-black rounded-full border-4 border-yellow-400 z-10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]"><i class="fas fa-gift text-yellow-400 text-2xl animate-pulse"></i></div>
                            </div>
                        </div>
                    </div>

                    <button id="btn-girar-bienvenida" onclick="iniciarGiroBienvenida()" class="relative z-10 w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.8)] transition uppercase text-xl mb-2 transform active:scale-95">
                        ¡GIRAR RULETA!
                    </button>
                </div>
            </div>

            <div id="modal-premio-bienvenida" class="hidden fixed inset-0 bg-black/95 z- flex items-center justify-center" style="display: none;">
                <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                    <div class="text-6xl mb-2">🎉</div>
                    <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">¡Bono Desbloqueado!</h2>
                    <p class="text-sm font-bold text-gray-500 mb-4">Te acabas de ganar este bono exclusivo por ser un usuario nuevo.</p>
                    
                    <div class="bg-green-100 border-2 border-green-500 rounded-xl p-4 mb-4 shadow-inner">
                        <span class="text-5xl font-black text-green-600 drop-shadow-sm" id="texto-monto-ganado">$10.00</span>
                    </div>

                    <div class="text-left bg-gray-100 border border-gray-300 rounded-lg p-3 mb-5">
                        <p class="text-xs font-black text-gray-700 uppercase mb-2 border-b border-gray-300 pb-1"><i class="fas fa-list-ol mr-1 text-blue-500"></i> Pasos para cobrarlo:</p>
                        <ul class="text-xs text-gray-600 font-bold space-y-2">
                            <li><span class="text-red-500 mr-1">1.</span>Tu número <b><span id="display-phone-reglas" class="text-gray-900"></span></b> debe estar unido a nuestro CANAL de WhatsApp.</li>
                            <li><span class="text-red-500 mr-1">2.</span>Debes activar tu cuenta jugando 1 cartón diario durante 3 días seguidos.</li>
                        </ul>
                    </div>
                    
                    <button id="btn-aceptar-reto" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-lg">
                        ACEPTAR RETO
                    </button>
                </div>
            </div>

            <div id="boveda-bienvenida-box" style="display: none; background: linear-gradient(135deg, #1e3a8a, #172554); border: 2px solid #3b82f6; border-radius: 0.8rem; padding: 12px; margin-bottom: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-b border-blue-800 pb-2 mb-2">
                    <span style="font-size: 13px; color: #93c5fd; font-weight: 900; text-transform: uppercase;"><i class="fas fa-lock mr-2"></i> Bóveda Nuevo</span>
                    <span id="boveda-bienvenida-monto" style="font-size: 18px; color: #4ade80; font-weight: 900;">$10.00</span>
                </div>
                <div style="text-align: center;">
                    <p id="boveda-bienvenida-status" style="font-size: 12px; color: #d1d5db; font-weight: bold; margin: 0;">Juega <span id="boveda-bienvenida-dias" style="color: #fbbf24; font-size: 16px;">0</span> de 3 días para cobrar.</p>
                </div>
                <button id="btn-cobrar-bienvenida" style="display: none; width: 100%; margin-top: 10px; background: #fbbf24; color: #78350f; font-weight: 900; border: none; padding: 10px; border-radius: 6px; font-size: 13px; text-transform: uppercase; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <i class="fab fa-whatsapp text-lg mr-1"></i> Reclamar Pago al Cajero
                </button>
            </div>
        `;

        // Evento: Al aceptar el reto post-ruleta
        document.getElementById('btn-aceptar-reto').addEventListener('click', function() {
            if(bonoUserUid) {
                dbBono.ref(`users/${bonoUserUid}/bono_bienvenida`).set({
                    status: 'active',
                    prize: window.premioBienvenidaMonto || 10,
                    dias: 0,
                    last_active: "00-00-0000",
                    fecha_inicio: currentBonoDate
                });
            }
            document.getElementById('modal-premio-bienvenida').style.display = 'none';
            // Limpiar confeti si quedó alguno
            document.querySelectorAll('.confetti').forEach(e => e.remove());
        });

        // Evento: Reclamar pago vía WhatsApp
        document.getElementById('btn-cobrar-bienvenida').addEventListener('click', function() {
            let msg = `Hola Administrador. Soy un Usuario Nuevo y acabo de completar mi reto de 3 días. Mi número de registro es ${currentBonoPhone} y ya estoy unido al Canal. Solicito la revisión para cobrar mi Bono de $10.`;
            window.open(`https://wa.me/584221773102?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }
}

// 3. LÓGICA DE GIRO EMOCIONAL DE LA RULETA
window.iniciarGiroBienvenida = function() {
    const btn = document.getElementById('btn-girar-bienvenida');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> GIRANDO...';
    btn.classList.add('opacity-50', 'cursor-not-allowed');

    const rueda = document.getElementById('rueda-bienvenida');
    rueda.classList.remove('luces-casino'); // Apaga parpadeo para concentrarse en el giro
    rueda.style.transition = 'transform 6.5s cubic-bezier(0.25, 0.1, 0.15, 1)'; // Animación largaaaa
    
    // Matemática implacable: 99.999% cae en 10.
    let rng = Math.random();
    let premioValor = 10;
    let anguloPremio = 360 - 22.5; // Primer slice de $10 (0 a 45 deg, centro en 22.5)

    if (rng > 0.99999) { premioValor = 100; anguloPremio = 360 - 337.5; }
    else if (rng > 0.9999) { premioValor = 50; anguloPremio = 360 - 157.5; }
    else if (rng > 0.999) { premioValor = 20; anguloPremio = 360 - 67.5; }
    
    window.premioBienvenidaMonto = premioValor;

    // Da 8 vueltas completas (2880 grados) + el ángulo del premio para que frene ahí.
    const rotacionTotal = (8 * 360) + anguloPremio;
    rueda.style.transform = `rotate(${rotacionTotal}deg)`;

    // Efecto de sonido (opcional pero recomendado)
    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        lanzarConfeti();
        setTimeout(() => {
            document.getElementById('modal-ruleta-bienvenida').style.display = 'none';
            document.getElementById('texto-monto-ganado').textContent = `$${premioValor}.00`;
            document.getElementById('display-phone-reglas').textContent = currentBonoPhone;
            document.getElementById('modal-premio-bienvenida').style.display = 'flex';
        }, 1500); // 1.5 segundos celebrando antes de mostrar el texto explicativo
    }, 6500); // Espera que terminen los 6.5s del giro
}

function lanzarConfeti() {
    const colors = ['#ef4444', '#3b82f6', '#facc15', '#10b981', '#a855f7'];
    for(let i=0; i<50; i++) {
        let conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
        conf.style.animationDelay = (Math.random() * 1) + 's';
        document.body.appendChild(conf);
    }
}

// 4. MONITOR FIREBASE Y LÓGICA DE DÍAS (Igual a tu Racha)
function initBonoModule() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            bonoUserUid = user.uid;
            currentBonoPhone = user.email ? user.email.split('@') : "";
            injectBonoUI();
            
            dbBono.ref('draw_status/date').on('value', snap => {
                currentBonoDate = normalizeDateBono(snap.val());
                if(currentBonoDate !== "00-00-0000") monitorBonoData(user.uid);
            });
        }
    });
}

function monitorBonoData(uid) {
    dbBono.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let count = 0;
        s.forEach(c => {
            let b = c.val();
            if (normalizeDateBono(b.date) === currentBonoDate && b.payment_method !== 'GRATIS') count++;
        });
        bonoState.ticketsBingo = count;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { procesarLogicaBono(uid); }, 800);
    });

    dbBono.ref(`bets_torneo_express/${currentBonoDate}/${uid}`).on('value', s => {
        bonoState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { procesarLogicaBono(uid); }, 800);
    });
}

function procesarLogicaBono(uid) {
    dbBono.ref(`users/${uid}/bono_bienvenida`).once('value', s => {
        let data = s.val();
        
        // Es Usuario Nuevo SIN Bono. Dispara Ruleta Emocional.
        if (!s.exists()) {
            document.getElementById('modal-ruleta-bienvenida').style.display = 'flex';
            return;
        }

        // Si ya lo cobró, escondemos la bóveda y no hacemos más nada.
        if (data.status === 'claimed') {
            document.getElementById('boveda-bienvenida-box').style.display = 'none';
            return;
        }

        // --- LÓGICA DE DÍAS BLINDADA ---
        let dias = data.dias || 0;
        let last_active = data.last_active || "00-00-0000";
        let ayer = addDaysSafeBono(currentBonoDate, -1);
        let jugoHoy = (bonoState.totalTickets >= 1);
        let updates = {};

        if (data.status === 'active') {
            if (jugoHoy) {
                if (last_active === ayer) {
                    dias++;
                    last_active = currentBonoDate;
                    updates = { dias: dias, last_active: last_active };
                    if (dias >= 3) {
                        updates.status = 'completed';
                        data.status = 'completed';
                    }
                } else if (last_active !== currentBonoDate) {
                    dias = 1;
                    last_active = currentBonoDate;
                    updates = { dias: dias, last_active: last_active };
                }
            } else {
                if (dias > 0 && last_active !== ayer && last_active !== currentBonoDate) {
                    dias = 0;
                    updates = { dias: 0 };
                }
            }

            if (Object.keys(updates).length > 0) {
                dbBono.ref(`users/${uid}/bono_bienvenida`).update(updates);
            }
        }

        renderBovedaBienvenida(data.prize || 10, dias, data.status);
    });
}

function renderBovedaBienvenida(prize, dias, status) {
    const box = document.getElementById('boveda-bienvenida-box');
    const mDisplay = document.getElementById('boveda-bienvenida-monto');
    const sText = document.getElementById('boveda-bienvenida-status');
    const dProgreso = document.getElementById('boveda-bienvenida-dias');
    const btnReclamar = document.getElementById('btn-cobrar-bienvenida');

    box.style.display = 'block';
    mDisplay.textContent = `$${prize}.00`;
    
    if (status === 'completed') {
        box.style.border = "2px solid #4ade80"; 
        sText.innerHTML = "✅ ¡RETO COMPLETADO! ✅";
        sText.style.color = "#4ade80";
        btnReclamar.style.display = 'block';
    } else {
        dProgreso.textContent = Math.min(dias, 3);
        btnReclamar.style.display = 'none';
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBonoModule);
else initBonoModule();
