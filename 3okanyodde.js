/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V14 - SINCRONIZACIÓN TOTAL)
   Espejo Literal del Panel Admin + UI de Conexión Visual por Fecha
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

// 1. INTERFAZ PREMIUM
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    container.innerHTML = `
        <div id="racha-main-box" class="bg-gray-900 rounded-2xl p-1 shadow-2xl border-2 border-yellow-500 relative overflow-hidden mt-2 mb-6">
            <div class="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 p-4 text-center border-b border-gray-800 shadow-inner">
                <h3 class="font-black text-white text-lg tracking-tighter uppercase animate-pulse drop-shadow-lg leading-tight">
                    🎯 ¡JUEGA 1 CARTÓN DIARIO Y GANA HASTA $60 GRATIS AL DÍA 7! 🎯
                </h3>
            </div>
            
            <div class="p-5 bg-black/80">
                <div class="w-full bg-gray-800 rounded-full h-2 border border-gray-700 shadow-inner relative mb-8">
                    <div id="streak-bar-7days" class="bg-gradient-to-r from-orange-600 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
                <div id="streak-days-grid" class="flex justify-between items-start px-1 relative -mt-5"></div>
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
                
                <div class="flex justify-between items-center w-full mb-3">
                    <span class="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded">ESTADO DEL PREMIO:</span>
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO JUGADA...</span>
                </div>

                <div class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-[9px] text-center uppercase tracking-widest space-y-1">
                    <p class="text-yellow-400 font-black mb-2">🏆 TABLA DE PREMIOS (7 DÍAS SEGUIDOS) 🏆</p>
                    <p class="text-gray-300">Juega <b class="text-white">1 a 2 cartones</b> diarios ➔ <b class="text-green-400">$10 GRATIS</b></p>
                    <p class="text-gray-300">Juega <b class="text-white">3 a 5 cartones</b> diarios ➔ <b class="text-green-400">$30 GRATIS</b></p>
                    <p class="text-gray-300">Juega <b class="text-white">6 o más cartones</b> diarios ➔ <b class="text-green-400">$60 GRATIS</b></p>
                </div>
            </div>
        </div>
    `;
}

// 2. HERRAMIENTAS MATEMÁTICAS PARA FECHAS DE TEXTO
function parseDDMMYYYY(str) {
    const parts = str.split('-');
    if(parts.length !== 3) return new Date();
    return new Date(parts, parts - 1, parts);
}

function formatDDMMYYYY(date) {
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function addDaysStr(str, days) {
    let d = parseDDMMYYYY(str);
    d.setDate(d.getDate() + days);
    return formatDDMMYYYY(d);
}

document.addEventListener('DOMContentLoaded', () => {
    injectRachaUI();
    
    setTimeout(() => {
        if (typeof window.switchMode === 'function') {
            const originalSwitchMode = window.switchMode;
            window.switchMode = function(mode) {
                originalSwitchMode(mode);
                const rachaBox = document.getElementById('racha-main-box');
                if (rachaBox) rachaBox.style.display = 'none'; 
            };
        }
        firebase.auth().onAuthStateChanged(user => {
            if (user) initStreakMonitor(user.uid);
        });
    }, 500); 
});

// 3. MONITOR DE SINCRONIZACIÓN LITERAL (Lee lo mismo que el Admin)
function initStreakMonitor(uid) {
    
    // Escuchar el panel de control de Francisca.js
    dbRacha.ref('draw_status/date').on('value', snap => {
        const adminDate = snap.val(); 
        if(!adminDate) return;

        currentMasterDate = adminDate;
        
        // Mostrar la fecha objetivo en la pantalla
        const dateDisplay = document.getElementById('master-date-display');
        if(dateDisplay) dateDisplay.textContent = currentMasterDate.replace(/-/g, '/');

        // Limpiar escuchadores viejos si el admin cambió la fecha
        if(bingoRef) bingoRef.off();
        if(torneoRef) torneoRef.off();

        // A. Escuchar el Bingo (Buscando la fecha exacta del Admin)
        bingoRef = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
        bingoRef.on('value', s => {
            let countB = 0;
            if (s.exists()) {
                s.forEach(c => {
                    let val = c.val();
                    if (val.date === currentMasterDate && val.payment_method !== 'GRATIS') {
                        countB++;
                    }
                });
            }
            streakState.ticketsBingo = countB;
            updateStreakUI(uid);
        });

        // B. Escuchar el Torneo (Buscando en la carpeta de la fecha del Admin)
        torneoRef = dbRacha.ref(`bets_torneo_express/${currentMasterDate}/${uid}`);
        torneoRef.on('value', s => {
            streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
            updateStreakUI(uid);
        });
    });
}

// 4. ACTUALIZACIÓN VISUAL Y LÓGICA DE DÍAS
function updateStreakUI(uid) {
    if(!currentMasterDate) return;
    
    const totalJugado = streakState.totalTickets;
    
    let nivelAlcanzadoHoy = 0;
    if (totalJugado >= 6) { nivelAlcanzadoHoy = 3; }
    else if (totalJugado >= 3) { nivelAlcanzadoHoy = 2; }
    else if (totalJugado >= 1) { nivelAlcanzadoHoy = 1; }

    let diaSalvado = (totalJugado >= 1);
    let ayerDateStr = addDaysStr(currentMasterDate, -1);

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_active: "00-00-0000" };
        let isDirty = false;
        let updates = {};

        // Resetear si no jugó ayer ni hoy
        if (data.dias > 0 && data.last_active !== currentMasterDate && data.last_active !== ayerDateStr) {
            data.dias = 0; data.nivel_minimo = 3;
            updates.dias = 0; updates.nivel_minimo = 3; updates.last_active = currentMasterDate;
            isDirty = true;
        }

        let visualDay = data.dias;

        if (diaSalvado) {
            visualDay = Math.min(7, data.dias + (data.last_active === currentMasterDate ? 0 : 1));
            
            if (data.last_active !== currentMasterDate) {
                // Avanzó un día
                let minLvl = data.dias === 0 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                updates.dias = visualDay; updates.nivel_minimo = minLvl; updates.last_active = currentMasterDate;
                isDirty = true;
                data.dias = visualDay; data.nivel_minimo = minLvl; data.last_active = currentMasterDate;
            } else {
                // Compró más el mismo día
                let minLvl = data.dias === 1 ? nivelAlcanzadoHoy : Math.min(data.nivel_minimo || 3, nivelAlcanzadoHoy);
                if(data.nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    data.nivel_minimo = minLvl;
                }
            }
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }
        
        renderVisuals(data, diaSalvado, nivelAlcanzadoHoy, visualDay);
    });
}

// 5. RENDERIZADO DE LA ANIMACIÓN Y FECHAS
function renderVisuals(data, diaSalvado, nivelAlcanzadoHoy, visualDay) {
    const totalJugado = streakState.totalTickets;
    
    // A. Actualizar Número Gigante con colores
    const numEl = document.getElementById('today-played-tickets');
    numEl.textContent = totalJugado;
    
    if (diaSalvado) {
        // VERDE: Ya cumplió la meta
        numEl.className = "text-6xl font-black text-green-400 leading-none drop-shadow-[0_0_15px_rgba(34,197,94,0.9)] animate-pulse";
    } else {
        // CIAN NEÓN: Esperando que el usuario compre
        numEl.className = "text-6xl font-black text-cyan-400 leading-none drop-shadow-[0_0_20px_rgba(34,211,238,1)] animate-pulse";
    }

    // B. Actualizar Textos de Premio
    const badgeEl = document.getElementById('today-level-badge');
    if (diaSalvado) {
        if (nivelAlcanzadoHoy === 3) badgeEl.innerHTML = "<span class='text-yellow-400'>🥇 ORO ASEGURADO</span>";
        else if (nivelAlcanzadoHoy === 2) badgeEl.innerHTML = "<span class='text-gray-300'>🥈 PLATA ASEGURADO</span>";
        else badgeEl.innerHTML = "<span class='text-orange-400'>🥉 BRONCE ASEGURADO</span>";
    } else {
        badgeEl.innerHTML = "<span class='text-cyan-400 animate-pulse'>🎯 JUEGA PARA ASEGURAR</span>";
    }

    // C. Calcular Fechas de los 7 Días
    let ayerDateStr = addDaysStr(currentMasterDate, -1);
    let day1DateStr;
    
    if (data.last_active === currentMasterDate) {
        day1DateStr = addDaysStr(currentMasterDate, -(data.dias - 1));
    } else if (data.last_active === ayerDateStr && data.dias > 0) {
        day1DateStr = addDaysStr(currentMasterDate, -data.dias);
    } else {
        day1DateStr = currentMasterDate; // Empieza hoy
    }

    // D. Dibujar la cuadrícula de los 7 días
    const grid = document.getElementById('streak-days-grid');
    grid.innerHTML = '';
    
    for(let i=1; i<=7; i++) {
        let slotDateStr = addDaysStr(day1DateStr, i - 1);
        let shortDate = slotDateStr.substring(0, 5).replace('-', '/'); // DD/MM
        let isTargetDay = (slotDateStr === currentMasterDate);

        let icon = '🔒'; 
        let colorClass = 'bg-gray-800 border-gray-700 text-gray-600'; 
        let textClass = 'text-gray-600';

        if (slotDateStr < currentMasterDate || (isTargetDay && diaSalvado)) {
            // DÍAS PASADOS O DÍA ACTUAL COMPLETADO (Verde)
            icon = '✅'; 
            colorClass = 'bg-green-500 border-white text-white shadow-[0_0_10px_rgba(34,197,94,0.8)]'; 
            textClass = 'text-green-400 font-bold';
        } else if (isTargetDay && !diaSalvado) {
            // EL DÍA OBJETIVO (Cian Neón Parpadeando igual que el número gigante)
            icon = '🎯'; 
            colorClass = 'bg-cyan-600 border-cyan-300 text-white shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-pulse scale-125 z-10'; 
            textClass = 'text-cyan-400 font-black animate-pulse';
        } else if (i === 7) {
            // REGALO FINAL
            icon = '🎁'; 
            colorClass = 'bg-gray-800 border-gray-700 text-gray-500 opacity-50'; 
        }

        grid.innerHTML += `
            <div class="flex flex-col items-center mt-3">
                <div class="w-8 h-8 rounded-full border-2 ${colorClass} flex items-center justify-center text-xs transition-all duration-500">${icon}</div>
                <span class="text-[9px] mt-1 ${textClass} text-center tracking-tighter">${shortDate}</span>
            </div>`;
    }

    // E. Llenar la barra de progreso
    let barFillPercentage = (visualDay / 7) * 100;
    document.getElementById('streak-bar-7days').style.width = barFillPercentage + '%';
}
