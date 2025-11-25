"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxiosInstance = getAxiosInstance;
exports.resetAxiosInstance = resetAxiosInstance;
const axios_1 = __importDefault(require("axios"));
/**
 * Singleton Axios instance để tránh tạo mới mỗi lần
 * Giúp tiết kiệm memory và tái sử dụng connection pool
 */
let axiosInstance = null;
function getAxiosInstance(apiKey) {
    if (!axiosInstance) {
        axiosInstance = axios_1.default.create({
            baseURL: 'https://api.henrikdev.xyz/valorant',
            headers: {
                'Accept': 'application/json',
                ...(apiKey && { 'Authorization': apiKey })
            },
            timeout: 15000,
            maxRedirects: 2,
            validateStatus: (status) => status < 500,
            maxContentLength: 10000000,
            maxBodyLength: 10000000,
            // Connection pooling để tái sử dụng connections
            httpAgent: null,
            httpsAgent: null
        });
    }
    return axiosInstance;
}
// Reset instance (dùng khi cần update API key)
function resetAxiosInstance() {
    axiosInstance = null;
}
