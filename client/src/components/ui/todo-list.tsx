import { TodoResponse } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface TodoListProps {
    todos: TodoResponse[];
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (todo: TodoResponse) => void;
    deletingIds: number[];
}

export function TodoList({ todos, onToggle, onDelete, onEdit, deletingIds }: TodoListProps) {
    return (
        <ul className="w-full space-y-4">
            {todos.map((todo) => (
                <li key={todo.id} className="p-4 border rounded">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2 flex-grow">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={todo.status}
                                    onCheckedChange={() => onToggle(todo.id)}
                                    className="w-4 h-4"
                                />
                                <h3 className={`font-medium ${todo.status ? 'line-through text-gray-400' : ''}`}>
                                    {todo.title}
                                </h3>
                            </div>
                            {todo.description && (
                                <p className="text-sm text-gray-600">{todo.description}</p>
                            )}
                            {todo.content && (
                                <p className="text-sm text-gray-500">{todo.content}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(todo)}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(todo.id)}
                                disabled={deletingIds.includes(todo.id)}
                                className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                            >
                                {deletingIds.includes(todo.id) ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent" />
                                ) : (
                                    <Trash className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
