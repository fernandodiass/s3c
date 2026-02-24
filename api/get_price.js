// api/get_price.js

export default async function handler(request, response) {
    // 1. Extrai os parâmetros da URL (enviados pelo fetch do script.js)
    const { crypto, timestamp } = request.query;

    // 2. Validação básica para evitar chamadas vazias
    if (!crypto || !timestamp) {
        return response.status(400).json({ 
            error: "Parâmetros ausentes. Esperado: crypto e timestamp." 
        });
    }

    // 3. Pega a sua chave de API das variáveis de ambiente da Vercel
    const API_KEY = process.env.CRYPTO_API_KEY;

    // 4. Monta a URL para a CryptoCompare (usando HistoHour para precisão por hora)
    const url = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${crypto}&tsym=BRL&limit=1&toTs=${timestamp}&api_key=${API_KEY}`;

    try {
        const res = await fetch(url);
        
        // Se a API externa falhar (ex: chave inválida)
        if (!res.ok) {
            return response.status(res.status).json({ error: "Erro na consulta à API externa" });
        }

        const data = await res.json();

        // 5. Retorna os dados para o seu frontend
        return response.status(200).json(data);

    } catch (error) {
        console.error("Erro interno no servidor:", error);
        return response.status(500).json({ error: "Erro interno no servidor" });
    }
}