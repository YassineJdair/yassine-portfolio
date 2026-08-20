import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { useSEO } from '@/hooks/useSEO';

const Projects = () => {
    useSEO(
        "Projects – Yassine Jdair",
        "Live tools, calculators, trackers and dev utilities built from scratch by Yassine Jdair.",
        "/projects"
    );

    const projects = [
        // Original
        {
            title: "Calculator",
            description: "A modern calculator application with basic arithmetic operations and a clean user interface.",
            link: "/calculator"
        },
        {
            title: "Pomodoro Timer",
            description: "Productivity tool using the Pomodoro technique to improve focus and work efficiency.",
            link: "/pomodoro-timer"
        },
        {
            title: "Task Tracker",
            description: "A simple application to track and manage your daily tasks and improve productivity.",
            link: "/task-tracker"
        },
        {
            title: "Temperature Converter",
            description: "Easily convert between different temperature units with this sleek, user-friendly tool.",
            link: "/temperature-converter"
        },
        {
            title: "Finance Tracker",
            description: "Full budget planner with income vs expenses, category budgets, transaction history, and smart insights.",
            link: "/expense-tracker"
        },
        // New tools
        {
            title: "Salary Calculator",
            description: "Irish PAYE, USC & PRSI calculator. See your exact take-home pay with pension deductions and tax breakdown.",
            link: "/salary-calculator"
        },
        {
            title: "Car Calculator",
            description: "Irish motor tax calculator by CO₂ or engine size, plus fuel cost estimator for any trip.",
            link: "/car-calculator"
        },
        {
            title: "Habit Tracker",
            description: "Build daily habits and track streaks with a 7-day grid, custom colours, and emoji per habit.",
            link: "/habit-tracker"
        },
        {
            title: "Password Generator",
            description: "Generate strong, secure passwords with custom length, character sets, and a strength indicator.",
            link: "/password-generator"
        },
        {
            title: "JSON Formatter",
            description: "Format, validate and minify JSON instantly with syntax highlighting and one-click copy.",
            link: "/json-formatter"
        },
        {
            title: "README Generator",
            description: "Fill in your project details and get a perfectly formatted README.md ready to copy.",
            link: "/readme-generator"
        },
        {
            title: "QR Code Generator",
            description: "Turn any text or URL into a downloadable QR code, entirely in your browser.",
            link: "/qr-code-generator"
        },
        {
            title: "Mortgage Calculator",
            description: "Irish mortgage affordability calculator — solo or joint income, Central Bank lending limits, and Help to Buy, First Home Scheme & Local Authority Home Loan eligibility.",
            link: "/mortgage-calculator"
        },
    ];

    const categories = [
        {
            label: "🛠️ Tools & Utilities",
            items: ["Password Generator", "JSON Formatter", "README Generator", "QR Code Generator", "Temperature Converter", "Calculator"],
        },
        {
            label: "💰 Finance & Life",
            items: ["Finance Tracker", "Salary Calculator", "Car Calculator", "Mortgage Calculator"],
        },
        {
            label: "📋 Productivity",
            items: ["Habit Tracker", "Pomodoro Timer", "Task Tracker"],
        },
    ];

    return (
        <Layout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-center mb-4">Projects</h1>
                    <p className="text-center text-muted-foreground mb-12">
                        {projects.length} live tools & apps — all built from scratch
                    </p>

                    {categories.map(cat => {
                        const catProjects = cat.items
                            .map(name => projects.find(p => p.title === name))
                            .filter(Boolean) as typeof projects;

                        return (
                            <div key={cat.label} className="mb-12">
                                <h2 className="text-lg font-semibold text-primary mb-4">{cat.label}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {catProjects.map(project => (
                                        <ProjectCard
                                            key={project.title}
                                            title={project.title}
                                            description={project.description}
                                            link={project.link}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
};

export default Projects;