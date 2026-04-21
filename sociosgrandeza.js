/* ============================================================
   BINGO TEXIER - MÓDULO DE SOCIOS (10% AUTOMÁTICO)
   Independiente y Blindado - Cero toques al Core
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar módulo cuando el usuario se loguea
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            iniciarPanelSocio(user);
            interceptarBotonRecarga(user);
            interceptarComprasParaComision();
        }
    });
});

// --- FUNCIONES DE INTERFAZ Y DATOS ---
function iniciarPanelSocio(user) {
    // Mostrar su número como código
    const telDisplay = document.getElementById('mi-codigo-socio');
    if (telDisplay) telDisplay.textContent = user.email.split('@');

    // Escuchar el saldo de sus comisiones en tiempo real
    firebase.database().ref(`users/${user.uid}/saldo_socio`).on('value', snapshot => {
        const saldoSocio = snapshot.val() || 0;
        const formated = saldoSocio.toFixed(2);
        
        const displayBanner = document.getElementById('saldo-socio-display');
        const displayPanel = document.getElementById('panel-saldo-socio');
        
        if (displayBanner) displayBanner.textContent = `${formated} Bs`;
        if (displayPanel) displayPanel.innerHTML = `${formated} <span class="text-lg">Bs</span>`;
        
        // Efecto visual si gana dinero mientras juega
        if (displayBanner && saldoSocio > 0) {
            displayBanner.classList.remove('text-green-400');
            displayBanner.classList.add('text-white', 'bg-green-500');
            setTimeout(() => {
                displayBanner.classList.remove('text-white', 'bg-green-500');
                displayBanner.classList.add('text-green-400');
            }, 2000);
        }
    });
}

// --- EL INTERCEPTOR DE RECARGAS (El "Seguro") ---
function interceptarBotonRecarga(user) {
    // Esperamos 2 segundos a que el script original cargue los botones
    setTimeout(() => {
        const btnRecarga = document.getElementById('recharge-btn');
        if (!btnRecarga) return;

        // Guardamos la función original que abre el modal de pago
        const eventoOriginal = btnRecarga.onclick;

        // Sobrescribimos el botón temporalmente
        btnRecarga.onclick = async (e) => {
            const dbRef = firebase.database().ref();
            const uSnap = await dbRef.child(`users/${user.uid}`).once('value');
            const uData = uSnap.val() || {};

            // Si ya tiene padrino, o si dijo "nadie", lo dejamos pasar normal
            if (uData.referido_por) {
                eventoOriginal(e);
                return;
            }

            // Validar si es nuevo: ¿Ya tiene depósitos aprobados?
            const refSnap = await dbRef.child('referencias_usadas').orderByChild('uid').equalTo(user.uid).once('value');
            if (refSnap.exists()) {
                // Ya es cliente viejo, le sellamos el perfil sin padrino para que no le vuelva a salir
                await dbRef.child(`users/${user.uid}`).update({ referido_por: 'ninguno' });
                eventoOriginal(e);
                return;
            }

            // ¡Es usuario nuevo! Le lanzamos la ventana de intercepción
            document.getElementById('modal-intercepcion-padrino').style.display = 'flex';
            
            // Guardamos la ruta de escape por si decide saltar o termina de vincular
            window.continuarHaciaRecarga = () => {
                document.getElementById('modal-intercepcion-padrino').style.display = 'none';
                eventoOriginal(e);
            };
        };
    }, 2000);
}

// Funciones de los botones del modal de intercepción
window.saltarPadrino = async () => {
    const uid = firebase.auth().currentUser.uid;
    await firebase.database().ref(`users/${uid}`).update({ referido_por: 'ninguno' });
    window.continuarHaciaRecarga(); // Sigue a pagar
};

window.vincularYContinuar = async () => {
    const uid = firebase.auth().currentUser.uid;
    const inputTlf = document.getElementById('input-padrino').value.trim();
    const errorMsg = document.getElementById('error-padrino');
    const btn = document.getElementById('btn-vincular-padrino');

    errorMsg.classList.add('hidden');
    if (inputTlf.length < 7) { errorMsg.textContent = "Número inválido."; errorMsg.classList.remove('hidden'); return; }

    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const snap = await firebase.database().ref('users').orderByChild('phone').equalTo(inputTlf).once('value');
        if (!snap.exists()) throw new Error("Ese número no pertenece a ningún Socio activo.");
        
        let amigoUid = null;
        snap.forEach(child => { amigoUid = child.key; });
        if (amigoUid === uid) throw new Error("No puedes usar tu propio número.");

        await firebase.database().ref(`users/${uid}`).update({
            referido_por: amigoUid,
            fecha_vinculacion: firebase.database.ServerValue.TIMESTAMP
        });

        alert("✅ ¡Vinculado con éxito!");
        window.continuarHaciaRecarga(); // Sigue a pagar

    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
        btn.disabled = false; btn.innerHTML = 'VINCULAR SOCIO';
    }
}

// --- EL MOTOR DE COMISIONES (10% Automático) ---
function interceptarComprasParaComision() {
    setTimeout(() => {
        // 1. Envolver la compra de Bingo Estelar
        if (typeof window.confirmCurrentCard === 'function') {
            const originalBingo = window.confirmCurrentCard;
            window.confirmCurrentCard = async () => {
                const saldoAntes = typeof userBalance !== 'undefined' ? userBalance : 0;
                await originalBingo(); // Ejecuta tu código original intacto
                setTimeout(() => calcularYEmitirComision(saldoAntes), 1000); // Evalúa si gastó dinero
            };
        }

        // 2. Envolver la compra de Animalitos Clásicos / Tripletas
        if (typeof window.placeBet === 'function') {
            const originalAnimalitos = window.placeBet;
            window.placeBet = async () => {
                const saldoAntes = typeof userBalance !== 'undefined' ? userBalance : 0;
                await originalAnimalitos(); // Ejecuta tu código original intacto
                setTimeout(() => calcularYEmitirComision(saldoAntes), 1000); // Evalúa si gastó dinero
            };
        }
        
        // 3. Envolver la compra de Torneo Express
        if (typeof window.confirmTorneoPurchase === 'function') {
            const originalTorneo = window.confirmTorneoPurchase;
            window.confirmTorneoPurchase = async () => {
                const saldoAntes = typeof userBalance !== 'undefined' ? userBalance : 0;
                await originalTorneo(); // Ejecuta tu código original intacto
                setTimeout(() => calcularYEmitirComision(saldoAntes), 1000); // Evalúa si gastó dinero
            };
        }
    }, 2500);
}

// La calculadora silenciosa
async function calcularYEmitirComision(saldoAntes) {
    const uid = firebase.auth().currentUser.uid;
    const saldoAhora = typeof userBalance !== 'undefined' ? userBalance : 0;
    const gastoReal = saldoAntes - saldoAhora;

    // Si efectivamente se descontó dinero de su cuenta (compró algo con éxito)
    if (gastoReal > 0) {
        const uSnap = await firebase.database().ref(`users/${uid}/referido_por`).once('value');
        const padrinoUid = uSnap.val();

        // Si tiene un padrino válido, le pagamos el 10%
        if (padrinoUid && padrinoUid !== 'ninguno') {
            const comision = gastoReal * 0.10; // 10% Fijo
            const refPadrino = firebase.database().ref(`users/${padrinoUid}/saldo_socio`);
            // Operación segura atómica en Firebase
            refPadrino.transaction(actual => (actual || 0) + comision);
        }
    }
}

// --- FUNCIÓN DEL BOTÓN PARA COBRAR LA COMISIÓN ---
window.transferirComision = async () => {
    const uid = firebase.auth().currentUser.uid;
    const refSocio = firebase.database().ref(`users/${uid}/saldo_socio`);
    const refBalance = firebase.database().ref(`users/${uid}/balance`);
    const btn = document.getElementById('btn-transferir-comision');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';

    try {
        const snap = await refSocio.once('value');
        const saldoSocio = snap.val() || 0;

        if (saldoSocio < 1) throw new Error("Mínimo 1 Bs para transferir.");

        // Pasamos el saldo de socio a cero y lo sumamos a su billetera principal
        await refSocio.set(0);
        await refBalance.transaction(b => (b || 0) + saldoSocio);
        
        document.getElementById('modal-socios').style.display = 'none';
        alert(`✅ ¡Excelente! Se sumaron Bs ${saldoSocio.toFixed(2)} a tu billetera principal.`);
    } catch (e) {
        alert(e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-exchange-alt"></i> PASAR A MI BILLETERA';
    }
};
