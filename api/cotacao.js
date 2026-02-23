// api/cotacao.js
export default async function handler(request, response) {
    const { crypto, timestamp } = request.query;
    
    // Na Vercel, você vai cadastrar CRYPTO_API_KEY nas variáveis de ambiente
    const API_KEY = process.env.CRYPTO_API_KEY; 
    
    const url = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${crypto}&tsym=BRL&limit=2&toTs=${timestamp}&api_key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: "Erro ao buscar dados na API principal" });
    }
}