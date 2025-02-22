import { useState } from "react";
import { Button } from "./button";

export interface TodoInputProps {
    onAdd: (content: string) => Promise<void>;
    isLoading: boolean;
    onClose: () => void;
}

export function TodoInput({ onAdd, isLoading, onClose }: TodoInputProps) {
    const [content, setContent] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        await onAdd(content);
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Task
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                    required
                />
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Todo"}
                </Button>
            </div>
        </form>
    );
}
