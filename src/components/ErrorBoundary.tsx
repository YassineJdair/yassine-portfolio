import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown, info: unknown) {
        console.error("Uncaught error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                    <div className="text-center px-4">
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-4">
                            This page hit an unexpected error.
                        </p>
                        <a href="/" className="text-primary underline">
                            Return to Home
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
