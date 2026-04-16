/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V34 - FINAL SEGURO)
   Amortiguador de consultas, Anti-Caché, Auto-Ocultar y Cura Día 1
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
let syncTimer = null; 
let dateRef = null; // Evita duplicar el radar de fechas

// 1. INTERFAZ Y ESTILOS
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container) return;

    // Si ya existe, no lo reconstruye, solo lo asegura
    if (!document.getElementById('racha-main-box')) {
        container.innerHTML = `
            <style>
                @keyframes pulse-cyan-racha {
                    0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); transform: scale(1.15); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); transform: scale(1.2); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); transform: scale(1.15); }
                }
                @keyframes pulse-green-racha {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); transform: scale(1.1); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); transform: scale(1.15); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(1.1); }
                }
                .anim-diana { animation: pulse-cyan-racha 2s infinite; }
                .anim-verde { animation: pulse-green-racha 2s infinite; }
            </style>

            <div id="racha-main-box" style="background-color: #111827; border-radius: 1rem; padding: 4px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 2px solid #eab308; margin-bottom: 24px; transition: opacity 0.3s ease;">
                <div style="background: linear-gradient(to right, #b91c1c, #ea580c, #b91c1c); padding: 14px; text-align: center; border-bottom: 1px solid #1f2937; border-radius: 0.8rem 0.8rem 0 0;">
                    <h3 style="font-weight: 900; color: white; font-size: 16px; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                        \uD83C\uDFAF RETO DE RACHA DIARIA \uD83C\uDFAF
                    </h3>
                </div>
                
                <div style="padding: 20px; background-color: rgba(0,0,0,0.4);">
                    <div style="width: 100%; background-color: #1f2937; border-radius: 9999px; height: 10px; border: 1px solid #374151; margin-bottom: 35px; position: relative;">
                        <div id="streak-bar-7days" style="background: linear-gradient(to right, #ea580c, #eab308, #22c55e); height: 100%; border-radius: 9999px; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); width: 0%;"></div>
                    </div>
                    <div id="streak-days-grid" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 0 2px; margin-top: -20px;"></div>
                </div>
                
                <div style="background-color: #1f2937; padding: 16px; border-radius: 0 0 0.8rem 0.8rem; display: flex; flex-direction: column; align-items: center;">
                    <div style="background-color: rgba(0,0,0,0.5); padding: 12px; border-radius: 12px; border: 1px solid #4b5563; width: 100%; max-width: 300px; text-align: center; margin-bottom: 16px;">
                        <p style="font-size: 10px; color: #d1d5db; text-transform: uppercase; font-weight: 900; margin-bottom: 4px;">
                            JUGADAS PARA: <span id="master-date-display" style="color: #fbbf24;">--/--/----</span>
                        </p>
                        <span id="today-played-tickets" style="font-size: 42px; font-weight: 900; line-height: 1; transition: all 0.3s ease;">0</span>
                        <p id="today-level-badge" style="font-size: 11px; font-weight: 900; margin-top: 8px;"></p>
                    </div>
                    <div id="rules-box" style="width: 100%;"></div>
                </div>
            </div>
        `;
    }

    // SISTEMA DE AUTO-OCULTADO
    const originalSwitchMode = window.switchMode;
    if (typeof originalSwitchMode === 'function' && !window.switchModePatched) {
        window.switchMode = function(t) {
            originalSwitchMode(t);
            const rachaBox = document.getElementById('racha-main-box');
            if (rachaBox) {
                if (t === 'bingo' || t === 'animalitos') rachaBox.style.display = 'none';
                else rachaBox.style.display = 'block';
            }
        };
        window.switchModePatched = true;
    }
}

// 2. FUNCIÓN DE FECHAS (Súper Blindada para evitar que borre la racha del Admin)
function normalizeDate(str) {
    if (!str) return "00-00-0000";
    return String(str).replace(/\//g, '-').trim();
}

function addDaysSafe(dateStr, daysToAdd) {
    let cleanStr = normalizeDate(dateStr);
    if (cleanStr === "00-00-0000") return "00-00-0000";
    
    // Extracción por variables explícitas para que no se pierdan los formatos
    let p = cleanStr.split('-');
    let p0 = p ? p : "0";
    let p1 = p ? p : "1";
    let p2 = p ? p : "0";
    
    let d = parseInt(p0, 10);
    let m = parseInt(p1, 10) - 1; 
    let y = parseInt(p2, 10);
    
    let dateObj = new Date(y, m, d, 12, 0, 0);
    dateObj.setDate(dateObj.getDate() + daysToAdd);
    
    let dd = String(dateObj.getDate()).padStart(2, '0');
    let mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    let yyyy = dateObj.getFullYear();
    
    return `${dd}-${mm}-${yyyy}`;
}

// 3. MONITOR DE FIREBASE Y LIMPIEZA DE CACHÉ
function initRachaModule() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            injectRachaUI(); // Asegura que la interfaz se cree
            
            // SOLUCIÓN CACHÉ: Vuelve a hacer visible la racha sin necesidad de recargar la página
            const rachaBox = document.getElementById('racha-main-box');
            if (rachaBox) rachaBox.style.display = 'block';

            if (dateRef) dateRef.off();
            dateRef = dbRacha.ref('draw_status/date');
            dateRef.on('value', snap => {
                currentMasterDate = normalizeDate(snap.val());
                if(currentMasterDate) initStreakData(user.uid);
            });
        } else {
            // SISTEMA ANTI-CACHÉ: Limpia al cerrar sesión
            streakState.ticketsBingo = 0;
            streakState.ticketsTorneo = 0;
            currentMasterDate = null;
            if(bingoRef) bingoRef.off();
            if(torneoRef) torneoRef.off();
            if(dateRef) dateRef.off();
            clearTimeout(syncTimer); 
            
            const rachaBox = document.getElementById('racha-main-box');
            if(rachaBox) rachaBox.style.display = 'none'; // Lo oculta para el siguiente usuario
        }
    });
}

function initStreakData(uid) {
    const cleanMaster = currentMasterDate;
    const displayEl = document.getElementById('master-date-display');
    if (displayEl) displayEl.textContent = cleanMaster.replace(/-/g, '/');

    if(bingoRef) bingoRef.off();
    bingoRef = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
    bingoRef.on('value', s => {
        let count = 0;
        s.forEach(c => {
            let b = c.val();
            if (normalizeDate(b.date) === cleanMaster && b.payment_method !== 'GRATIS') count++;
        });
        streakState.ticketsBingo = count;
        
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => { syncAndRender(uid); }, 600);
    });

    if(torneoRef) torneoRef.off();
    torneoRef = dbRacha.ref(`bets_torneo_express/${cleanMaster}/${uid}`);
    torneoRef.on('value', s => {
        streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => { syncAndRender(uid); }, 600);
    });
}

// 4. LÓGICA DE PROCESAMIENTO (Respeta lo que hace el Admin)
function syncAndRender(uid) {
    const totalHoy = streakState.totalTickets;
    const diaSalvado = (totalHoy >= 1);
    let nivelHoy = totalHoy >= 6 ? 3 : (totalHoy >= 3 ? 2 : (totalHoy >= 1 ? 1 : 0));

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || {};
        
        let dias = data.dias || 0;
        let nivel_minimo = data.nivel_minimo !== undefined ? data.nivel_minimo : 3;
        let last_active = data.last_active || "00-00-0000";
        let fecha_inicio = data.fecha_inicio || "00-00-0000";
        let nivel_pico_hoy = data.nivel_pico_hoy || 0;

        let ayer = addDaysSafe(currentMasterDate, -1);
        let updates = {};

        // Cambio de día
        if (dias > 0 && last_active !== currentMasterDate) {
            if (last_active !== ayer) {
                dias = 0; nivel_minimo = 3; fecha_inicio = "00-00-0000"; nivel_pico_hoy = 0;
                updates = { dias: 0, nivel_minimo: 3, last_active: "00-00-0000", fecha_inicio: "00-00-0000", nivel_pico_hoy: 0 };
            } else {
                nivel_minimo = Math.min(nivel_minimo, nivel_pico_hoy || 3);
                updates.nivel_minimo = nivel_minimo;
            }
        }

        // Progreso de hoy
        if (diaSalvado && last_active !== currentMasterDate) {
            if (dias === 0) fecha_inicio = currentMasterDate;
            dias++;
            last_active = currentMasterDate;
            nivel_pico_hoy = nivelHoy; 
            
            if (dias === 1) {
                nivel_minimo = nivel_pico_hoy;
                updates.nivel_minimo = nivel_minimo;
            }
            
            updates.dias = dias;
            updates.last_active = last_active;
            updates.fecha_inicio = fecha_inicio;
            updates.nivel_pico_hoy = nivel_pico_hoy;
            
        } else if (diaSalvado && last_active === currentMasterDate) {
            if (nivelHoy !== nivel_pico_hoy) {
                nivel_pico_hoy = Math.max(nivel_pico_hoy, nivelHoy);
                updates.nivel_pico_hoy = nivel_pico_hoy;
                
                if (dias === 1) {
                    nivel_minimo = nivel_pico_hoy;
                    updates.nivel_minimo = nivel_minimo;
                }
            }
        }

        if (Object.keys(updates).length > 0) {
            dbRacha.ref(`users/${uid}/racha_data`).update(updates).catch(err => console.error(err));
        }
        
        let activeRow = diaSalvado ? Math.min(nivel_minimo, nivelHoy) : 0;
        renderVisuals(dias, last_active, fecha_inicio, diaSalvado, nivelHoy, activeRow);
    });
}

// 5. RENDERIZADO VISUAL
function renderVisuals(dias, last_active, fecha_inicio, diaSalvado, nivelHoy, activeRow) {
    const totalHoy = streakState.totalTickets;
    const cleanMaster = currentMasterDate;
    
    const numEl = document.getElementById('today-played-tickets');
    if(!numEl) return;
    numEl.textContent = totalHoy;
    numEl.style.color = diaSalvado ? "#4ade80" : "#22d3ee";
    numEl.style.textShadow = diaSalvado ? "0 0 15px rgba(74, 222, 128, 0.5)" : "0 0 15px rgba(34, 211, 238, 0.5)";

    const badgeEl = document.getElementById('today-level-badge');
    badgeEl.innerHTML = diaSalvado ? "\u2705 DÍA COMPLETADO" : "\uD83C\uDFAF FALTA JUGADA DE HOY";
    badgeEl.style.color = diaSalvado ? "#4ade80" : "#22d3ee";

    const rulesBox = document.getElementById('rules-box');

    rulesBox.innerHTML = `
        <div style="width: 100%; background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; font-size: 10px;">
            <p style="color: #facc15; font-weight: 900; text-align: center; margin-bottom: 8px; text-transform: uppercase;">Tabla de Premios (Al día 7)</p>
            
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${renderPremioRow(1, "Juega de 1 a 2 cartones diarios", "Completa los 7 días de racha para cobrar este premio.", "$10", activeRow)}
                ${renderPremioRow(2, "Juega de 3 a 5 cartones diarios", "Completa los 7 días de racha para cobrar este premio.", "$30", activeRow)}
                ${renderPremioRow(3, "Juega 6 o más cartones diarios", "Completa los 7 días de racha para cobrar este premio.", "$60", activeRow)}
            </div>
            
            <p style="font-size: 8.5px; color: #9ca3af; text-align: center; margin-top: 10px; line-height: 1.3;">
                Juega todos los días para no perder tu progreso. Tu premio asegurado será el del nivel que esté resaltado en color verde.
            </p>
            
            <div style="background: rgba(234, 88, 12, 0.1); border-left: 3px solid #ea580c; padding: 6px; border-radius: 4px; margin-top: 6px;">
                <p style="font-size: 8px; color: #fb923c; text-align: left; line-height: 1.3; font-weight: bold; margin: 0;">
                    \u26A0\uFE0F Importante: Si juegas un día para un premio mayor (ej. 6 cartones) y al día siguiente juegas menos (ej. 1 cartón), tu racha bajará automáticamente para adaptarse al premio más bajo. ¡Mantén tu nivel de juego constante!
                </p>
            </div>
        </div>
    `;

    const grid = document.getElementById('streak-days-grid');
    grid.innerHTML = '';
    
    let startPoint = cleanMaster;
    if (dias > 0 && last_active !== "00-00-0000") {
        startPoint = addDaysSafe(last_active, -(dias - 1));
    }

    for (let i = 0; i < 7; i++) {
        let currentSlotDate = addDaysSafe(startPoint, i); 
        let isToday = (currentSlotDate === cleanMaster);
        let isPast = (i < dias) && !isToday;
        
        let icon = '\uD83D\uDD12';
        let style = 'background: #1f2937; border: 2px solid #374151; color: #4b5563;';
        let anim = '';

        if (isToday) {
            if (diaSalvado) {
                icon = '\u2705';
                style = 'background: #16a34a; border: 2px solid #4ade80; color: white; transform: scale(1.1); box-shadow: 0 0 10px #16a34a;';
                anim = 'anim-verde';
            } else {
                icon = '\uD83C\uDFAF';
                style = 'background: rgba(34, 211, 238, 0.1); border: 2px solid #22d3ee; color: #22d3ee;';
                anim = 'anim-diana';
            }
        } else if (isPast) {
            icon = '\u2705';
            style = 'background: #065f46; border: 2px solid #059669; color: #a7f3d0;';
        } else if (i === 6) {
            icon = '\uD83C\uDF81';
            style = 'border: 2px dashed #4338ca; color: #818cf8;';
        }

        let labelDate = 'DÍA ' + (i + 1);

        grid.innerHTML += `
            <div style="display: flex; flex-direction: column; align-items: center; width: 14%;">
                <div class="${anim}" style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.5s; ${style}">
                    ${icon}
                </div>
                <span style="font-size: 9px; margin-top: 6px; color: white; font-weight: bold;">${labelDate}</span>
            </div>
        `;
    }

    document.getElementById('streak-bar-7days').style.width = (dias / 7 * 100) + '%';
}

function renderPremioRow(lvl, texto, explicacion, monto, activeRow) {
    let isSelected = (activeRow === lvl);
    let style = isSelected ? 'background: rgba(34,197,94,0.2); border: 1px solid #4ade80;' : 'opacity: 0.5; border: 1px solid transparent;';
    return `
        <div style="display: flex; flex-direction: column; padding: 6px 8px; border-radius: 4px; gap: 3px; ${style}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: white; font-weight: bold;">${texto}</span>
                <span style="color: #4ade80; font-weight: 900; font-size: 12px;">${monto}</span>
            </div>
            <p style="font-size: 8px; color: #d1d5db; font-weight: bold; line-height: 1.1; margin: 0;">
                ${explicacion}
            </p>
        </div>
    `;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRachaModule);
else initRachaModule();
