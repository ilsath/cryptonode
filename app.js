const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const BitsoSDK = require('./sdk'); // Asegúrate de que `sdk.js` esté en el mismo directorio

const app = express();
app.use(cors()); // Habilita CORS
app.use(bodyParser.json()); // Para manejar solicitudes JSON

// Inicializa el SDK con tus credenciales
const apiKey = 'cwqvBXucvp';
const apiSecret = '6e603aed2a6e3ee23d96146504f090e9';
const bitsoSdk = new BitsoSDK(apiKey, apiSecret);

// Rutas HTTP
app.get('/', (req, res) => {
    res.send('Bienvenido a la integración de la API de Bitso');
});

app.post('/withdraw', async (req, res) => {
    try {
        const data = req.body;
        const response = await bitsoSdk.withdrawOnBehalf(data);
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/external-accounts', async (req, res) => {
    try {
        const data = req.body;
        const response = await bitsoSdk.createExternalAccount(data);
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/external-accounts/', async (req, res) => {
    try {
        const onBehalf = req.query.on_behalf_external_customer_id;
        const response = await bitsoSdk.getExternalAccounts(onBehalf);
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener los retiros
app.get('/withdrawals', async (req, res) => {
    try {
        const onBehalf = req.query.on_behalf_external_customer_id;
        const originIds = req.query.origin_ids || null;

        if (!onBehalf) {
            return res.status(400).json({ error: 'El parámetro on_behalf_external_customer_id es obligatorio' });
        }

        const response = await bitsoSdk.getWithdrawals(onBehalf, originIds);
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/deposit-intents', async (req, res) => {
    try {
        const data = req.body;
        const response = await bitsoSdk.createDepositIntent(data);
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/deposit-intents', async (req, res) => {
    try {
        const response = await bitsoSdk.getDepositIntent();
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar una cuenta externa por ID
app.delete('/external-accounts/:externalAccountId', async (req, res) => {
    try {
        const { externalAccountId } = req.params;

        if (!externalAccountId) {
            return res.status(400).json({ error: 'El parámetro externalAccountId es obligatorio' });
        }

        const response = await bitsoSdk.deleteExternalAccountById(externalAccountId);
        
        // Ajusta según la estructura de respuesta esperada
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        console.error('Error al eliminar la cuenta externa:', error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        const response = await bitsoSdk.createWebhook(data);
        res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Puerto donde el servidor escuchará
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
