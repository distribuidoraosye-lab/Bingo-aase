/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V19 - UI FORZADA & FIX BINGO)
   Estilos Nativos, Candado Abierto 🔓, Fechas Blancas y Regalo $60
   ============================================================ */

const dbRacha = firebase.database();

let streakState = {
    ticketsBingo: 0,
    ticketsTorneo: 0,
    get totalTickets() { return this.ticketsBingo + this.ticketsTorneo; }
};

let currentMasterDate = null;
let bingoRef = null;
let torneoRef = null;

// 1. INTERFAZ PREMIUM (Con CSS Puro para forzar animaciones)
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;
    if (document.getElementById('racha-main-box')) return;

    container.innerHTML = `
        <style>
            @keyframes pulse-cyan {
                0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
                100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
            }
            .candado-base {
                width: 42px; height: 42px;
                border-radius: 50%;
                display: flex; justify-content: center; align-items: center;
                font-size: 18px;
                transition: all 0.4s ease;
            }
            .candado-pasado {
                background-color: #22c55e; border: 2px solid white; color: white;
                box-shadow: 0 0 10px rgba(34,197,94,0.8);
            }
            .candado-activo-pendiente {
                background-color: rgba(34, 211, 238, 0.1); 
                border: 2px solid #22d3ee; 
                animation: pulse-cyan 1.5s infinite;
                transform: scale(1.15);
                z-index: 10;
            }
            .candado-activo-salvado {
                background-color: #22c55e; border: 2px solid #bbf7d0;
                box-shadow: 0 0 15px rgba(34,197,94,0.9);
                transform: scale(1.15);
                z-index: 10;
            }
            .candado-futuro {
                background-color: #1f2937; border: 2px solid #374151; color: #9ca3af;
            }
        </style>

        <div id="racha-main-box" class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            <div class="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 p-4 text-center border-b border-gray-800 shadow-inner">
                <h3 class="font-black text-white text-lg tracking-tighter uppercase animate-pulse drop-shadow-lg leading-tight">
                    🎯 ¡JUEGA 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯
                </h3>
            </div>
            
            <div class="p-5 bg-black/80">
                <div class="w-full bg-gray-800 rounded-full h-3 border border-gray-700 shadow-inner relative mb-10">
                    <div id="streak-bar-7days" class="bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style="width: 0%"></div>
                </div>
                <div id="streak-days-grid" class="flex justify-between items-start px-1 relative -mt-6"></div>
            </div>
            
            <div class="bg-gray-800 p-4 border-t border-gray-700 flex flex-col items-center">
                <div class="bg-black/50 p-4 rounded-xl border border-gray-600 shadow-inner w-full max-w-xs text-center mb-4 relative overflow-hidden">
                    <p id="target-date-title" class="text-[11px] text-gray-300 uppercase font-black mb-2 tracking-widest">
                        CARTONES PARA EL: <span id="master-date-display" class="text-white">...</span>
                    </p>
                    <div class="flex justify-center items-end gap-2">
                        <span id="today-played-tickets" class="text-5xl font-black text-gray-500 leading-none transition-all duration-300">0</span>
                    </div>
                </div>
                
                <div class="flex justify-between items-center w-full mb-4">
                    <span class="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded">ESTADO DE TU RACHA:</span>
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO...</span>
                </div>

                <div id="rules-box" class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-[9px] text-left uppercase tracking-widest space-y-2 transition-all duration-500">
                    </div>
            </div>
        </div>
    `;
}

// 2. CALENDARIO NATIVO INFALIBLE
function addDaysNatively(dateStr, daysToAdd) {
    if (!dateStr || dateStr.length !== 10) return "00-00-0000";
    let p = dateStr.split('-');
    let d = new Date(parseInt(p), parseInt(p) - 1, parseInt(p), 12, 0, 0);
    d.setDate(d.getDate() + daysToAdd);
    let dd = String(d.getDate()).padStart(2, '0');
    let mm = String(d.getMonth() + 1).padStart(2, '0');
    let yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function getTimeFromStr(dateStr) {
    if (!dateStr || dateStr.length !== 10) return 0;
    let p = dateStr.split('-');
    return new Date(parseInt(p), parseInt(p) - 1, parseInt(p), 12, 0, 0).getTime();
}

function initRachaModule() {
    injectRachaUI();
    if (typeof window.switchMode === 'function' && !window.rachaSwitchPatched) {
        const originalSwitchMode = window.switchMode;
        window.switchMode = function(mode) {
            originalSwitchMode(mode);
            const rachaBox = document.getElementById('racha-main-box');
            if (rachaBox) rachaBox.style.display = 'none'; 
        };
        window.rachaSwitchPatched = true;
    }

    firebase.auth().onAuthStateChanged(user => {
        streakState.ticketsBingo = 0;
        streakState.ticketsTorneo = 0;
        if(bingoRef) { bingoRef.off(); bingoRef = null; }
        if(torneoRef) { torneoRef.off(); torneoRef = null; }
        
        const numEl = document.getElementById('today-played-tickets');
        if (numEl) numEl.textContent = '0';

        if (user) initStreakMonitor(user.uid);
    });
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initRachaModule); } 
else { initRachaModule(); }

// 3. MONITOR (Con limpieza de espacios para el Bingo)
function initStreakMonitor(uid) {
    dbRacha.ref('draw_status/date').on('value', snap => {
        const adminDate = snap.val(); 
        if(!adminDate) return;

        currentMasterDate = String(adminDate).trim();
        
        const dateDisplay = document.getElementById('master-date-display');
        if(dateDisplay) dateDisplay.textContent = currentMasterDate.replace(/-/g, '/');

        if(bingoRef) bingoRef.off();
        if(torneoRef) torneoRef.off();

        // BINGO FIX: Asegura que compare textos limpios
        bingoRef = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
        bingoRef.on('value', s => {
            let countB = 0;
            if (s.exists()) {
                s.forEach(c => {
                    let val = c.val();
                    let ticketDate = val.date ? String(val.date).trim() : "";
                    if (ticketDate === currentMasterDate && val.payment_method !== 'GRATIS') {
                        countB++;
                    }
                });
            }
            streakState.ticketsBingo = countB;
            updateStreakUI(uid);
        });

        // TORNEO
        torneoRef = dbRacha.ref(`bets_torneo_express/${currentMasterDate}/${uid}`);
        torneoRef.on('value', s => {
            streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
            updateStreakUI(uid);
        });
    });
}

// 4. LÓGICA DE RACHA
function updateStreakUI(uid) {
    if(!currentMasterDate) return;
    
    const totalJugado = streakState.totalTickets;
    let nivelAlcanzadoHoy = 0;
    if (totalJugado >= 6) nivelAlcanzadoHoy = 3;
    else if (totalJugado >= 3) nivelAlcanzadoHoy = 2;
    else if (totalJugado >= 1) nivelAlcanzadoHoy = 1;

    let diaSalvado = (totalJugado >= 1);
    let ayerDateStr = addDaysNatively(currentMasterDate, -1);

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || {};
        let dias = parseInt(data.dias) || 0;
        let nivel_minimo = parseInt(data.nivel_minimo) || 3;
        let last_active = data.last_active || "00-00-0000";
        let fecha_inicio = data.fecha_inicio || "00-00-0000";
        
        let isDirty = false;
        let updates = {};

        if (dias < 0 || dias > 7 || (dias > 0 && fecha_inicio === "00-00-0000")) {
            dias = 0; nivel_minimo = 3; last_active = "00-00-0000"; fecha_inicio = "00-00-0000";
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = "00-00-0000"; updates.fecha_inicio = "00-00-0000";
            isDirty = true;
        }

        if (dias > 0 && dias < 7 && last_active !== currentMasterDate && last_active !== ayerDateStr) {
            dias = 0; nivel_minimo = 3; last_active = "00-00-0000"; fecha_inicio = "00-00-0000";
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = "00-00-0000"; updates.fecha_inicio = "00-00-0000";
            isDirty = true;
        }

        let visualDay = dias;

        if (diaSalvado && dias < 7) {
            if (last_active !== currentMasterDate) {
                if (dias === 0) {
                    fecha_inicio = currentMasterDate; 
                    updates.fecha_inicio = fecha_inicio;
                }
                visualDay = dias + 1;
                let minLvl = dias === 0 ? nivelAlcanzadoHoy : Math.min(nivel_minimo, nivelAlcanzadoHoy);
                updates.dias = visualDay; updates.nivel_minimo = minLvl; updates.last_active = currentMasterDate;
                isDirty = true;
                dias = visualDay; nivel_minimo = minLvl; last_active = currentMasterDate;
            } else {
                visualDay = dias;
                let minLvl = dias === 1 ? nivelAlcanzadoHoy : Math.min(nivel_minimo, nivelAlcanzadoHoy);
                if(nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    nivel_minimo = minLvl;
                }
            }
        } else if (dias === 7) {
            visualDay = 7;
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }
        
        renderVisuals(dias, last_active, fecha_inicio, diaSalvado, visualDay);
    });
}

// 5. RENDERIZADO VISUAL ESTÉTICO
function renderVisuals(dias, last_active, fecha_inicio, diaSalvado, visualDay) {
    const totalJugado = streakState.totalTickets;
    
    // A. Número Gigante
    const numEl = document.getElementById('today-played-tickets');
    if(numEl) {
        numEl.textContent = totalJugado;
        if (diaSalvado) {
            numEl.className = "text-6xl font-black text-green-400 leading-none drop-shadow-[0_0_15px_rgba(34,197,94,0.9)] animate-pulse";
        } else {
            numEl.className = "text-6xl font-black text-cyan-400 leading-none drop-shadow-[0_0_20px_rgba(34,211,238,1)] animate-pulse";
        }
    }

    // B. Textos
    const badgeEl = document.getElementById('today-level-badge');
    const rulesBox = document.getElementById('rules-box');

    if (visualDay === 7 && last_active === currentMasterDate) {
        badgeEl.innerHTML = "<span class='text-green-400 animate-pulse'>🎉 ¡RETO COMPLETADO! 🎉</span>";
        rulesBox.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-3 py-2">
                <span class="text-4xl animate-bounce">🎁</span>
                <p class="text-green-400 font-black text-center text-[11px] leading-tight">¡FELICIDADES! HAS COMPLETADO LOS 7 DÍAS.</p>
                <p class="text-gray-300 text-center leading-snug text-[10px]">Espera la entrega de tu premio por parte de la administración. Una vez lo recibas, tu racha se reiniciará a 0 para volver a jugar.</p>
            </div>
        `;
    } else {
        if (diaSalvado) {
            badgeEl.innerHTML = "<span class='text-green-400'>✅ DÍA ASEGURADO</span>";
        } else {
            if (dias === 0) badgeEl.innerHTML = "<span class='text-red-400'>❌ SIN RACHA</span>";
            else badgeEl.innerHTML = "<span class='text-cyan-400 animate-pulse'>🎯 JUEGA PARA ASEGURAR</span>";
        }
        
        if(!rulesBox.innerHTML.includes("TABLA DE PREMIOS")) {
            rulesBox.innerHTML = `
                <p class="text-yellow-400 font-black mb-2 text-center text-[10px]">🏆 TABLA DE PREMIOS (7 DÍAS SEGUIDOS) 🏆</p>
                <div class="flex items-center gap-2"><span class="text-lg">🥉</span> <p class="text-gray-300">Juega <b class="text-white">1 a 2 cartones</b> diarios ➔ <b class="text-green-400">$10 GRATIS</b></p></div>
                <div class="flex items-center gap-2"><span class="text-lg">🥈</span> <p class="text-gray-300">Juega <b class="text-white">3 a 5 cartones</b> diarios ➔ <b class="text-green-400">$30 GRATIS</b></p></div>
                <div class="flex items-center gap-2"><span class="text-lg">🥇</span> <p class="text-gray-300">Juega <b class="text-white">6 o más cartones</b> diarios ➔ <b class="text-green-400">$60 GRATIS</b></p></div>
            `;
        }
    }

    // C. Dibujar Candados con las Clases CSS Nativas Inyectadas
    const grid = document.getElementById('streak-days-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    let baseDateForGrid = (dias === 0 || fecha_inicio === "00-00-0000") ? currentMasterDate : fecha_inicio;
    let timeCurrentMaster = getTimeFromStr(currentMasterDate);

    for(let i=0; i<7; i++) {
        let slotDateStr = addDaysNatively(baseDateForGrid, i); 
        let shortDate = slotDateStr.substring(0, 5).replace('-', '/'); 
        
        let timeSlot = getTimeFromStr(slotDateStr);
        let isTargetDay = (slotDateStr === currentMasterDate);

        let icon = '🔒'; 
        let lockStyle = 'candado-futuro'; 

        if (dias > 0 && timeSlot < timeCurrentMaster) {
            icon = '✅'; 
            lockStyle = 'candado-pasado';
        } else if (isTargetDay) {
            if (diaSalvado) {
                icon = '✅'; 
                lockStyle = 'candado-activo-salvado';
            } else {
                icon = '🔓'; // CANDADO ABIERTO COMO PEDISTE
                lockStyle = 'candado-activo-pendiente';
            }
        } else if (i === 6) { 
            icon = '<div class="flex flex-col items-center leading-none mt-1"><span class="text-xs">🎁</span><span class="text-[9px] font-black mt-[1px]">$60</span></div>'; 
            lockStyle = 'candado-futuro'; 
        }

        // Fechas blancas siempre
        grid.innerHTML += `
            <div class="flex flex-col items-center mt-3">
                <div class="candado-base ${lockStyle}">${icon}</div>
                <span class="text-[11px] mt-2 text-white font-bold text-center tracking-tighter">${dias === 0 ? '--/--' : shortDate}</span>
            </div>`;
    }

    // E. Barra de progreso
    let barFillPercentage = (visualDay / 7) * 100;
    const bar = document.getElementById('streak-bar-7days');
    if(bar) bar.style.width = barFillPercentage + '%';
}
