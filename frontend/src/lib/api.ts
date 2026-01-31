import axios from 'axios';

const api = axios.create({
    baseURL: (() => {
        let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        // Remove trailing slash if exists
        url = url.replace(/\/$/, '');
        // Append /api if missing
        if (!url.endsWith('/api')) {
            url = `${url}/api`;
        }
        return `${url}/`;
    })(),
});

export default api;
