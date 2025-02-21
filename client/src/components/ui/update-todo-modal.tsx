import { useState, useEffect } from 'react';
import { TodoResponse } from '@/lib/api';

interface UpdateTodoModalProps {
    todo: TodoResponse;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, title: string, description: string, content: string) => Promise<void>;
    isLoading?: boolean;
}

export function UpdateTodoModal({ todo, isOpen, onClose, onUpdate, isLoading = false }: UpdateTodoModalProps) {
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description);
    const [content, setContent] = useState(todo.content);

    useEffect(() => {
        if (isOpen) {
            setTitle(todo.title);
            setDescription(todo.description);
            setContent(todo.content);
        }
    }, [isOpen, todo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            await onUpdate(todo.id, title, description, content);
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
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter todo title"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                            className="w-full p-2 border rounded"
                        />
                    </div>
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
