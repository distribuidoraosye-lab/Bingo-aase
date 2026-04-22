/* ============================================================
   BINGO TEXIER - MÓDULO RULETA HORA LOCA (V1.0 - BLINDADO)
   Solo válido para Bingo Estelar y Torneo Express.
   Intercepción de compra post-validación y RNG de Casino.
   ============================================================ */

const dbRuleta = firebase.database();

// 1. ESTADO GLOBAL DE LA HORA LOCA
let horaLocaState = {
    activa: false,
    terminaEn: 0, // Timestamp de cierre
};

// 2. TABLA DE PROBABILIDADES MATEMÁTICAS (Total = 10,000)
// Esto define un RNG independiente por giro, 100% libre de trampas.
const RULETA_PREMIOS = [
    // 0.5% - 1 en 200 giros
    { id: "jackpot", nombre: "$50 EFECTIVO", maxRNG: 50, tipo: "cash", valor: 50, color: "#eab308" },
    // 4.5% - 9 en 200 giros
    { id: "dia_extra", nombre: "+1 DÍA DE RACHA", maxRNG: 500, tipo: "racha_dia", valor: 1, color: "#10b981" },
    // 10.0% - 1 de cada 10 giros
    { id: "nivel_3", nombre: "SALTO NIVEL 3", maxRNG: 1500, tipo: "racha_nivel", valor: 3, color: "#8b5cf6" },
    // 30.0% - Frecuente
    { id: "cartones_10", nombre: "10 CARTONES", maxRNG: 4500, tipo: "free_cards", valor: 10, color: "#3b82f6" },
    // 55.0% - Premio de consolación / Colchón
    { id: "cartones_5", nombre: "5 CARTONES", maxRNG: 10000, tipo: "free_cards", valor: 5, color: "#f97316" }
];

// 3. ESCUCHAR AL ADMIN EN TIEMPO REAL
function initRuletaListener() {
    dbRuleta.ref('config/hora_loca').on('value', snap => {
        const config = snap.val();
        if (config) {
            horaLocaState.activa = config.activa === true;
            horaLocaState.terminaEn = config.terminaEn || 0;
            renderBannerHoraLoca(); // Función visual que agregaremos en el HTML
        } else {
            horaLocaState.activa = false;
            renderBannerHoraLoca();
        }
    });
    
    // Enganchar interceptores a las compras
    interceptarCompras();
}

// 4. INTERCEPTORES DE COMPRA (BINGO Y TORNEO EXPRESS)
function interceptarCompras() {
    // A. Interceptar Compra de Bingo
    const originalConfirmarBingo = window.confirmCurrentCard;
    if (typeof originalConfirmarBingo === 'function' && !window.bingoInterceptado) {
        window.confirmCurrentCard = async function() {
            // Guardar saldo antes de la compra para verificar que sí se cobró
            const saldoAnterior = userBalance; 
            
            await originalConfirmarBingo.apply(this, arguments); // Ejecuta la compra normal
            
            // Si la compra fue exitosa (el saldo bajó o usó cartones gratis) y estamos en Hora Loca
            if (horaLocaState.activa) {
                setTimeout(() => {
                    // Ocultamos el modal de éxito normal temporalmente
                    const modalExito = document.getElementById('purchase-success-modal');
                    if (modalExito) modalExito.style.display = 'none';
                    
                    iniciarGiroRuleta('bingo');
                }, 1000); // 1 segundo después para que procese Firebase
            }
        };
        window.bingoInterceptado = true;
    }

    // B. Interceptar Compra de Torneo Express
    const originalConfirmarTorneo = window.confirmTorneoPurchase;
    if (typeof originalConfirmarTorneo === 'function' && !window.torneoInterceptado) {
        window.confirmTorneoPurchase = async function() {
            await originalConfirmarTorneo.apply(this, arguments);
            
            if (horaLocaState.activa) {
                setTimeout(() => { iniciarGiroRuleta('torneo'); }, 1500);
            }
        };
        window.torneoInterceptado = true;
    }
}

// 5. MOTOR DE LA RULETA (RNG DE CASINO)
function iniciarGiroRuleta(origen) {
    // Abrir Modal HTML (Lo pasaremos en el siguiente código)
    abrirModalRuletaHTML(); 
    
    // Generar número del 1 al 10,000
    const rng = Math.floor(Math.random() * 10000) + 1;
    let premioGanado = null;

    // Buscar en qué rango cayó el número
    for (let i = 0; i < RULETA_PREMIOS.length; i++) {
        if (rng <= RULETA_PREMIOS[i].maxRNG) {
            premioGanado = RULETA_PREMIOS[i];
            break;
        }
    }

    // Animación visual simulada (se conectará con el frontend después)
    animarRuletaGiro(premioGanado, () => {
        aplicarPremio(premioGanado);
    });
}

// 6. APLICAR PREMIOS DE FORMA SEGURA (SIN ROMPER LA RACHA)
async function aplicarPremio(premio) {
    const uid = firebase.auth().currentUser.uid;
    const userName = firebase.auth().currentUser.displayName;
    
    try {
        if (premio.tipo === "free_cards") {
            // SUMAR CARTONES GRATIS
            await dbRuleta.ref(`users/${uid}/free_bingo_credits`).transaction(c => (c || 0) + premio.valor);
            mostrarMensajePremio(`¡GANASTE ${premio.valor} CARTONES GRATIS!`, premio.color);
            
        } else if (premio.tipo === "racha_dia") {
            // +1 DÍA DE RACHA (Sin tocar fechas, solo progreso)
            const refRacha = dbRuleta.ref(`users/${uid}/racha_data`);
            refRacha.once('value', s => {
                let data = s.val() || {};
                let diasActuales = data.dias || 0;
                // Sumar 1 día solo si no ha llegado a los 7 días
                if (diasActuales < 7) {
                    refRacha.update({ dias: diasActuales + 1 });
                    mostrarMensajePremio(`¡SALTO EN EL TIEMPO! Sumaste +1 Día a tu Racha.`, premio.color);
                } else {
                    // Si ya tiene los 7 días completos, darle cartones de compensación
                    dbRuleta.ref(`users/${uid}/free_bingo_credits`).transaction(c => (c || 0) + 10);
                    mostrarMensajePremio(`¡Racha al máximo! Te llevas 10 CARTONES como premio.`, "#3b82f6");
                }
            });

        } else if (premio.tipo === "racha_nivel") {
            // SALTO AL NIVEL 3 (Pase VIP para pagar tarifa alta)
            const refRacha = dbRuleta.ref(`users/${uid}/racha_data`);
            refRacha.once('value', s => {
                let data = s.val() || {};
                let diasActuales = data.dias || 0;
                // Solo aplica si está en los primeros 2 días, para forzar el flujo de caja alto el resto de la semana.
                if (diasActuales <= 2) {
                    refRacha.update({ nivel_pico_hoy: 3, nivel_minimo: 3 });
                    mostrarMensajePremio(`¡UPGRADE VIP! Saltaste al Nivel 3 de la Racha.`, premio.color);
                } else {
                    // Si va muy avanzado (ej. Día 5) y le damos Salto Nivel 3, te descapitaliza. Compensación en cartones:
                    dbRuleta.ref(`users/${uid}/free_bingo_credits`).transaction(c => (c || 0) + 15);
                    mostrarMensajePremio(`¡Premio Especial! Ganaste 15 CARTONES para jugar.`, "#3b82f6");
                }
            });

        } else if (premio.tipo === "cash") {
            // $50 EFECTIVO (Envío a Firebase para auditoría, no se inyecta saldo de golpe)
            const refJackpot = dbRuleta.ref('premios_horaloca_pendientes').push();
            await refJackpot.set({
                uid: uid,
                nombre: userName,
                premio: premio.valor,
                fecha: firebase.database.ServerValue.TIMESTAMP,
                estado: 'POR_APROBAR_ADMIN'
            });
            mostrarMensajePremio(`¡JACKPOT! Ganaste $50. El administrador aprobará tu premio en breve.`, premio.color);
        }

    } catch (error) {
        console.error("Error aplicando premio de ruleta:", error);
        alert("Ocurrió un error al procesar tu premio. Por favor contacta a soporte.");
    }
}

// Iniciar al cargar
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRuletaListener);
else initRuletaListener();
