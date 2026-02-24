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
        
        const response = await fetch(`/api/get_price?crypto=${crypto}&timestamp=${timestamp}`);
        
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

function exportToExcel() {
    // Verifica se a biblioteca XLSX existe
    if (typeof XLSX === 'undefined') {
        alert("Erro: Biblioteca de Excel não carregada.");
        return;
    }
    const table = document.querySelector("table");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Cotações" });
    XLSX.writeFile(wb, "Cripto_S3C.xlsx");
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const table = document.querySelector("table");

    if (!table || table.rows.length <= 1) {
        alert("Não há dados na tabela para exportar.");
        return;
    }

    // Título do PDF
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Relatório de Cotações - S3C", 14, 20);

    // Gerar a tabela automaticamente com AutoTable
    // Ele pega os dados direto do HTML e aplica um estilo limpo
    doc.autoTable({
        html: 'table',
        startY: 30,
        theme: 'grid', // Estilo com linhas de grade
        headStyles: { 
            fillColor: [255, 255, 255], // Fundo branco no cabeçalho
            textColor: [0, 0, 0],       // Letras pretas
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
        },
        bodyStyles: { 
            fillColor: [255, 255, 255], // Fundo branco nas células
            textColor: [0, 0, 0]        // Letras pretas
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]  // Cinza bem clarinho intercalado para facilitar leitura
        },
        margin: { top: 30 }
    });

    // Salvar o arquivo
    doc.save("Consulta_Cripto_S3C.pdf");
}