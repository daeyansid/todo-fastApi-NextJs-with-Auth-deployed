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
    const token = localStorage.getItem('accessToken');
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (!token) {
        console.warn('No access token found in localStorage');
        return headers;
    }

    // Always add the token if it exists
    headers['Authorization'] = `Bearer ${token}`;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        
        // If token is expired or about to expire in the next minute
        if (Date.now() >= (expiry - 60000)) {
            console.log('Token expired or about to expire, attempting refresh');
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/token/refresh?old_refresh_token=${refreshToken}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem('accessToken', data.access_token);
                        localStorage.setItem('refreshToken', data.refresh_token);
                        headers['Authorization'] = `Bearer ${data.access_token}`;
                        console.log('Token refreshed successfully');
                    } else {
                        console.error('Failed to refresh token:', await response.text());
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login'; // Redirect to login
                    }
                } catch (error) {
                    console.error('Error during token refresh:', error);
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error('Token validation failed:', error);
    }

    return headers;
};

export const createTodo = async (todo: TodoCreate): Promise<TodoResponse> => {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
        method: 'POST',
        headers: await getHeaders(),
        credentials: 'include',
        body: JSON.stringify(todo)
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
};

export const fetchTodos = async (): Promise<TodoResponse[]> => {
    try {
        const headers = await getHeaders();
        console.log('Fetching todos with headers:', headers);
        
        const response = await fetch(`${API_BASE_URL}/todos/`, {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Unauthorized access to todos');
                window.location.href = '/login';
                return [];
            }
            if (response.status === 404) {
                return [];
            }
            throw new Error(`Failed to fetch todos: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching todos:', error);
        throw error;
    }
};

export const updateTodo = async (id: number, todo: TodoEdit): Promise<TodoResponse> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(todo)
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
};

export async function deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: await getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to delete todo');
    }
}
