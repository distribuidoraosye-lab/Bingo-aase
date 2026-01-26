// notificaciones_admin.js
(function() {
    const TOKEN_TG = "8403562146:AAGHvr0TAtxAT0f05XL6qNkuEUdD_rypxcc";
    const CHAT_ID_TG = "701341917";

    function enviarTelegram(mensaje) {
        const url = `https://api.telegram.org/bot${TOKEN_TG}/sendMessage?chat_id=${CHAT_ID_TG}&text=${encodeURIComponent(mensaje)}&parse_mode=HTML`;
        fetch(url).catch(() => {});
    }

    // Esperar a que Firebase esté listo en la página principal
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            clearInterval(checkFirebase);
            iniciarEscuchadores();
        }
    }, 2000);

    function iniciarEscuchadores() {
        const db_tg = firebase.database();

        // 1. Monitor de Retiros (Nuevos registros)
        db_tg.ref('withdrawal_requests').on('child_added', (snapshot) => {
            const r = snapshot.val();
            if (r && r.status === 'PENDING') {
                const msg = `\uD83D\uDD14 <b>NUEVA SOLICITUD DE RETIRO</b>\n\n👤 ${r.name}\n💰 Bs. ${r.amount}\n🏦 ${r.banco}\n📱 ${r.tlf || r.userPhone}\n🔗 <a href="https://wa.me/58${(r.tlf || r.userPhone).replace(/\D/g,'')}">WhatsApp</a>`;
                enviarTelegram(msg);
            }
        });

        // 2. Monitor de Ventas de Bingo
        db_tg.ref('bingo_aprobados_estelar').on('child_added', (snapshot) => {
            const b = snapshot.val();
            if (b) {
                enviarTelegram(`\uD83C\uDFAB <b>BINGO VENDIDO</b>\n\n🆔 ID: ${b.id}\n📅 Fecha: ${b.date}`);
            }
        });

        // 3. Monitor de Calificación (10 min después del sorteo)
        setInterval(() => {
            const ahora = new Date();
            const ccs = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Caracas"}));
            if (ccs.getMinutes() === 10) {
                const h = ccs.getHours();
                let sorteo = h > 12 ? (h - 12) + ":00 PM" : h + ":00 AM";
                if(h === 12) sorteo = "12:00 PM";
                if(h === 0) sorteo = "12:00 AM";

                const hoyStr = `${String(ccs.getDate()).padStart(2,'0')}-${String(ccs.getMonth()+1).padStart(2,'0')}-${ccs.getFullYear()}`;
                
                // Revisar si hay jugadas pendientes para avisar
                db_tg.ref(`bets_animalitos/${hoyStr}`).once('value', s => {
                    let pend = false;
                    if(s.exists()) {
                        s.forEach(u => u.forEach(bs => {
                            if(bs.val().time.includes(sorteo) && bs.val().status === 'PENDING') pend = true;
                        }));
                    }
                    if(pend) enviarTelegram(`\u23F0 <b>AVISO</b>\n\nHay jugadas de las ${sorteo} pendientes por calificar.`);
                });
            }
        }, 60000);
    }
})();
