document.getElementById('quoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const crypto = document.getElementById('crypto').value.toUpperCase();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!crypto || !date || !time) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // CONVERSÃO DE DATA PARA TIMESTAMP (Exigido pela API para histórico)
    const dateTime = new Date(`${date}T${time}`);
    const timestamp = Math.floor(dateTime.getTime() / 1000);

    try {
        // EM VEZ DE: https://min-api.cryptocompare.com/...
        // NÓS CHAMAMOS: Nossa própria rota interna que esconde a chave
        const response = await fetch(`/api/cotacao?coin=${crypto}&ts=${timestamp}`);
        const data = await response.json();

        if (data[crypto]) {
            exibirResultado(crypto, date, time, data[crypto].BRL);
        } else {
            alert("Moeda não encontrada ou erro na API.");
        }
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
});

function exibirResultado(coin, date, time, price) {
    const tableContainer = document.getElementById('tableContainer');
    const tbody = document.getElementById('resultTableBody');
    
    tableContainer.style.display = 'block';
    
    const row = `
        <tr>
            <td>${coin}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
    `;
    tbody.innerHTML += row;
}

// Lógica do botão limpar
document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('resultTableBody').innerHTML = '';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('quoteForm').reset();
});