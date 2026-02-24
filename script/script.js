document.getElementById('cryptoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const crypto = document.getElementById('crypto').value.toUpperCase();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!crypto || !date || !time) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Converte a data e hora local para Timestamp Unix (segundos)
    const dateTimeString = `${date}T${time}`;
    const timestamp = Math.floor(new Date(dateTimeString).getTime() / 1000);

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "Buscando cotação...";

    try {
        // Chamada para a nova rota get_price.js com os parâmetros corrigidos
        const response = await fetch(`/api/get_price?crypto=${crypto}&timestamp=${timestamp}`);
        
        // Se a Vercel ainda der 404, o erro cairá aqui antes de tentar ler o JSON
        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status} (Verifique se o arquivo get_price.js está na pasta api)`);
        }

        const data = await response.json();

        if (data.Data && data.Data.Data && data.Data.Data.length > 0) {
            const price = data.Data.Data[0].close;
            resultDiv.innerHTML = `
                <div class="card p-3 mt-3">
                    <h5>Resultado para ${crypto}</h5>
                    <p><strong>Data/Hora:</strong> ${date} ${time}</p>
                    <p><strong>Preço:</strong> R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<p class="text-danger">Cotação não encontrada para esta data.</p>`;
        }
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        resultDiv.innerHTML = `<p class="text-danger">Erro ao carregar dados. Verifique o console.</p>`;
    }
});