import { useState } from 'react';

interface TodoInputProps {
    onAdd: (title: string, description: string, content: string) => void;
    isLoading?: boolean;
}

export function TodoInput({ onAdd, isLoading = false }: TodoInputProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(title, description, content);
            setTitle('');
            setDescription('');
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
            <button
                type="submit"
                disabled={isLoading}
                className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Adding...' : 'Add Todo'}
            </button>
        </form>
    );
}
