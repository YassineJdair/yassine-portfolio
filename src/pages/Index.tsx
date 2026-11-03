import Layout from "@/components/Layout";
import { ArrowRight, Mail, Github, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const HEADLINE_SKILLS = ["Python", "TypeScript", "React", "Next.js", "Supabase"];

const Index = () => {
  useSEO(
    "Yassine Jdair – Full-Stack Developer Portfolio",
    "Yassine Jdair – Full-stack developer and Service Delivery Engineer at Dell Technologies, Limerick. Live web apps, automation and dev tools built with React, TypeScript and Python.",
    "/"
  );

  return (
    <Layout>
      <div className="py-16 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Yassine Jdair</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Full-stack developer building live web apps, automation and dashboards. Service Delivery Engineer at Dell Technologies.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm font-mono text-muted-foreground">
            {HEADLINE_SKILLS.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full border border-border/50 bg-card/50">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mb-10 text-muted-foreground text-sm">
            <a
              href="mailto:yassinejdair@gmail.com"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              yassinejdair@gmail.com
            </a>
            <a
              href="tel:+353851244472"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              +353 85 124 4472
            </a>
            <a
              href="https://github.com/YassineJdair"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 w-60 h-11 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors font-medium"
              title="View My Projects"
            >
              View My Projects <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center w-60 h-11 rounded-full bg-background text-primary border border-border hover:bg-primary hover:text-background transition-colors font-medium"
              title="About Me"
            >
              About Me
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
