import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('token')
    );
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.auth.login({ username, password });
            setToken(response.token);
            navigate('/editor');
        } catch (error) {
            // Якщо 401 - очищаємо токен
            if (error instanceof ApiError && error.status === 401) {
                setToken(null);
            }
            throw error;
        }
    };

    const register = async (username: string, password: string) => {
        try {
            const response = await api.auth.register({ username, password });
            setToken(response.token);
            navigate('/editor');
        } catch (error) {
            // Якщо 401 - очищаємо токен
            if (error instanceof ApiError && error.status === 401) {
                setToken(null);
            }
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

