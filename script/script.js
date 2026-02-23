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
        // MUDANÇA AQUI: Agora chamamos nossa própria API interna
        // Passamos apenas os parâmetros necessários, a chave fica guardada no servidor.
        const response = await fetch(`/api/cotacao?crypto=${crypto}&timestamp=${timestamp}`);
        
        if (!response.ok) throw new Error("Erro na resposta do servidor");

        const result = await response.json();
        const candles = result?.Data?.Data;

        if (!candles || candles.length === 0) {
            mostrarNotificacao("Dados não encontrados para esta consulta.", "is-danger");
            return;
        }

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
        console.error("Erro:", error);
        mostrarNotificacao("Erro ao buscar dados. Verifique se o servidor local está rodando.", "is-danger");
    }
});

// ... (Mantenha suas funções atualizarTabela, exportToExcel, exportToPDF e mostrarNotificacao iguais)

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

document.getElementById("clearButton").addEventListener("click", () => {
    registros = [];
    atualizarTabela();
    mostrarNotificacao("Consulta limpa com sucesso.", "is-info");
});