export default async function handler(request, response) {
    const { crypto, timestamp } = request.query;    
    const API_KEY = process.env.CRYPTO_API_KEY;
    
    const url = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${crypto}&tsym=BRL&limit=1&toTs=${timestamp}&api_key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: "Falha na API" });
    }
}