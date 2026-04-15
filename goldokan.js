/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V15 - UX & ANTI-NaN)
   Fechas Históricas, Restricción Gratis Intacta, UI Mejorada
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
                
                <div class="flex justify-between items-center w-full mb-4">
                    <span class="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded">ESTADO DE TU RACHA:</span>
                    <span id="today-level-badge" class="text-[10px] bg-gray-700 px-2 py-1 rounded text-white font-black shadow-sm">ESPERANDO...</span>
                </div>

                <div class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-[9px] text-left uppercase tracking-widest space-y-2">
                    <p class="text-yellow-400 font-black mb-2 text-center">🏆 TABLA DE PREMIOS (7 DÍAS SEGUIDOS) 🏆</p>
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🥉</span> 
                        <p class="text-gray-300">Juega <b class="text-white">1 a 2 cartones</b> diarios ➔ <b class="text-green-400">$10 GRATIS</b></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🥈</span> 
                        <p class="text-gray-300">Juega <b class="text-white">3 a 5 cartones</b> diarios ➔ <b class="text-green-400">$30 GRATIS</b></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🥇</span> 
                        <p class="text-gray-300">Juega <b class="text-white">6 o más cartones</b> diarios ➔ <b class="text-green-400">$60 GRATIS</b></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 2. HERRAMIENTAS MATEMÁTICAS (Anti-NaN)
function parseDDMMYYYY(str) {
    if (!str || typeof str !== 'string') return new Date();
    const parts = str.split('-');
    if(parts.length !== 3) return new Date();
    return new Date(parts, parts - 1, parts);
}

function formatDDMMYYYY(date) {
    if (isNaN(date.getTime())) return "00-00-0000";
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function addDaysStr(str, days) {
    let d = parseDDMMYYYY(str);
    if (isNaN(d.getTime())) return str;
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

// 3. MONITOR DE SINCRONIZACIÓN LITERAL
function initStreakMonitor(uid) {
    dbRacha.ref('draw_status/date').on('value', snap => {
        const adminDate = snap.val(); 
        if(!adminDate) return;

        currentMasterDate = adminDate;
        
        const dateDisplay = document.getElementById('master-date-display');
        if(dateDisplay) dateDisplay.textContent = currentMasterDate.replace(/-/g, '/');

        if(bingoRef) bingoRef.off();
        if(torneoRef) torneoRef.off();

        // A. Escuchar Bingo (Restricción de GRATIS activa)
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

        // B. Escuchar Torneo
        torneoRef = dbRacha.ref(`bets_torneo_express/${currentMasterDate}/${uid}`);
        torneoRef.on('value', s => {
            streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
            updateStreakUI(uid);
        });
    });
}

// 4. ACTUALIZACIÓN VISUAL Y LÓGICA DE DÍAS (Protección Total)
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
        // Variables con seguro Anti-NaN
        let data = s.val() || {};
        let dias = parseInt(data.dias) || 0;
        let nivel_minimo = parseInt(data.nivel_minimo) || 3;
        let last_active = data.last_active || "00-00-0000";
        
        let isDirty = false;
        let updates = {};

        // 1. Validar si perdió la racha
        if (dias > 0 && last_active !== currentMasterDate && last_active !== ayerDateStr) {
            dias = 0;
            nivel_minimo = 3;
            last_active = "00-00-0000";
            updates.dias = 0; 
            updates.nivel_minimo = 3; 
            updates.last_active = "00-00-0000";
            isDirty = true;
        }

        let visualDay = dias;

        // 2. Procesar jugada de hoy
        if (diaSalvado) {
            visualDay = Math.min(7, dias + (last_active === currentMasterDate ? 0 : 1));
            
            if (last_active !== currentMasterDate) {
                // Avanzó de día
                let minLvl = dias === 0 ? nivelAlcanzadoHoy : Math.min(nivel_minimo, nivelAlcanzadoHoy);
                updates.dias = visualDay; 
                updates.nivel_minimo = minLvl; 
                updates.last_active = currentMasterDate;
                isDirty = true;
                
                dias = visualDay;
                nivel_minimo = minLvl;
                last_active = currentMasterDate;
            } else {
                // Compró más el mismo día (Mejora nivel)
                let minLvl = dias === 1 ? nivelAlcanzadoHoy : Math.min(nivel_minimo, nivelAlcanzadoHoy);
                if(nivel_minimo !== minLvl) {
                    updates.nivel_minimo = minLvl;
                    isDirty = true;
                    nivel_minimo = minLvl;
                }
            }
        }

        if (isDirty) { dbRacha.ref(`users/${uid}/racha_data`).update(updates); }
        
        renderVisuals(dias, last_active, diaSalvado, visualDay);
    });
}

// 5. RENDERIZADO DE LA ANIMACIÓN Y FECHAS HISTÓRICAS
function renderVisuals(dias, last_active, diaSalvado, visualDay) {
    const totalJugado = streakState.totalTickets;
    
    // A. Actualizar Número Gigante con colores
    const numEl = document.getElementById('today-played-tickets');
    numEl.textContent = totalJugado;
    
    if (diaSalvado) {
        // VERDE: Ya cumplió la meta
        numEl.className = "text-6xl font-black text-green-400 leading-none drop-shadow-[0_0_15px_rgba(34,197,94,0.9)] animate-pulse";
    } else {
        // CIAN NEÓN: Esperando jugada
        numEl.className = "text-6xl font-black text-cyan-400 leading-none drop-shadow-[0_0_20px_rgba(34,211,238,1)] animate-pulse";
    }

    // B. Actualizar Badge "SIN RACHA" o "DÍA ASEGURADO"
    const badgeEl = document.getElementById('today-level-badge');
    if (diaSalvado) {
        badgeEl.innerHTML = "<span class='text-green-400'>✅ DÍA ASEGURADO</span>";
    } else {
        if (dias === 0) {
            badgeEl.innerHTML = "<span class='text-red-400'>❌ SIN RACHA</span>";
        } else {
            badgeEl.innerHTML = "<span class='text-cyan-400 animate-pulse'>🎯 JUEGA PARA ASEGURAR</span>";
        }
    }

    // C. Calcular Origen de la Racha (Fechas)
    let day1DateStr;
    if (dias === 0) {
        day1DateStr = currentMasterDate; // Empieza hoy la proyección
    } else {
        // El Día 1 es last_active menos los días que lleva de racha
        day1DateStr = addDaysStr(last_active, -(dias - 1)); 
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

        if (dias > 0 && slotDateStr < currentMasterDate) {
            // DÍAS PASADOS (Histórico completado)
            icon = '✅'; 
            colorClass = 'bg-green-500 border-white text-white shadow-[0_0_10px_rgba(34,197,94,0.8)]'; 
            textClass = 'text-green-400 font-bold';
        } else if (isTargetDay) {
            if (diaSalvado) {
                // DÍA ACTUAL COMPLETADO (Verde)
                icon = '✅'; 
                colorClass = 'bg-green-500 border-white text-white shadow-[0_0_15px_rgba(34,197,94,0.9)] scale-110 z-10'; 
                textClass = 'text-green-400 font-bold';
            } else {
                // EL DÍA OBJETIVO PENDIENTE (Cian Neón Parpadeando)
                icon = '🎯'; 
                colorClass = 'bg-cyan-600 border-cyan-300 text-white shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-pulse scale-125 z-10'; 
                textClass = 'text-cyan-400 font-black animate-pulse';
            }
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
