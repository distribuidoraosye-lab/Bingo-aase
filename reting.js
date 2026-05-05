/* ============================================================
   MÓDULO DE RETIROS - BINGO TEXIER
   Versión: 2.0 (Anti-Fraude, Flash/Estándar, Horarios Internet)
   ============================================================ */

const MIN_WITHDRAWAL = 300;
const FLASH_FEE_PERCENT = 0.15;
const DEPOSIT_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 horas de bloqueo tras depositar
let hasPendingWithdrawal = false;
let userSavedPM = null;

// Esperamos a que la ventana cargue para "sobrescribir" la lógica de francisca.js
window.addEventListener('load', () => {
    // Anulamos el botón viejo y le ponemos nuestra nueva función
    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) {
        withdrawBtn.onclick = async (e) => {
            e.preventDefault();
            await abrirModalRetiros();
        };
    }

    // Anulamos el envío del formulario viejo para que francisca.js no interfiera
    const oldForm = document.getElementById('withdraw-form');
    if (oldForm) {
        oldForm.onsubmit = (e) => { e.preventDefault(); };
    }

    // Escuchamos la sesión para cargar datos del usuario
    auth.onAuthStateChanged(u => {
        if(u) initWithdrawalModule();
    });
});

function initWithdrawalModule() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // 1. Escuchar si tiene retiros pendientes
    db.ref('withdrawal_requests').orderByChild('uid').equalTo(uid).on('value', s => {
        hasPendingWithdrawal = false;
        if (s.exists()) {
            s.forEach(child => {
                if (child.val().status === 'PENDING') {
                    hasPendingWithdrawal = true;
                }
            });
        }
    });

    // 2. Cargar pago móvil guardado
    db.ref(`users/${uid}/pago_movil_guardado`).on('value', s => {
        if (s.exists()) {
            userSavedPM = s.val();
        } else {
            userSavedPM = null;
        }
    });
}

async function abrirModalRetiros() {
    if (!auth.currentUser) return;

    // Validar Horario por internet
    const now = new Date(Date.now() + serverTimeOffset);
    const hora = now.getHours();

    if (hora < 10 || hora >= 23) {
        alert("\u26A0\uFE0F FUERA DE HORARIO: Los retiros se procesan de 10:00 AM a 11:00 PM. Tu saldo est\u00E1 seguro, por favor vuelve ma\u00F1ana.");
        return;
    }

    // Validar si hay retiro en proceso
    if (hasPendingWithdrawal) {
        alert("\u23F3 Ya tienes una solicitud de retiro en proceso. Espera a que sea aprobada.");
        return;
    }

    // Validar depósitos recientes (Anti-fraude de bonos)
    const uid = auth.currentUser.uid;
    const depSnap = await db.ref('referencias_usadas').orderByChild('uid').equalTo(uid).once('value');
    
    if (depSnap.exists()) {
        let lastDepTime = 0;
        depSnap.forEach(d => { 
            if (d.val().date > lastDepTime) lastDepTime = d.val().date; 
        });
        
        const timeSinceDeposit = now.getTime() - lastDepTime;
        if (timeSinceDeposit < DEPOSIT_COOLDOWN_MS) {
            const minsLeft = Math.ceil((DEPOSIT_COOLDOWN_MS - timeSinceDeposit) / 60000);
            alert(`\u26D4 SEGURIDAD: Acabas de depositar. Debes jugar tu saldo o esperar ${minsLeft} minutos para poder retirar.`);
            return;
        }
    }

    document.getElementById('withdraw-form-area').style.display = 'flex';
    renderWithdrawalUI();
}

function renderWithdrawalUI() {
    const contentDiv = document.getElementById('withdraw-content-dynamic');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = ''; 

    if (!userSavedPM) {
        contentDiv.innerHTML = `
            <div class="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4 text-center">
                <p class="text-xs font-bold text-yellow-800">\u26A0\uFE0F Por seguridad, vincula tu Pago M\u00F3vil. Solo podr\u00E1s retirar a esta cuenta.</p>
            </div>
            <input id="new-pm-tlf" type="tel" class="w-full p-3 border rounded mb-2 text-sm" placeholder="Tel\u00E9fono (Ej: 04121234567)">
            <input id="new-pm-cedula" type="text" class="w-full p-3 border rounded mb-2 text-sm" placeholder="C\u00E9dula (Ej: V12345678)">
            <select id="new-pm-banco" class="w-full p-3 border rounded mb-3 text-sm"></select>
            <button onclick="guardarNuevoPM()" type="button" class="w-full bg-green-600 text-white font-bold p-3 rounded">GUARDAR PAGO M\u00D3VIL</button>
        `;
        const sel = document.getElementById('new-pm-banco');
        sel.innerHTML = '<option value="">Seleccione Banco...</option>';
        if (typeof VENEZUELA_BANKS !== 'undefined') {
            VENEZUELA_BANKS.sort().forEach(b => sel.innerHTML += `<option value="${b}">${b}</option>`);
        }
    } else {
        contentDiv.innerHTML = `
            <div class="bg-gray-100 p-3 rounded mb-4 text-center border border-gray-300">
                <p class="text-[10px] text-gray-500 font-bold uppercase">Cuenta Destino Guardada</p>
                <p class="text-sm font-black text-gray-800">${userSavedPM.banco} | ${userSavedPM.telefono}</p>
                <p class="text-xs text-gray-600">${userSavedPM.cedula}</p>
            </div>
            
            <label class="block text-xs font-bold text-gray-500 mb-1">Monto a retirar (Min: ${MIN_WITHDRAWAL} Bs):</label>
            <input id="w-amount-input" type="number" min="${MIN_WITHDRAWAL}" class="w-full p-3 border-2 border-gray-300 rounded-lg text-xl font-bold text-center mb-4 focus:border-blue-500" placeholder="0.00">
            
            <div class="space-y-3">
                <button type="button" onclick="procesarRetiroFase2('flash')" class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-xl shadow-lg border-b-4 border-orange-700 text-left relative overflow-hidden transition transform active:scale-95">
                    <h4 class="font-black text-red-900 flex items-center"><i class="fas fa-bolt text-xl mr-2 animate-pulse"></i> RETIRO FLASH (15 Mins)</h4>
                    <div class="flex justify-between items-end mt-1 border-t border-orange-400/50 pt-1">
                        <span class="text-[10px] text-red-900 font-bold">Comisi\u00F3n 15%</span>
                        <div class="text-right">
                            <span class="text-[9px] text-orange-100 block">Recibes aprox:</span>
                            <span id="flash-preview" class="font-black text-white">0.00 Bs</span>
                        </div>
                    </div>
                </button>

                <button type="button" onclick="procesarRetiroFase2('normal')" class="w-full bg-gray-100 text-gray-700 p-3 rounded-xl border-2 border-gray-300 text-left transition transform active:scale-95">
                    <h4 class="font-bold text-gray-800 flex items-center"><i class="fas fa-clock mr-2 text-gray-400"></i> Retiro Est\u00E1ndar (48 Hrs)</h4>
                    <div class="flex justify-between items-end mt-1 border-t border-gray-200 pt-1">
                        <span class="text-[10px] text-green-600 font-bold bg-green-100 px-1 rounded">0% Comisi\u00F3n</span>
                        <div class="text-right">
                            <span class="text-[9px] text-gray-500 block">Recibes:</span>
                            <span id="normal-preview" class="font-bold text-gray-800">0.00 Bs</span>
                        </div>
                    </div>
                </button>
            </div>
        `;

        document.getElementById('w-amount-input').addEventListener('input', function() {
            const val = parseFloat(this.value) || 0;
            document.getElementById('flash-preview').textContent = (val * (1 - FLASH_FEE_PERCENT)).toFixed(2) + ' Bs';
            document.getElementById('normal-preview').textContent = val.toFixed(2) + ' Bs';
        });
    }
}

async function guardarNuevoPM() {
    const tlf = document.getElementById('new-pm-tlf').value.trim();
    const cedula = document.getElementById('new-pm-cedula').value.trim();
    const banco = document.getElementById('new-pm-banco').value;

    if (tlf.length < 10 || !cedula || !banco) return alert("Completa todos los datos.");

    try {
        const checkRef = await db.ref(`pago_movil_registrados/${tlf}`).once('value');
        if (checkRef.exists() && checkRef.val().uid !== auth.currentUser.uid) {
            alert("\u26A0\uFE0F ERROR: Este n\u00FAmero ya est\u00E1 asociado a otra cuenta. Evita fraudes.");
            return;
        }

        const uid = auth.currentUser.uid;
        const updates = {};
        updates[`users/${uid}/pago_movil_guardado`] = { telefono: tlf, cedula: cedula, banco: banco };
        updates[`pago_movil_registrados/${tlf}`] = { uid: uid, timestamp: firebase.database.ServerValue.TIMESTAMP };

        await db.ref().update(updates);
        alert("\u2705 Cuenta vinculada exitosamente.");
        renderWithdrawalUI();

    } catch (e) {
        alert("Error al guardar: " + e.message);
    }
}

async function procesarRetiroFase2(tipo) {
    const inputMonto = document.getElementById('w-amount-input');
    const monto = parseFloat(inputMonto.value);

    if (!monto || isNaN(monto)) return alert("Ingresa un monto v\u00E1lido.");
    if (monto < MIN_WITHDRAWAL) return alert(`El retiro m\u00EDnimo es de ${MIN_WITHDRAWAL} Bs.`);
    if (monto > userBalance) return alert("Saldo insuficiente.");

    const recibir = tipo === 'flash' ? monto * (1 - FLASH_FEE_PERCENT) : monto;
    const confirmMsg = tipo === 'flash' 
        ? `\u26A1 RETIRO FLASH\n\nSe debitar\u00E1n ${monto.toFixed(2)} Bs de tu saldo.\nComisi\u00F3n 15%\nRecibir\u00E1s: ${recibir.toFixed(2)} Bs\n\n\u00BFConfirmar transacci\u00F3n?`
        : `\u23F2\uFE0F RETIRO EST\u00C1NDAR\n\nSe retirar\u00E1n ${monto.toFixed(2)} Bs sin comisi\u00F3n.\n\u00BFConfirmar transacci\u00F3n?`;

    if (!confirm(confirmMsg)) return;

    try {
        const uid = auth.currentUser.uid;
        const now = new Date(Date.now() + serverTimeOffset);
        
        let estimatedTime = new Date(now);
        if (tipo === 'flash') {
            estimatedTime.setMinutes(now.getMinutes() + 15);
        } else {
            estimatedTime.setHours(now.getHours() + 48); 
        }

        const transData = {
            amount: monto,
            amount_to_receive: recibir,
            type: tipo,
            tlf: userSavedPM.telefono,
            cedula: userSavedPM.cedula,
            banco: userSavedPM.banco,
            uid: uid,
            name: auth.currentUser.displayName,
            status: 'PENDING',
            request_timestamp: firebase.database.ServerValue.TIMESTAMP,
            estimated_process_timestamp: estimatedTime.getTime()
        };

        await db.ref(`users/${uid}/balance`).transaction(c => (c || 0) - monto);
        await db.ref(`users/${uid}/balance_pending_withdrawal`).transaction(c => (c || 0) + monto);
        await db.ref('withdrawal_requests').push(transData);

        alert("\u2705 \u00A1Solicitud enviada! Revisa el progreso en tu pantalla principal.");
        document.getElementById('withdraw-form-area').style.display = 'none';

    } catch (e) {
        alert("Ocurri\u00F3 un error: " + e.message);
    }
}
