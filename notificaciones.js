// notificaciones_admin.js (ACTUALIZADO)
(function() {
    const TOKEN_TG = "8403562146:AAGHvr0TAtxAT0f05XL6qNkuEUdD_rypxcc";
    const CHAT_ID_TG = "701341917";

    function enviarTelegram(mensaje) {
        const url = `https://api.telegram.org/bot${TOKEN_TG}/sendMessage?chat_id=${CHAT_ID_TG}&text=${encodeURIComponent(mensaje)}&parse_mode=HTML`;
        fetch(url).catch(() => console.log("Error al contactar a Telegram"));
    }

    // Función para iniciar cuando Firebase esté listo
    function conectarFirebase() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            console.log("Notificaciones Admin: Firebase detectado. Conectando...");
            const db_tg = firebase.database();

            // 1. Monitor de Retiros (Vigila cambios en tiempo real)
            db_tg.ref('withdrawal_requests').on('child_added', (snapshot) => {
                const r = snapshot.val();
                // Solo notificar si es PENDING y ocurrió hace menos de 5 minutos (para evitar spam al cargar)
                const ahoraMs = Date.now();
                if (r && r.status === 'PENDING' && (ahoraMs - r.timestamp < 300000)) {
                    const msg = `\uD83D\uDD14 <b>NUEVA SOLICITUD DE RETIRO</b>\n\n` +
                                `👤 Usuario: ${r.name}\n` +
                                `💰 Monto: Bs. ${r.amount}\n` +
                                `🏦 Banco: ${r.banco}\n` +
                                `📱 Tlf: ${r.tlf || r.userPhone}\n` +
                                `🔗 <a href="https://wa.me/58${(r.tlf || r.userPhone).replace(/\D/g,'')}">WhatsApp</a>`;
                    enviarTelegram(msg);
                }
            });

            // 2. Monitor de Bingo
            db_tg.ref('bingo_aprobados_estelar').on('child_added', (snapshot) => {
                const b = snapshot.val();
                if (b && b.timestamp && (Date.now() - b.timestamp < 60000)) {
                    enviarTelegram(`\uD83C\uDFAB <b>BINGO VENDIDO</b>\n\n🆔 ID: ${b.id}\n📅 Fecha: ${b.date}`);
                }
            });

            // 3. Monitor de Recargas MacroDroid (Detección de child_changed)
            db_tg.ref('pagos_entrantes').on('child_changed', (snapshot) => {
                const p = snapshot.val();
                if (p && p.status === 'claimed') {
                    enviarTelegram(`\u2705 <b>RECARGA AUTOM\u00C1TICA EXITOSA</b>\n\n💰 Monto: Bs. ${p.monto || 'Confirmado'}\n📝 Msg: ${p.mensaje_banco}`);
                }
            });

        } else {
            // Si no está listo, intentar de nuevo en 2 segundos
            setTimeout(conectarFirebase, 2000);
        }
    }

    // Iniciar proceso
    conectarFirebase();
})();
