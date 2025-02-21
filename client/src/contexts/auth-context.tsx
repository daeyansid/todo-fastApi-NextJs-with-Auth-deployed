"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthResponse, User } from "@/types/auth";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (tokens: AuthResponse) => void;
    logout: () => void;
    getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    sub: payload.sub,
                    username: payload.username,
                    email: payload.email
                });
                setIsAuthenticated(true);
                
                // Redirect to todos page if on auth pages
                if (pathname === '/login' || pathname === '/register' || pathname === '/') {
                    router.push('/todos');
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
            if (pathname === '/todos') {
                router.push('/');
            }
        }
    }, [pathname, router]);

    const login = (tokens: AuthResponse) => {
        localStorage.setItem('accessToken', tokens.access_token);
        localStorage.setItem('refreshToken', tokens.refresh_token);
        setIsAuthenticated(true);
        router.push('/todos');
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
        router.push('/');
    };

    const getAccessToken = () => {
        return localStorage.getItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
