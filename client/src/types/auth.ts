export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
}

export interface User {
    sub: number | string;
    username: string;
    email: string;
}
