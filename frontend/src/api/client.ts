const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export interface ProjectDto {
    name: string;
    description: string;
    url: string;
}

export type TemplateType = 'MINIMAL' | 'RETRO' | 'TECH_DOCS';

export interface ResumeDto {
    fullName: string;
    bio: string;
    skills: string[];
    projects: ProjectDto[];
    template: TemplateType;
    publicUrl?: string;
    photo?: string;
}

export interface PublicResumeDto {
    username: string;
    fullName: string;
    bio: string;
    skills: string[];
    projects: ProjectDto[];
    template: TemplateType;
    publicUrl: string;
    photo?: string;
}

export interface TemplateDto {
    name: string;
}

export interface TemplateUpdateRequest {
    template: TemplateType;
}

export class ApiError extends Error {
    status: number;
    statusText: string;

    constructor(message: string, status: number, statusText: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
    }
}

function getErrorMessage(status: number, defaultMessage: string): string {
    switch (status) {
        case 400:
            return 'Невірний запит. Перевірте введені дані.';
        case 401:
            return 'Необхідна авторизація. Будь ласка, увійдіть в систему.';
        case 403:
            return 'Доступ заборонено.';
        case 404:
            return 'Ресурс не знайдено.';
        case 409:
            return 'Конфлікт даних. Можливо, такий запис вже існує.';
        case 500:
            return 'Помилка сервера. Спробуйте пізніше.';
        default:
            return defaultMessage || `Помилка: ${status}`;
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage: string;
        
        // Спробуємо отримати повідомлення з відповіді
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                const errorData = await response.json();
                // Може бути { message: "..." } або просто текст
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch {
                errorMessage = await response.text() || getErrorMessage(response.status, '');
            }
        } else {
            const text = await response.text();
            errorMessage = text || getErrorMessage(response.status, '');
        }

        // Якщо повідомлення порожнє, використовуємо стандартне
        if (!errorMessage || errorMessage.trim() === '') {
            errorMessage = getErrorMessage(response.status, '');
        }

        throw new ApiError(errorMessage, response.status, response.statusText);
    }

    // Якщо відповідь порожня (наприклад, PUT /api/profile/me/template)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
    }

    return response.json();
}

export const api = {
    auth: {
        login: (data: LoginRequest): Promise<AuthResponse> =>
            request<AuthResponse>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        register: (data: RegisterRequest): Promise<AuthResponse> =>
            request<AuthResponse>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },

    profile: {
        getPublic: (username: string): Promise<PublicResumeDto> =>
            request<PublicResumeDto>(`/api/profile/public/${username}`),

        getOwn: (): Promise<ResumeDto> =>
            request<ResumeDto>('/api/profile/me'),

        update: (data: ResumeDto): Promise<ResumeDto> =>
            request<ResumeDto>('/api/profile/me', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        updateTemplate: (data: TemplateUpdateRequest): Promise<void> =>
            request<void>('/api/profile/me/template', {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        uploadPhoto: async (base64Photo: string): Promise<void> => {
            const token = localStorage.getItem('token');
            const directUrl = 'http://localhost:8080/api/profile/me/photo';
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(directUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ photo: base64Photo }),
            });
            
            if (!response.ok) {
                let errorMessage: string;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
                    } catch {
                        errorMessage = await response.text() || getErrorMessage(response.status, '');
                    }
                } else {
                    const text = await response.text();
                    errorMessage = text || getErrorMessage(response.status, '');
                }
                
                if (!errorMessage || errorMessage.trim() === '') {
                    errorMessage = getErrorMessage(response.status, '');
                }
                
                throw new ApiError(errorMessage, response.status, response.statusText);
            }
        },

        deletePhoto: (): Promise<void> =>
            request<void>('/api/profile/me/photo', {
                method: 'DELETE',
            }),
    },

    templates: {
        list: (): Promise<TemplateDto[]> =>
            request<TemplateDto[]>('/api/templates/list'),
    },
};

