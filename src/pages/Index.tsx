
import Layout from '@/components/Layout';
import { Code, Heart, Briefcase, ArrowRight, Mail, Github, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <div className="py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-primary mb-4">~/SOFTWARE-ENGINEER</div>
            <h1 className="text-4xl font-bold mb-6">Yassine Jdair</h1>
            
            <div className="flex justify-center gap-6 mb-8 text-muted-foreground">
              <a href="mailto:yassinejdair@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                yassinejdair@gmail.com
              </a>
              <a href="tel:+353851244472" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +353 85 124 4472
              </a>
              <a href="https://github.com/YassineJdair" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
            
            <div className="bg-card/50 border border-border/50 rounded-lg p-6 mb-12 text-left font-mono">
              <code className="block mb-2 text-sm text-muted-foreground">const engineer = {'{'}</code>
              <code className="block pl-4 text-sm">
                <span className="text-muted-foreground">name:</span> <span className="text-primary">"Yassine Jdair"</span>,
              </code>
              <code className="block pl-4 text-sm">
                <span className="text-muted-foreground">role:</span> <span className="text-primary">"Software Engineer"</span>,
              </code>
              <code className="block pl-4 text-sm">
                <span className="text-muted-foreground">passions:</span> [
                <span className="text-primary">"Web Development"</span>, 
                <span className="text-primary">"System Design"</span>, 
                <span className="text-primary">"UI/UX Design"</span>]
              </code>
              <code className="block text-sm text-muted-foreground">{'}'};</code>
            </div>
            
            <div className="mb-12">
              <h2 className="flex items-center justify-center gap-2 text-xl font-semibold mb-6">
                <Code className="h-5 w-5 text-primary" /> Technical Expertise
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['Java', 'Spring Boot', 'JavaScript', 'Node.js', 'TypeScript', 'HTML', 'MySQL', 'Git'].map((tech) => (
                  <span 
                    key={tech} 
                    className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="flex items-center justify-center gap-2 text-xl font-semibold mb-6">
                <Heart className="h-5 w-5 text-primary" /> Interests
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['Software UI/UX', 'Blockchain', 'Networking', 'Electronics', 'Cars', 'Content Creation'].map((interest) => (
                  <span 
                    key={interest} 
                    className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            
            <Link 
              to="/projects"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              View My Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
