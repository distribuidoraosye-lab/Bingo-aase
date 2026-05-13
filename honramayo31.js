/* ============================================================
   BINGO TEXIER - MÓDULO BONO BIENVENIDA (RULETA EMOCIONAL V7)
   - Limpieza de Caché al cerrar sesión (Evita cruces)
   - Filtro Infalible por Fecha de Creación (Intocable)
   - Visual de 3 Días (Estilo Racha) y Congelamiento Seguro
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

// 1. FECHAS BLINDADAS
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

// 2. INTERFAZ: RULETA Y BÓVEDA REDISEÑADA (ESTILO RACHA)
function injectBonoUI() {
    const container = document.getElementById('welcome-bonus-module-container');
    if (!container) return;

    if (!document.getElementById('boveda-bienvenida-box')) {
        const css = `
            @keyframes parpadeo-luces { 0%, 100% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; } 50% { border-color: #ef4444; box-shadow: 0 0 40px #ef4444; } }
            @keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            @keyframes pulse-azul-bono { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); transform: scale(1.15); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); transform: scale(1.2); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1.15); } }
            @keyframes pulse-verde-bono { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); transform: scale(1.1); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); transform: scale(1.15); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(1.1); } }
            
            .luces-casino { animation: parpadeo-luces 0.5s infinite; }
            .slice-bienvenida { position: absolute; top: 0; left: 50%; transform-origin: 50% 100%; width: 60px; height: 50%; margin-left: -30px; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; font-weight: 900; font-size: 16px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }
            .confetti { position: fixed; width: 10px; height: 10px; background-color: #facc15; z-index: 9999999; animation: confetti-fall 3s linear infinite; }
            .anim-azul-bono { animation: pulse-azul-bono 2s infinite; }
            .anim-verde-bono { animation: pulse-verde-bono 2s infinite; }
        `;
        document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

        container.innerHTML = `
            <div id="modal-ruleta-bienvenida" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
                <div class="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl w-11/12 max-w-sm relative text-center border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.6)] overflow-hidden" style="z-index: 9999999 !important;">
                    <h3 class="relative z-10 text-2xl font-black text-yellow-400 mb-1 animate-pulse">\u{A1}REGALO DE BIENVENIDA!</h3>
                    <p class="relative z-10 text-xs text-gray-300 mb-6 font-bold uppercase tracking-widest">Gira y descubre tu bono por ser nuevo</p>
                    
                    <div class="relative z-10 mx-auto w-72 h-72 mb-6">
                        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"><i class="fas fa-caret-down"></i></div>
                        
                        <div id="rueda-bienvenida" class="w-full h-full rounded-full border-8 border-gray-800 luces-casino overflow-hidden relative" style="background: conic-gradient(#eab308 0 45deg, #10b981 45deg 90deg, #ef4444 90deg 135deg, #3b82f6 135deg 180deg, #eab308 180deg 225deg, #10b981 225deg 270deg, #ef4444 270deg 315deg, #8b5cf6 315deg 360deg);">
                            <div class="slice-bienvenida" style="transform: rotate(22.5deg);">$5</div>
                            <div class="slice-bienvenida" style="transform: rotate(67.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(112.5deg);">$20</div>
                            <div class="slice-bienvenida" style="transform: rotate(157.5deg);">$50</div>
                            <div class="slice-bienvenida" style="transform: rotate(202.5deg);">$5</div>
                            <div class="slice-bienvenida" style="transform: rotate(247.5deg);">$10</div>
                            <div class="slice-bienvenida" style="transform: rotate(292.5deg);">$20</div>
                            <div class="slice-bienvenida" style="transform: rotate(337.5deg);">$100</div>
                            
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-16 h-16 bg-black rounded-full border-4 border-yellow-400 z-10 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]"><i class="fas fa-gift text-yellow-400 text-2xl animate-pulse"></i></div>
                            </div>
                        </div>
                    </div>

                    <button id="btn-girar-bienvenida" onclick="iniciarGiroBienvenida()" class="relative z-10 w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.8)] transition uppercase text-xl mb-2 transform active:scale-95">
                        \u{A1}GIRAR RULETA!
                    </button>
                </div>
            </div>

            <div id="modal-premio-bienvenida" class="hidden fixed inset-0 flex items-center justify-center" style="display: none; background: rgba(0,0,0,0.95); z-index: 9999999 !important;">
                <div class="bg-white p-6 rounded-2xl w-11/12 max-w-sm text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]" style="z-index: 9999999 !important;">
                    <div class="text-6xl mb-2">\u{1F389}</div>
                    <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none mb-2">\u{A1}Bono Desbloqueado!</h2>
                    <p class="text-sm font-bold text-gray-500 mb-4">Te acabas de ganar este bono exclusivo por ser un usuario nuevo.</p>
                    
                    <div class="bg-green-100 border-2 border-green-500 rounded-xl p-4 mb-4 shadow-inner">
                        <span class="text-5xl font-black text-green-600 drop-shadow-sm" id="texto-monto-ganado">$5.00</span>
                    </div>

                    <div class="text-left bg-gray-100 border border-gray-300 rounded-lg p-3 mb-5">
                        <p class="text-xs font-black text-gray-700 uppercase mb-2 border-b border-gray-300 pb-1"><i class="fas fa-list-ol mr-1 text-blue-500"></i> Pasos para cobrarlo:</p>
                        <ul class="text-xs text-gray-600 font-bold space-y-2">
                            <li><span class="text-red-500 mr-1">1.</span>Tu n\u{FA}mero <b><span id="display-phone-reglas" class="text-gray-900 text-[14px]"></span></b> debe estar unido a nuestro CANAL de WhatsApp.</li>
                            <li><span class="text-red-500 mr-1">2.</span>Debes activar tu cuenta jugando 1 cart\u{F3}n diario durante 3 d\u{ED}as seguidos.</li>
                        </ul>
                    </div>
                    
                    <button id="btn-aceptar-reto" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase text-lg">
                        ACEPTAR RETO
                    </button>
                </div>
            </div>

            <div id="boveda-bienvenida-box" style="display: none; background-color: #111827; border-radius: 1rem; padding: 4px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 2px solid #3b82f6; margin-bottom: 24px; transition: opacity 0.3s ease;">
                <div style="background: linear-gradient(to right, #1e3a8a, #2563eb, #1e3a8a); padding: 14px; text-align: center; border-bottom: 1px solid #1f2937; border-radius: 0.8rem 0.8rem 0 0;">
                    <h3 style="font-weight: 900; color: white; font-size: 16px; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                        \u{1F381} BONO DE BIENVENIDA: <span id="boveda-bienvenida-monto">$5.00</span> \u{1F381}
                    </h3>
                </div>
                <div style="padding: 20px; background-color: rgba(0,0,0,0.4);">
                    <div style="width: 100%; background-color: #1f2937; border-radius: 9999px; height: 10px; border: 1px solid #374151; margin-bottom: 35px; position: relative;">
                        <div id="bono-bar-3days" style="background: linear-gradient(to right, #3b82f6, #60a5fa, #4ade80); height: 100%; border-radius: 9999px; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); width: 0%;"></div>
                    </div>
                    <div id="bono-days-grid" style="display: flex; justify-content: space-around; align-items: flex-start; padding: 0 10px; margin-top: -20px;"></div>
                </div>
                <div style="background-color: #1f2937; padding: 16px; border-radius: 0 0 0.8rem 0.8rem; display: flex; flex-direction: column; align-items: center;">
                    <p id="boveda-bienvenida-status" style="font-size: 11px; color: #d1d5db; font-weight: bold; text-align: center; margin-bottom: 10px; line-height: 1.4;"></p>
                    <button id="btn-cobrar-bienvenida" style="display: none; width: 100%; max-width: 280px; background: linear-gradient(90deg, #facc15, #eab308); color: #78350f; font-weight: 900; border: none; padding: 14px; border-radius: 12px; font-size: 14px; text-transform: uppercase; cursor: pointer; box-shadow: 0 4px 15px rgba(250,204,21,0.4); transition: transform 0.1s;">
                        <i class="fab fa-whatsapp text-lg mr-1"></i> Reclamar Pago
                    </button>
                </div>
            </div>
        `;

        document.getElementById('btn-aceptar-reto').addEventListener('click', function() {
            if(bonoUserUid) {
                dbBono.ref(`users/${bonoUserUid}/bono_bienvenida`).set({
                    status: 'active',
                    prize: window.premioBienvenidaMonto || 5,
                    dias: 0,
                    last_active: "00-00-0000",
                    fecha_inicio: currentBonoDate
                });
            }
            document.getElementById('modal-premio-bienvenida').style.display = 'none';
            document.querySelectorAll('.confetti').forEach(e => e.remove());
            location.reload();
        });

        document.getElementById('btn-cobrar-bienvenida').addEventListener('click', function() {
            let msg = `Hola Administrador. Soy un Usuario Nuevo y acabo de completar mi reto de 3 d\u{ED}as para el Bono Doble. Mi n\u{FA}mero de registro es ${currentBonoPhone} y ya estoy unido al Canal. Solicito la revisi\u{F3}n para cobrar mi Bono.`;
            window.open(`https://wa.me/584221773102?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }
}

// 3. LÓGICA DE GIRO
window.iniciarGiroBienvenida = function() {
    const btn = document.getElementById('btn-girar-bienvenida');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> GIRANDO...';
    btn.classList.add('opacity-50', 'cursor-not-allowed');

    const rueda = document.getElementById('rueda-bienvenida');
    rueda.classList.remove('luces-casino'); 
    rueda.style.transition = 'transform 6.5s cubic-bezier(0.25, 0.1, 0.15, 1)';
    
    // 100% CAE EN $5
    let premioValor = 5;
    let anguloPremio = 360 - 22.5; 
    
    window.premioBienvenidaMonto = premioValor;

    const rotacionTotal = (8 * 360) + anguloPremio;
    rueda.style.transform = `rotate(${rotacionTotal}deg)`;

    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}

    setTimeout(() => {
        lanzarConfeti();
        setTimeout(() => {
            document.getElementById('modal-ruleta-bienvenida').style.display = 'none';
            document.getElementById('texto-monto-ganado').textContent = `$${premioValor}.00`;
            document.getElementById('display-phone-reglas').textContent = currentBonoPhone;
            document.getElementById('modal-premio-bienvenida').style.display = 'flex';
        }, 1500); 
    }, 6500); 
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

// 4. INICIALIZACIÓN CON LIMPIEZA DE CACHÉ
function initBonoModule() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            bonoUserUid = user.uid;
            injectBonoUI();

            dbBono.ref(`users/${bonoUserUid}/phone`).once('value').then(snap => {
                currentBonoPhone = snap.val() || "Tu n\u{FA}mero";
            });
            
            dbBono.ref('draw_status/date').on('value', snap => {
                currentBonoDate = normalizeDateBono(snap.val());
                if(currentBonoDate !== "00-00-0000") procesarFiltroYLogica(user);
            });
        } else {
            // LIMPIEZA TOTAL AL CERRAR SESIÓN (Evita cruces)
            bonoUserUid = null;
            currentBonoPhone = "";
            bonoState.ticketsBingo = 0;
            bonoState.ticketsTorneo = 0;
            if (syncTimerBono) clearTimeout(syncTimerBono);
            
            const boveda = document.getElementById('boveda-bienvenida-box');
            if (boveda) boveda.style.display = 'none';
        }
    });
}

async function procesarFiltroYLogica(userObj) {
    const uid = userObj.uid;
    const snapBono = await dbBono.ref(`users/${uid}/bono_bienvenida`).once('value');
    
    if (snapBono.exists() && snapBono.val().status === 'old_user') return;
    if (snapBono.exists() && snapBono.val().status === 'claimed') {
        const box = document.getElementById('boveda-bienvenida-box');
        if(box) box.style.display = 'none';
        return;
    }

    if (!snapBono.exists()) {
        // FILTRO INFALIBLE: FECHA DE CREACIÓN DE FIREBASE AUTH (INTOCABLE)
        const creationTime = new Date(userObj.metadata.creationTime).getTime();
        const now = Date.now();
        const horasDeCreado = (now - creationTime) / (1000 * 60 * 60);

        if (horasDeCreado > 48) {
            await dbBono.ref(`users/${uid}/bono_bienvenida`).set({ status: 'old_user' });
            return;
        } else {
            document.getElementById('modal-ruleta-bienvenida').style.display = 'flex';
            return;
        }
    }

    monitorBonoData(uid, snapBono.val());
}

function monitorBonoData(uid, dataBono) {
    dbBono.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid).on('value', s => {
        let count = 0;
        s.forEach(c => {
            let b = c.val();
            if (normalizeDateBono(b.date) === currentBonoDate && b.payment_method !== 'GRATIS') count++;
        });
        bonoState.ticketsBingo = count;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { syncAndRenderBono(uid); }, 800);
    });

    dbBono.ref(`bets_torneo_express/${currentBonoDate}/${uid}`).on('value', s => {
        bonoState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { syncAndRenderBono(uid); }, 800);
    });
}

// 5. CÁLCULO SEGURO CON TRANSACCIÓN (CONGELAMIENTO A LOS 3 DÍAS)
function syncAndRenderBono(uid) {
    const jugoHoy = (bonoState.totalTickets >= 1);

    dbBono.ref(`users/${uid}/bono_bienvenida`).transaction(data => {
        if (!data) return data;
        
        // CONGELAMIENTO: Si ya terminó, se reclamó o es viejo, no tocamos nada.
        if (data.status === 'completed' || data.status === 'claimed' || data.status === 'old_user') {
            return data;
        }

        let dias = data.dias || 0;
        let last_active_raw = data.last_active || "00-00-0000";
        let esManual = last_active_raw.includes("_ADMIN");
        let last_active = last_active_raw.replace("_ADMIN", "");
        let ayer = addDaysSafeBono(currentBonoDate, -1);

        if (jugoHoy) {
            if (last_active === currentBonoDate) {
                // Ya contado hoy
            } else if (last_active === ayer || esManual) {
                dias++;
                last_active = currentBonoDate;
            } else {
                dias = 1;
                last_active = currentBonoDate;
            }
        } else {
            if (dias > 0 && last_active !== ayer && last_active !== currentBonoDate) {
                dias = 0; // Rompió la racha
            }
        }

        // SI LLEGA A 3, SE BLOQUEA EN COMPLETED
        if (dias >= 3) {
            data.status = 'completed';
            dias = 3;
        }

        data.dias = dias;
        data.last_active = last_active;
        
        return data;

    }, (error, committed, snapshot) => {
        if (error) { console.error("Error sincronizando bono", error); return; }
        if (snapshot.exists()) {
            renderBovedaBienvenida(snapshot.val(), jugoHoy);
        }
    });
}

// 6. RENDERIZADO VISUAL ESTILO RACHA
function renderBovedaBienvenida(data, jugoHoy) {
    if (!data) return;
    const prize = data.prize || 5;
    const dias = data.dias || 0;
    const status = data.status;

    const box = document.getElementById('boveda-bienvenida-box');
    if (!box) return;
    
    if (status === 'claimed' || status === 'old_user') {
        box.style.display = 'none';
        return;
    }

    box.style.display = 'block';
    document.getElementById('boveda-bienvenida-monto').textContent = `$${prize}.00`;
    
    const sText = document.getElementById('boveda-bienvenida-status');
    const btnReclamar = document.getElementById('btn-cobrar-bienvenida');
    const bar = document.getElementById('bono-bar-3days');
    const grid = document.getElementById('bono-days-grid');

    // Llenado de Barra
    let porcentajeBarra = (Math.min(dias, 3) / 3) * 100;
    if(bar) bar.style.width = porcentajeBarra + '%';

    // Generar los 3 Circulitos
    if(grid) {
        grid.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            let isToday = false; 
            let isPast = false;

            if (status === 'completed') {
                isPast = true; 
            } else {
                if (jugoHoy && i === dias - 1) isToday = true;
                else if (!jugoHoy && i === dias) isToday = true;
                else if (i < dias) isPast = true;
            }

            let icon = '\u{1F512}'; // Candado
            let style = 'background: #1f2937; border: 2px solid #374151; color: #4b5563;'; 
            let anim = '';

            if (isToday) {
                if (jugoHoy) { 
                    icon = '\u{2705}'; 
                    style = 'background: #16a34a; border: 2px solid #4ade80; color: white; transform: scale(1.1); box-shadow: 0 0 10px #16a34a;'; 
                    anim = 'anim-verde-bono'; 
                } else { 
                    icon = '\u{1F3AF}'; 
                    style = 'background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6; color: #3b82f6;'; 
                    anim = 'anim-azul-bono'; 
                }
            } else if (isPast) { 
                icon = '\u{2705}'; 
                style = 'background: #065f46; border: 2px solid #059669; color: #a7f3d0;'; 
            } else if (i === 2) { 
                icon = '\u{1F381}'; // Regalo
                style = 'border: 2px dashed #fbbf24; color: #fcd34d;'; 
            }

            grid.innerHTML += `<div style="display: flex; flex-direction: column; align-items: center; width: 30%;"><div class="${anim}" style="width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.5s; ${style}">${icon}</div><span style="font-size: 10px; margin-top: 8px; color: white; font-weight: bold;">D\u{ED}A ${i + 1}</span></div>`;
        }
    }

    if (status === 'completed') {
        box.style.borderColor = "#4ade80"; 
        sText.innerHTML = "\u{2705} \u{A1}RETO COMPLETADO! Reclama tu premio ahora.";
        sText.style.color = "#4ade80";
        btnReclamar.style.display = 'block';
        btnReclamar.classList.add('animate-pulse');
    } else {
        box.style.borderColor = "#3b82f6";
        sText.innerHTML = `\u{1F3AF} Juega hoy para avanzar. <span style="color:#facc15;">\u{A1}Tambi\u{E9}n sumas a tu racha normal!</span>`;
        sText.style.color = "#d1d5db";
        btnReclamar.style.display = 'none';
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBonoModule);
else initBonoModule();

// === FIN DEL ARCHIVO ===
