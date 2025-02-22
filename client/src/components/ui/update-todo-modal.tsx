import { useState, useEffect } from 'react';
import { TodoResponse } from '@/lib/api';

interface UpdateTodoModalProps {
    todo: TodoResponse;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, content: string) => Promise<void>;
    isLoading?: boolean;
}

export function UpdateTodoModal({ todo, isOpen, onClose, onUpdate, isLoading = false }: UpdateTodoModalProps) {
    const [content, setContent] = useState(todo.content);

    useEffect(() => {
        if (isOpen) {
            setContent(todo.content);
        }
    }, [isOpen, todo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            await onUpdate(todo.id, content);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Update Todo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter content"
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
