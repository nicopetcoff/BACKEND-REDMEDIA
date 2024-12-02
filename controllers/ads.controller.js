// controllers/ads.controller.js
const fetch = require('node-fetch');

const getAds = async (req, res) => {
    try {
        const response = await fetch('https://my-json-server.typicode.com/chrismazzeo/advertising_da1/ads');
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const ads = await response.json();
        
        return res.status(200).json({
            status: 200,
            data: ads,
            message: "Anuncios obtenidos exitosamente"
        });
    } catch (error) {
        console.error('Error al obtener anuncios:', error);
        return res.status(500).json({
            status: 500,
            message: "Error al obtener los anuncios"
        });
    }
};

module.exports = {
    getAds
};