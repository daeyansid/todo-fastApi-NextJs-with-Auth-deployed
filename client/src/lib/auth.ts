import { LoginCredentials, AuthResponse } from "@/types/auth";

const API_BASE_URL = 'http://localhost:8000';

export async function login({ username, password }: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    return data;
}

export async function register(userData: { username: string; email: string; password: string }) {
    const url = new URL(`${API_BASE_URL}/user/register`);
    url.searchParams.append('username', userData.username);
    url.searchParams.append('email', userData.email);
    url.searchParams.append('password', userData.password);

    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'accept': 'application/json'
        },
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('User with these credentials already exists');
        }
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
}

export async function refreshToken(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/token/refresh?old_refresh_token=${token}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    return response.json();
}
