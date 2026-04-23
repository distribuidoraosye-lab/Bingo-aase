/* ============================================================
   BINGO TEXIER - MÓDULO BONO BIENVENIDA (RASPADITO Y BÓVEDA)
   Lógica Independiente | Manual | Matemática Trucada | Fechas Blindadas
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

// 1. FECHAS BLINDADAS (Exactamente iguales a RachaBuena V38)
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
    let extraidoD = p.shift(); let extraidoM = p.shift(); let extraidoY = p.shift();
    let d = parseInt(extraidoD, 10); let m = parseInt(extraidoM, 10) - 1; let y = parseInt(extraidoY, 10);
    let dateObj = new Date(y, m, d, 12, 0, 0);
    dateObj.setDate(dateObj.getDate() + daysToAdd);
    let dd = String(dateObj.getDate()).padStart(2, '0');
    let mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${dateObj.getFullYear()}`;
}

// 2. INTERFAZ: POPUP Y BÓVEDA
function injectBonoUI() {
    const container = document.getElementById('welcome-bonus-module-container');
    if (!container) return;

    if (!document.getElementById('bono-boveda-box')) {
        container.innerHTML = `
            <style>
                #raspadito-modal {
                    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.9); z-index: 99999; justify-content: center; align-items: center;
                    backdrop-filter: blur(5px);
                }
                .raspadito-content {
                    background: linear-gradient(180deg, #1f2937 0%, #111827 100%); border: 2px solid #eab308;
                    border-radius: 1rem; padding: 20px; width: 95%; max-width: 350px; text-align: center;
                    box-shadow: 0 0 30px rgba(234, 179, 8, 0.4); relative; overflow: hidden;
                }
                .zona-raspar {
                    background: #9ca3af; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);
                    border: 3px dashed #4b5563; border-radius: 10px; height: 120px;
                    display: flex; justify-content: center; align-items: center; cursor: pointer;
                    position: relative; overflow: hidden; transition: all 1s ease;
                }
                .premio-oculto {
                    opacity: 0; transform: scale(0.5); transition: all 0.5s ease;
                    display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;
                }
                .zona-raspar.raspado { background: #064e3b; border-color: #10b981; cursor: default; }
                .zona-raspar.raspado .premio-oculto { opacity: 1; transform: scale(1); }
                .zona-raspar.raspado .capa-gris { display: none; }
            </style>
            
            <div id="raspadito-modal">
                <div class="raspadito-content">
                    <h2 style="color: #facc15; font-weight: 900; margin-top: 0; font-size: 20px; text-transform: uppercase;">🎁 Bono de Bienvenida 🎁</h2>
                    <p style="color: #d1d5db; font-size: 12px; margin-bottom: 15px; font-weight: bold;">Toca la zona gris para raspar tu premio virtual. <br>¡Premios de $10, $20, $50 y $100!</p>
                    
                    <div id="area-raspar" class="zona-raspar" onclick="rasparTicket()">
                        <div class="capa-gris" style="position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: black; color: #4b5563; text-shadow: 1px 1px 0px rgba(255,255,255,0.3);">
                            👆 TOCA PARA RASPAR 👆
                        </div>
                        <div class="premio-oculto">
                            <div style="font-size: 28px; margin-bottom: 5px;">🐘 🐘 🐘</div>
                            <div id="monto-ganado" style="font-size: 32px; font-weight: 900; color: #4ade80; line-height: 1;">$10.00</div>
                        </div>
                    </div>

                    <div id="info-reglas" style="display: none; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 10px; text-align: left; margin-top: 15px;">
                        <p style="font-size: 10px; color: #fca5a5; margin: 0; line-height: 1.4;">
                            ⚠️ <b>REGLA PARA COBRAR:</b> Tu número <span id="display-phone-popup" style="color: white; font-weight: bold;"></span> DEBE estar unido a nuestro Grupo VIP de WhatsApp. <br>Juega 1 cartón diario por 3 días seguidos para desbloquear este saldo.
                        </p>
                    </div>
                    
                    <button id="btn-accept-raspadito" style="display: none; margin-top: 15px; background: linear-gradient(to right, #10b981, #059669); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 900; font-size: 14px; width: 100%; cursor: pointer; text-transform: uppercase;">ACEPTAR RETO</button>
                </div>
            </div>

            <div id="bono-boveda-box" style="display: none; background: linear-gradient(to right, #1e3a8a, #172554); border: 2px solid #3b82f6; border-radius: 0.8rem; padding: 10px; margin-bottom: 15px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #93c5fd; font-weight: 900; text-transform: uppercase;"><i class="fas fa-lock mr-1"></i> Bóveda Bienvenida</span>
                    <span id="boveda-monto" style="font-size: 16px; color: #4ade80; font-weight: 900;">$10.00</span>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 5px; padding: 5px; margin-top: 8px;">
                    <p id="boveda-status-text" style="font-size: 11px; color: white; font-weight: bold; margin: 0;">Día <span id="boveda-dias-progreso" style="color: #fbbf24; font-size: 14px;">0</span> de 3 para desbloquear.</p>
                </div>
                <button id="btn-reclamar-admin" style="display: none; width: 100%; margin-top: 8px; background: #fbbf24; color: #78350f; font-weight: 900; border: none; padding: 8px; border-radius: 5px; font-size: 12px; text-transform: uppercase; cursor: pointer;">
                    <i class="fab fa-whatsapp"></i> Reclamar Pago al Cajero
                </button>
            </div>
        `;

        document.getElementById('btn-accept-raspadito').addEventListener('click', function() {
            if(bonoUserUid) {
                // Matemática Trucada: 99.999% sale 10
                let rng = Math.random();
                let prizeVal = 10;
                if (rng > 0.99999) prizeVal = 100;
                else if (rng > 0.9999) prizeVal = 50;
                else if (rng > 0.999) prizeVal = 20;

                dbBono.ref(`users/${bonoUserUid}/bono_bienvenida`).set({
                    status: 'active',
                    prize: prizeVal,
                    dias: 0,
                    last_active: "00-00-0000",
                    fecha_inicio: currentBonoDate
                });
            }
            document.getElementById('raspadito-modal').style.display = 'none';
        });

        document.getElementById('btn-reclamar-admin').addEventListener('click', function() {
            let msg = `Hola Administrador. Acabo de completar mis 3 días del Bono de Bienvenida. Mi número de registro es ${currentBonoPhone} y ya estoy en el grupo VIP. Solicito la revisión para la liberación de mis $10.`;
            window.open(`https://wa.me/584221773102?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }
}

// 3. ANIMACIÓN DEL RASPADITO
window.rasparTicket = function() {
    let area = document.getElementById('area-raspar');
    if(area.classList.contains('raspado')) return;
    
    // Reproducir sonido de moneda (Opcional, pero da buen feeling)
    try { new Audio('https://bingotexier.com/archivos/sonidos/success.mp3').play().catch(e=>{}); } catch(e){}
    
    area.classList.add('raspado');
    setTimeout(() => {
        document.getElementById('info-reglas').style.display = 'block';
        document.getElementById('btn-accept-raspadito').style.display = 'block';
    }, 1000);
}

// 4. MONITOR FIREBASE Y LÓGICA DE 3 DÍAS
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
    // 1. Leer jugadas de Bingo de Hoy
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

    // 2. Leer jugadas de Torneo de Hoy
    dbBono.ref(`bets_torneo_express/${currentBonoDate}/${uid}`).on('value', s => {
        bonoState.ticketsTorneo = s.exists() ? s.numChildren() : 0;
        clearTimeout(syncTimerBono);
        syncTimerBono = setTimeout(() => { procesarLogicaBono(uid); }, 800);
    });
}

function procesarLogicaBono(uid) {
    dbBono.ref(`users/${uid}/bono_bienvenida`).once('value', s => {
        let data = s.val();
        
        // Si no existe, es NUEVO. Lanzar Pop-up.
        if (!s.exists()) {
            document.getElementById('display-phone-popup').textContent = currentBonoPhone;
            document.getElementById('raspadito-modal').style.display = 'flex';
            return;
        }

        // Si ya fue cobrado, esconder todo y apagar módulo
        if (data.status === 'claimed') {
            document.getElementById('bono-boveda-box').style.display = 'none';
            return;
        }

        // --- LÓGICA DE DÍAS (Igual a RachaBuena) ---
        let dias = data.dias || 0;
        let last_active = data.last_active || "00-00-0000";
        let ayer = addDaysSafeBono(currentBonoDate, -1);
        let jugoHoy = (bonoState.totalTickets >= 1);
        let updates = {};

        if (data.status === 'active') {
            if (jugoHoy) {
                if (last_active === ayer) {
                    // Mantuvo la racha y avanzó de día
                    dias++;
                    last_active = currentBonoDate;
                    updates = { dias: dias, last_active: last_active };
                    
                    if (dias >= 3) {
                        updates.status = 'completed'; // ¡Terminó el reto!
                        data.status = 'completed';
                    }
                } else if (last_active !== currentBonoDate) {
                    // Perdió la racha o es su primerísimo día. Reiniciamos la cuenta.
                    dias = 1;
                    last_active = currentBonoDate;
                    updates = { dias: dias, last_active: last_active };
                }
            } else {
                // No ha jugado hoy. Verificamos si la perdió.
                if (dias > 0 && last_active !== ayer && last_active !== currentBonoDate) {
                    // Si su última jugada fue antes de ayer, perdió el progreso. Reinicia a 0.
                    dias = 0;
                    updates = { dias: 0 };
                }
            }

            if (Object.keys(updates).length > 0) {
                dbBono.ref(`users/${uid}/bono_bienvenida`).update(updates);
            }
        }

        renderBoveda(data.prize || 10, dias, data.status);
    });
}

function renderBoveda(prize, dias, status) {
    const box = document.getElementById('bono-boveda-box');
    const mDisplay = document.getElementById('boveda-monto');
    const sText = document.getElementById('boveda-status-text');
    const dProgreso = document.getElementById('boveda-dias-progreso');
    const btnReclamar = document.getElementById('btn-reclamar-admin');

    box.style.display = 'block';
    mDisplay.textContent = `$${prize}.00`;
    
    if (status === 'completed') {
        box.style.border = "2px solid #4ade80"; // Verde
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
