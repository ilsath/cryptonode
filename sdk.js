const crypto = require('crypto');
const axios = require('axios');

class BitsoSDK {
    constructor(apiKey, apiSecret, baseUrl = 'https://stage.bitso.com') {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = baseUrl;
    }

    _generateAuthHeader(httpMethod, requestPath, jsonPayload = '') {
        const nonce = String(Date.now());
        const message = nonce + httpMethod + requestPath + (typeof jsonPayload === 'string' ? jsonPayload : JSON.stringify(jsonPayload));
        const signature = crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
        return `Bitso ${this.apiKey}:${nonce}:${signature}`;
    }

    async _makeRequest(method, endpoint, jsonPayload = null) {
        const url = this.baseUrl + endpoint;
        const authHeader = this._generateAuthHeader(method, endpoint, jsonPayload);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
        };

        try {
            const response = await axios({
                method,
                url,
                headers,
                data: jsonPayload ? JSON.stringify(jsonPayload) : null,
            });
            return response.data; // Devuelve el JSON de la respuesta
        } catch (error) {
            console.error('Error en la solicitud:', error.message);
            throw error;
        }
    }

    // Métodos de API
    async getExternalAccounts(onBehalfExternalCustomerId) {
        const endpoint = `/api/v3/payments/usd/bridge/external-accounts?on_behalf_external_customer_id=${onBehalfExternalCustomerId}`;
        return await this._makeRequest('GET', endpoint);
    }

    async getWithdrawals(onBehalfExternalCustomerId, originIds = null) {
        let endpoint = `/api/v3/withdrawals?on_behalf_external_customer_id=${onBehalfExternalCustomerId}`;
        if (originIds) endpoint += `&origin_ids=${originIds}`;
        return await this._makeRequest('GET', endpoint);
    }

    async getDepositIntent() {
        const endpoint = '/api/v3/payments/usd/bridge/deposit-intents';
        return await this._makeRequest('GET', endpoint);
    }

    async createDepositIntent(jsonPayload) {
        const endpoint = '/api/v3/payments/usd/bridge/deposit-intents';
        return await this._makeRequest('POST', endpoint, jsonPayload);
    }

    async withdrawOnBehalf(jsonPayload) {
        const endpoint = '/api/v3/withdrawals';
        return await this._makeRequest('POST', endpoint, jsonPayload);
    }

    async createExternalAccount(jsonPayload) {
        const endpoint = '/api/v3/payments/usd/bridge/external-accounts';
        return await this._makeRequest('POST', endpoint, jsonPayload);
    }
    
    async deleteExternalAccountById(externalAccountId, onBehalfExternalCustomerId) {
        const endpoint = `/api/v3/payments/usd/bridge/external-accounts/${externalAccountId}?on_behalf_external_customer_id=${onBehalfExternalCustomerId}`;
        return await this._makeRequest('DELETE', endpoint);
    }

    async createWebhook(jsonPayload) {
        const endpoint = '/api/v3/webhooks';
        return await this._makeRequest('POST', endpoint, jsonPayload);
    }
}

module.exports = BitsoSDK;
