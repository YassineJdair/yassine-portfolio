import Layout from "@/components/Layout";
import { User, Heart, Coffee, Briefcase, GraduationCap, Wrench, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
    useSEO(
        "About – Yassine Jdair",
        "About Yassine Jdair — Service Delivery Engineer at Dell Technologies with a background in software implementation and systems support.",
        "/about"
    );

    const skills = {
        "Service Delivery & Ops": ["Service Delivery", "Operational Support", "Process Improvement", "Root Cause Analysis", "Issue Resolution"],
        "Development": ["Java", "JavaScript", "TypeScript", "Node.js", "Python", "MySQL"],
        "Tools": ["Git", "Jira", "Postman", "Workflow Automation", "Technical Documentation"],
    };

    return (
        <Layout>
            <div className="py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                    {/* Header */}
                    <div className="text-center">
                        <div className="text-primary mb-3 flex items-center justify-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            <span>~ / ABOUT ME</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-8">About Me</h1>

                        <div className="bg-card/50 border border-border/50 rounded-xl p-6 text-left space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                I'm a Service Delivery Engineer at Dell Technologies in Limerick, with a background in software implementation, systems support, and technical problem solving. I enjoy working at the intersection of technology, design, and business — turning ideas into real world solutions.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Previously at Blocworx, I worked as a Systems Support & Software Implementation Engineer, building workflows, developing custom scripts, and helping clients get the most out of their systems. Outside of work I'm always building something — whether that's a portfolio project, experimenting with new tech, or exploring entrepreneurial ventures in automotive customisation, fragrance branding, and mobile detailing.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                I hold a BSc in Computing (Software Development) from Atlantic Technological University and I'm fluent in English and Arabic, with basic French.
                            </p>
                        </div>
                    </div>

                    {/* Experience */}
                    <Link
                        to="/experience"
                        className="flex items-center justify-between gap-4 bg-card/50 border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h2 className="font-semibold">Work Experience</h2>
                                <p className="text-muted-foreground text-sm">See the full career timeline — Dell Technologies, Blocworx & more</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Education */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Education</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                {
                                    degree: "BSc in Computing (Software Development)",
                                    school: "Atlantic Technological University",
                                    period: "2019 – 2023",
                                    location: "Ireland",
                                },
                                {
                                    degree: "Leaving Certificate",
                                    school: "Ennis Community College",
                                    period: "2014 – 2019",
                                    location: "Ireland",
                                },
                            ].map((ed) => (
                                <div key={ed.degree} className="bg-card/50 border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <div>
                                        <p className="font-medium text-sm">{ed.degree}</p>
                                        <p className="text-primary text-sm">{ed.school}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-muted-foreground text-xs">{ed.period}</p>
                                        <p className="text-muted-foreground text-xs">{ed.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Wrench className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Skills</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.entries(skills).map(([cat, items]) => (
                                <div key={cat} className="bg-card/50 border border-border/50 rounded-xl p-4">
                                    <p className="text-primary text-xs font-semibold mb-3 uppercase tracking-wide">{cat}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {items.map(s => (
                                            <span key={s} className="bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full text-xs">
                        {s}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Interests</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {["Reading", "Coding", "Music", "Travel", "Photography", "Cars", "Movies", "Fishing"].map((i) => (
                                <span key={i} className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm">
                  {i}
                </span>
                            ))}
                        </div>
                    </div>

                    {/* Fun Facts */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Coffee className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Fun Facts</h2>
                        </div>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                            <li>I like all things DIY</li>
                            <li>I'm Creative & Entrepreneurial</li>
                            <li>I'm a Tech Savvy Problem Solver</li>
                            <li>I'm Vision Focused</li>
                            <li>I'm Family Oriented</li>
                            <li>Fluent in English & Arabic, basic French</li>
                            <li>Full Irish Driving Licence (Category B)</li>
                        </ul>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default About;