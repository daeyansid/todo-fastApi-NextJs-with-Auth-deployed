const API_BASE_URL = 'http://localhost:8000';

export interface TodoCreate {
    content: string;
}

export interface TodoResponse {
    id: number;
    content: string;
    is_completed: boolean;
    user_id: number;
}

export interface TodoEdit {
    content: string;
    is_completed: boolean;
}

const getHeaders = async (): Promise<HeadersInit> => {
    let token = localStorage.getItem('accessToken');
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    
    if (!token) {
        return headers;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        
        if (Date.now() >= expiry) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                const response = await fetch(`${API_BASE_URL}/token/refresh?old_refresh_token=${refreshToken}`, {
                    method: 'POST',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('accessToken', data.access_token);
                    localStorage.setItem('refreshToken', data.refresh_token);
                    token = data.access_token;
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    throw new Error('Session expired');
                }
            }
        }
    } catch (error) {
        console.error('Token validation failed:', error);
        return headers;
    }

    headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export async function createTodo(todo: TodoCreate): Promise<TodoResponse> {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(todo),
    });

    if (!response.ok) {
        throw new Error('Failed to create todo');
    }

    return response.json();
}

export async function fetchTodos(): Promise<TodoResponse[]> {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
        headers: await getHeaders(),
    });

    if (!response.ok) {
        if (response.status === 404) {
            return []; // Return empty array if no tasks found
        }
        throw new Error('Failed to fetch todos');
    }

    return response.json();
}

export async function updateTodo(id: number, todo: TodoEdit): Promise<TodoResponse> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(todo),
    });

    if (!response.ok) {
        throw new Error('Failed to update todo');
    }

    return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: await getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to delete todo');
    }
}
