// notificaciones_admin.js - Versión Final Corregida
(function() {
    const TG_TOKEN = "8403562146:AAGHvr0TAtxAT0f05XL6qNkuEUdD_rypxcc";
    const TG_CHAT_ID = "701341917";

    function enviarTG(txt) {
        const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(txt)}&parse_mode=HTML`;
        fetch(url).catch(() => {});
    }

    const monitorear = () => {
        // Buscamos la variable 'db' que ya definiste en tu HTML
        if (typeof db === 'undefined') return setTimeout(monitorear, 2000);
        
        console.log("Bot de Telegram: Escuchando base de datos...");

        // 1. Notificar Retiros (Vigilando el nodo que definiste en las reglas)
        db.ref('withdrawal_requests').on('child_added', (snap) => {
            const data = snap.val();
            // Solo avisar si es nuevo (menos de 2 minutos de antigüedad)
            if (data && data.status === 'PENDING' && (Date.now() - (data.timestamp || 0) < 120000)) {
                const msg = `\uD83D\uDD14 <b>NUEVA SOLICITUD DE RETIRO</b>\n\n` +
                            `\uD83D\uDC64 Usuario: ${data.name}\n` +
                            `\uD83D\uDCB0 Monto: Bs. ${data.amount}\n` +
                            `\uD83C\uDFE6 Banco: ${data.banco || 'No indicado'}\n` +
                            `\uD83D\uDD17 <a href="https://wa.me/58${(data.tlf || data.userPhone || '').replace(/\D/g,'')}">Contactar Cliente</a>`;
                enviarTG(msg);
            }
        });

        // 2. Notificar Bingo
        db.ref('bingo_aprobados_estelar').on('child_added', (snap) => {
            const b = snap.val();
            // Solo si es una venta de este momento
            if (b && (Date.now() - (b.timestamp || 0) < 60000)) {
                enviarTG(`\uD83C\uDFAB <b>CART\u00D3N VENDIDO</b>\n\n🆔 ID: ${b.id}\n📅 Sorteo: ${b.date}`);
            }
        });
    };

    monitorear();
})();
