import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="max-w-4xl text-center space-y-8">
                <h1 className="text-6xl font-bold text-gray-900">Welcome to Todo App</h1>
                <p className="text-xl text-gray-600">
                    Organize your tasks efficiently and stay productive
                </p>
                <div className="space-x-4">
                    <Link href="/login">
                        <Button size="lg">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="lg" variant="outline">Register</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
