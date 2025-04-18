import Layout from '@/components/Layout';
import { Code, Heart, ArrowRight, Mail, Github, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <div className="py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="text-primary mb-1 font-mono">~/SOFTWARE-ENGINEER</div>
            <h1 className="text-4xl font-bold mb-6">Yassine Jdair</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 text-muted-foreground text-sm">
              <a href="mailto:yassinejdair@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                yassinejdair@gmail.com
              </a>
              <a href="tel:+353851244472" className="flex items-center gap-2 hover:text-primary transition-colors">
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

            {/* Code Snippet */}
            <div className="font-mono text-sm text-left leading-relaxed mb-12">
              <code className="block text-muted-foreground">
                <span className="text-primary">const</span> engineer = {'{'}
              </code>
              <code className="block pl-4">
                <span className="text-muted-foreground">name:</span>{" "}
                <span className="text-primary">"Yassine Jdair"</span>,
              </code>
              <code className="block pl-4">
                <span className="text-muted-foreground">role:</span>{" "}
                <span className="text-primary">"Software Engineer"</span>,
              </code>
              <code className="block pl-4">
                <span className="text-muted-foreground">passions:</span> [
                <span className="text-primary">"Web Development"</span>,{" "}
                <span className="text-primary">"System Design"</span>,{" "}
                <span className="text-primary">"UI/UX Design"</span>]
              </code>
              <code className="block text-muted-foreground">{'}'};</code>
            </div>

            {/* Technical Expertise */}
            <div className="mb-12 text-left">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Code className="h-5 w-5 text-primary" /> Technical Expertise
              </h2>
              <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground">
                {['Java', 'Spring Boot', 'JavaScript', 'Node.js', 'TypeScript', 'HTML', 'MySQL', 'Git'].map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mb-12 text-left">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Heart className="h-5 w-5 text-primary" /> Interests
              </h2>
              <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground">
                {['Software UI/UX', 'Blockchain', 'Networking', 'Electronics', 'Cars', 'Content Creation'].map((interest) => (
                  <span key={interest}>{interest}</span>
                ))}
              </div>
            </div>

            {/* View Projects Button */}
            <Link
  to="/projects"
  className="inline-flex items-center justify-center w-60 h-10 rounded-full bg-background text-primary border border-border hover:bg-primary hover:text-background transition-colors"
  title="View My Projects"
>
View My Projects     <ArrowRight className="h-8 w-8"/>
</Link>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
