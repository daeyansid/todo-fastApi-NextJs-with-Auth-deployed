"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { TodoList } from "@/components/ui/todo-list";
import { TodoInput } from "@/components/ui/todo-input";
import { UpdateTodoModal } from "@/components/ui/update-todo-modal";
import { createTodo, updateTodo, deleteTodo, fetchTodos, TodoResponse } from "@/lib/api";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from '@/utils/alerts';
import Swal from 'sweetalert2';

export default function TodosPage() {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();
    const [todos, setTodos] = useState<TodoResponse[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<TodoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    const loadTodos = useCallback(async (): Promise<void> => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            showLoadingAlert('Loading your todos...');
            const data = await fetchTodos();
            setTodos(data);
        } catch (error) {
            if (error instanceof Error) {
                showErrorAlert('Error', error.message);
            } else {
                showErrorAlert('Error', 'Failed to load todos');
            }
        } finally {
            closeLoadingAlert();
            setIsLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
            return;
        }

        if (isInitialLoad && isAuthenticated) {
            loadTodos();
            setIsInitialLoad(false);
        }
    }, [isAuthenticated, router, isInitialLoad, loadTodos]);

    const handleAddTodo = async (content: string): Promise<void> => {
        setIsLoading(true);
        try {
            showLoadingAlert('Adding todo...');
            const newTodo = await createTodo({ content });
            setTodos(prev => [newTodo, ...prev]);
            setShowAddModal(false);
            showSuccessAlert('Success', 'Todo added successfully');
        } catch (error) {
            if (error instanceof Error) {
                showErrorAlert('Error', error.message);
            } else {
                showErrorAlert('Error', 'Failed to add todo');
            }
        } finally {
            closeLoadingAlert();
            setIsLoading(false);
        }
    };

    const handleUpdateTodo = async (id: number, content: string): Promise<void> => {
        setIsLoading(true);
        try {
            showLoadingAlert('Updating todo...');
            const updatedTodo = await updateTodo(id, { content, is_completed: false });
            setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
            setSelectedTodo(null);
            showSuccessAlert('Success', 'Todo updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                showErrorAlert('Error', error.message);
            } else {
                showErrorAlert('Error', 'Failed to update todo');
            }
        } finally {
            closeLoadingAlert();
            setIsLoading(false);
        }
    };

    const handleToggleTodo = async (id: number): Promise<void> => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            showLoadingAlert('Updating status...');
            const updatedTodo = await updateTodo(id, {
                content: todo.content,
                is_completed: !todo.is_completed
            });
            setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
            showSuccessAlert('Success', `Todo marked as ${updatedTodo.is_completed ? 'completed' : 'incomplete'}`);
        } catch (error) {
            if (error instanceof Error) {
                showErrorAlert('Error', error.message);
            } else {
                showErrorAlert('Error', 'Failed to update todo status');
            }
        } finally {
            closeLoadingAlert();
        }
    };

    const handleDeleteTodo = async (id: number): Promise<void> => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setDeletingIds(prev => [...prev, id]);
            try {
                showLoadingAlert('Deleting todo...');
                await deleteTodo(id);
                setTodos(prev => prev.filter(todo => todo.id !== id));
                showSuccessAlert('Deleted!', 'Your todo has been deleted.');
            } catch (error) {
                if (error instanceof Error) {
                    showErrorAlert('Error', error.message);
                } else {
                    showErrorAlert('Error', 'Failed to delete todo');
                }
            } finally {
                closeLoadingAlert();
                setDeletingIds(prev => prev.filter(todoId => todoId !== id));
            }
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Todo App</h1>
                        <span className="ml-4 text-gray-500">Welcome, {user.username}!</span>
                    </div>
                    <Button onClick={logout} variant="outline">Logout</Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Your Todos</h2>
                        <Button onClick={() => setShowAddModal(true)}>Add New Todo</Button>
                    </div>

                    {todos.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No todos yet. Add one to get started!</p>
                    ) : (
                        <TodoList
                            todos={todos}
                            onToggle={handleToggleTodo}
                            onDelete={handleDeleteTodo}
                            onEdit={setSelectedTodo}
                            deletingIds={deletingIds}
                        />
                    )}
                </div>
            </main>

            {/* Add Todo Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Todo</h2>
                        <TodoInput
                            onAdd={handleAddTodo}
                            isLoading={isLoading}
                            onClose={() => setShowAddModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Update Todo Modal */}
            {selectedTodo && (
                <UpdateTodoModal
                    todo={selectedTodo}
                    isOpen={!!selectedTodo}
                    onClose={() => setSelectedTodo(null)}
                    onUpdate={handleUpdateTodo}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
