// api/cotacao.js
export default async function handler(req, res) {
    const { coin, ts } = req.query;
    
    // A chave fica guardada nas variáveis de ambiente do servidor/hospedagem
    const API_KEY = process.env.CRYPTO_API_KEY; 
    const url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${coin}&tsyms=BRL&ts=${ts}&api_key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}