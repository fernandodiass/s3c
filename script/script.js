const form = document.getElementById("quoteForm");
const tbody = document.getElementById("resultTableBody");
const notificationContainer = document.getElementById("notificationContainer");
let registros = [];

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const crypto = document.getElementById("crypto").value.trim().toUpperCase();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!crypto || !date || !time) {
        mostrarNotificacao("Preencha todos os campos.", "is-warning");
        return;
    }

    const dateTime = new Date(`${date}T${time}:00`);
    const agora = new Date();

    if (dateTime > agora) {
        mostrarNotificacao("Ainda não posso viajar no futuro.", "is-warning");
        return;
    }

    const timestamp = Math.floor(dateTime.getTime() / 1000);

    try {
        // CORREÇÃO: Usando 'crypto' e 'timestamp' para bater com o backend
        const response = await fetch(`api/cotacao?crypto=${crypto}&timestamp=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        const candles = result?.Data?.Data;

        if (!candles || candles.length === 0) {
            mostrarNotificacao("Dados não encontrados para esta consulta.", "is-danger");
            return;
        }

        // Pega o candle mais próximo do horário solicitado
        const candle = candles.find(c => c.time <= timestamp) || candles[0];

        const valor = candle.close.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const registro = {
            code: crypto,
            date: dateTime.toLocaleDateString("pt-BR"),
            time: dateTime.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
            value: valor
        };

        registros.push(registro);
        atualizarTabela();
        mostrarNotificacao("Cotação adicionada com sucesso!", "is-success");

    } catch (error) {
        console.error("Erro detalhado:", error);
        mostrarNotificacao("Erro ao buscar dados. Verifique se o arquivo api/cotacao.js existe.", "is-danger");
    }
});

function atualizarTabela() {
    tbody.innerHTML = registros.map(reg =>
        `<tr>
            <td>${reg.code}</td>
            <td>${reg.date}</td>
            <td>${reg.time}</td>
            <td>${reg.value}</td>
        </tr>`).join('');

    document.querySelector(".table-container").style.display = registros.length > 0 ? "block" : "none";
}

function mostrarNotificacao(mensagem, tipo = "is-info") {
    const notification = document.createElement("div");
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${mensagem}
    `;

    notification.querySelector(".delete").addEventListener("click", () => {
        notification.remove();
    });

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Funções de Exportação
function exportToExcel() {
    if (registros.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(registros);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cotações");
    XLSX.writeFile(workbook, "cotacoes.xlsx");
}

function exportToPDF() {
    if (registros.length === 0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Histórico de Cotações", 10, 10);
    let y = 20;
    registros.forEach(reg => {
        doc.text(`${reg.code} - ${reg.date} ${reg.time} - ${reg.value}`, 10, y);
        y += 10;
    });
    doc.save("cotacoes.pdf");
}

document.getElementById("clearButton").addEventListener("click", () => {
    registros = [];
    atualizarTabela();
    mostrarNotificacao("Consulta limpa.", "is-info");
});