/* ============================================================
   BINGO TEXIER - MÓDULO INICIORACHABUENA (V25 - SINCRONIZACIÓN TOTAL)
   Blindado contra cambios de fecha en el teléfono y errores de renderizado
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

// 1. INTERFAZ Y ESTILOS (Animaciones forzadas)
function injectRachaUI() {
    const container = document.getElementById('racha-module-container');
    if (!container || document.getElementById('racha-main-box')) return;

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

        <div id="racha-main-box" style="background-color: #111827; border-radius: 1rem; padding: 4px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 2px solid #eab308; margin-bottom: 24px;">
            <div style="background: linear-gradient(to right, #b91c1c, #ea580c, #b91c1c); padding: 14px; text-align: center; border-bottom: 1px solid #1f2937; border-radius: 0.8rem 0.8rem 0 0;">
                <h3 style="font-weight: 900; color: white; font-size: 16px; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                    🎯 RETO DE RACHA DIARIA 🎯
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

// 2. UTILIDADES DE FECHA UTC (Inmunes al teléfono)
function normalizeDate(str) {
    if (!str) return "00-00-0000";
    return String(str).replace(/\//g, '-').trim();
}

function addDaysNatively(dateStr, daysToAdd) {
    let cleanStr = normalizeDate(dateStr);
    let p = cleanStr.split('-');
    // CORRECCIÓN: Separamos p (año), p (mes), p (día) para evitar que salga enero
    let d = new Date(Date.UTC(parseInt(p), parseInt(p) - 1, parseInt(p), 12, 0, 0));
    d.setUTCDate(d.getUTCDate() + daysToAdd);
    let dd = String(d.getUTCDate()).padStart(2, '0');
    let mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    let yyyy = d.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

// 3. MONITOR DE FIREBASE
function initRachaModule() {
    injectRachaUI();
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            dbRacha.ref('draw_status/date').on('value', snap => {
                currentMasterDate = normalizeDate(snap.val());
                if(currentMasterDate) initStreakData(user.uid);
            });
        }
    });
}

function initStreakData(uid) {
    const cleanMaster = currentMasterDate;
    document.getElementById('master-date-display').textContent = cleanMaster.replace(/-/g, '/');

    if(bingoRef) bingoRef.off();
    bingoRef = dbRacha.ref('bingo_aprobados_estelar').orderByChild('uid').equalTo(uid);
    bingoRef.on('value', s => {
        let count = 0;
        s.forEach(c => {
            let b = c.val();
            if (normalizeDate(b.date) === cleanMaster && b.payment_method !== 'GRATIS') count++;
        });
        streakState.ticketsBingo = count;
        syncAndRender(uid);
    });

    if(torneoRef) torneoRef.off();
    torneoRef = dbRacha.ref(`bets_torneo_express/${cleanMaster}/${uid}`);
    torneoRef.on('value', s => {
        streakState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        syncAndRender(uid);
    });
}

// 4. LÓGICA DE PROCESAMIENTO
function syncAndRender(uid) {
    const totalHoy = streakState.totalTickets;
    const diaSalvado = (totalHoy >= 1);
    let nivelHoy = totalHoy >= 6 ? 3 : (totalHoy >= 3 ? 2 : (totalHoy >= 1 ? 1 : 0));

    dbRacha.ref(`users/${uid}/racha_data`).once('value', s => {
        let data = s.val() || { dias: 0, nivel_minimo: 3, last_active: "00-00-0000", fecha_inicio: "00-00-0000" };
        let { dias, nivel_minimo, last_active, fecha_inicio } = data;
        let ayer = addDaysNatively(currentMasterDate, -1);
        let updates = {};

        if (dias > 0 && last_active !== currentMasterDate && last_active !== ayer) {
            dias = 0; nivel_minimo = 3; fecha_inicio = "00-00-0000";
            updates = { dias: 0, nivel_minimo: 3, last_active: "00-00-0000", fecha_inicio: "00-00-0000" };
        }

        if (diaSalvado && last_active !== currentMasterDate) {
            if (dias === 0) fecha_inicio = currentMasterDate;
            dias++;
            nivel_minimo = (dias === 1) ? nivelHoy : Math.min(nivel_minimo, nivelHoy);
            last_active = currentMasterDate;
            updates = { dias, nivel_minimo, last_active, fecha_inicio };
        } else if (diaSalvado && last_active === currentMasterDate) {
            let nuevoMin = (dias === 1) ? nivelHoy : Math.min(nivel_minimo, nivelHoy);
            if(nuevoMin !== nivel_minimo) {
                nivel_minimo = nuevoMin;
                updates.nivel_minimo = nivel_minimo;
            }
        }

        if (Object.keys(updates).length > 0) dbRacha.ref(`users/${uid}/racha_data`).update(updates);
        
        renderVisuals(dias, last_active, fecha_inicio, diaSalvado, nivelHoy, nivel_minimo);
    });
}

// 5. RENDERIZADO VISUAL
function renderVisuals(dias, last_active, fecha_inicio, diaSalvado, nivelHoy, nivel_minimo) {
    const totalHoy = streakState.totalTickets;
    const cleanMaster = currentMasterDate;
    
    const numEl = document.getElementById('today-played-tickets');
    numEl.textContent = totalHoy;
    numEl.style.color = diaSalvado ? "#4ade80" : "#22d3ee";
    numEl.style.textShadow = diaSalvado ? "0 0 15px rgba(74, 222, 128, 0.5)" : "0 0 15px rgba(34, 211, 238, 0.5)";

    const badgeEl = document.getElementById('today-level-badge');
    badgeEl.innerHTML = diaSalvado ? "✅ DÍA COMPLETADO" : "🎯 FALTA JUGADA DE HOY";
    badgeEl.style.color = diaSalvado ? "#4ade80" : "#22d3ee";

    // CORRECCIÓN: activeRow ahora usa nivel_minimo para que se ilumine correctamente aunque sea 1 solo cartón
    const rulesBox = document.getElementById('rules-box');
    let activeRow = diaSalvado ? nivel_minimo : 0; 

    rulesBox.innerHTML = `
        <div style="width: 100%; background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; font-size: 10px;">
            <p style="color: #facc15; font-weight: 900; text-align: center; margin-bottom: 8px;">TABLA DE PREMIOS (AL DÍA 7)</p>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${renderPremioRow(1, "1-2 Cartones", "juega en racha y al 7mo día cobra $10", "$10", activeRow)}
                ${renderPremioRow(2, "3-5 Cartones", "juega en racha y al 7mo día cobra $30", "$30", activeRow)}
                ${renderPremioRow(3, "6+ Cartones", "juega en racha y al 7mo día cobra $60", "$60", activeRow)}
            </div>
            <p style="font-size: 8px; color: #9ca3af; text-align: center; margin-top: 8px; line-height: 1.1;">
                Juega diario para completar la racha. Si está marcado en verde, ya participas por ese premio.
            </p>
            <p style="font-size: 8px; color: #ea580c; text-align: center; margin-top: 4px; line-height: 1.1; font-weight: bold;">
                Si juegas un día 6$ y al siguiente día 1$, tu racha bajará al premio más bajo. ¡Mantén tu nivel!
            </p>
        </div>
    `;

    const grid = document.getElementById('streak-days-grid');
    grid.innerHTML = '';
    let startPoint = (dias === 0 || fecha_inicio === "00-00-0000") ? cleanMaster : fecha_inicio;

    for (let i = 0; i < 7; i++) {
        let currentSlotDate = addDaysNatively(startPoint, i);
        let isToday = (currentSlotDate === cleanMaster);
        let isPast = (i < dias) && !isToday;
        
        let icon = '🔒';
        let style = 'background: #1f2937; border: 2px solid #374151; color: #4b5563;';
        let anim = '';

        if (isToday) {
            if (diaSalvado) {
                icon = '✅';
                style = 'background: #16a34a; border: 2px solid #4ade80; color: white; transform: scale(1.1); box-shadow: 0 0 10px #16a34a;';
                anim = 'anim-verde';
            } else {
                icon = '🎯';
                style = 'background: rgba(34, 211, 238, 0.1); border: 2px solid #22d3ee; color: #22d3ee;';
                anim = 'anim-diana';
            }
        } else if (isPast) {
            icon = '✅';
            style = 'background: #065f46; border: 2px solid #059669; color: #a7f3d0;';
        } else if (i === 6) {
            icon = '🎁';
            style = 'border: 2px dashed #4338ca; color: #818cf8;';
        }

        grid.innerHTML += `
            <div style="display: flex; flex-direction: column; align-items: center; width: 14%;">
                <div class="${anim}" style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.5s; ${style}">
                    ${icon}
                </div>
                <span style="font-size: 8px; margin-top: 6px; color: white; font-weight: bold;">${currentSlotDate.substring(0,5).replace('-','/')}</span>
            </div>
        `;
    }

    document.getElementById('streak-bar-7days').style.width = (dias / 7 * 100) + '%';
}

function renderPremioRow(lvl, texto, explicacion, monto, activeRow) {
    let isSelected = (activeRow === lvl);
    let style = isSelected ? 'background: rgba(34,197,94,0.2); border: 1px solid #4ade80;' : 'opacity: 0.5; border: 1px solid transparent;';
    return `
        <div style="display: flex; flex-direction: column; padding: 5px 8px; border-radius: 4px; gap: 2px; ${style}">
            <div style="display: flex; justify-content: space-between;">
                <span style="color: white; font-weight: bold;">${texto}</span>
                <span style="color: #4ade80; font-weight: 900;">${monto}</span>
            </div>
            <p style="font-size: 8px; color: #d1d5db; font-weight: bold; line-height: 1.1;">
                ${explicacion}
            </p>
        </div>
    `;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRachaModule);
else initRachaModule();
