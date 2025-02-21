export interface Todo {
    id: number;
    title: string;
    description: string;  // Make this required to match TodoResponse
    content: string;      // Make this required to match TodoResponse
    status: boolean;
}
