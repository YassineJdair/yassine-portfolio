
import Layout from '@/components/Layout';
import { Code, Heart, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <div className="py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-primary mb-4">~/SOFTWARE-ENGINEER</div>
            <h1 className="text-4xl font-bold mb-6">Yassine Jdair</h1>
            
            <div className="bg-card/50 border border-border/50 rounded-lg p-6 mb-12 text-left">
              <code className="block mb-2 text-sm text-muted-foreground">const engineer = {'{'}</code>
              <code className="block pl-4 text-sm">
                <span className="text-muted-foreground">name:</span> <span className="text-blue-400">"Yassine Jdair"</span>,
              </code>
              <code className="block pl-4 text-sm">
                <span className="text-muted-foreground">role:</span> <span className="text-blue-400">"Software Engineer"</span>,
              </code>
              <code className="block pl-4 text-sm">
                <span className="text-muted-foreground">passions:</span> [
                <span className="text-blue-400">"Web Development"</span>, 
                <span className="text-blue-400">"System Design"</span>, 
                <span className="text-blue-400">"UI/UX Design"</span>]
              </code>
              <code className="block text-sm text-muted-foreground">{'}'};</code>
            </div>
            
            <div className="mb-12">
              <h2 className="flex items-center justify-center gap-2 text-xl font-semibold mb-6">
                <Code className="h-5 w-5 text-primary" /> Technical Expertise
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind'].map((tech) => (
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
                <Briefcase className="h-5 w-5 text-primary" /> Experience
              </h2>
              <div className="text-left space-y-6">
                <div className="border-b border-border/40 pb-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Tech Solutions Inc</h3>
                    <span className="text-sm text-muted-foreground">2021 - Present</span>
                  </div>
                  <div className="text-primary text-sm">Software Engineer</div>
                </div>
                <div className="border-b border-border/40 pb-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Digital Innovations Ltd</h3>
                    <span className="text-sm text-muted-foreground">2019 - 2021</span>
                  </div>
                  <div className="text-primary text-sm">Junior Developer</div>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="flex items-center justify-center gap-2 text-xl font-semibold mb-6">
                Current Focus
              </h2>
              <p className="text-muted-foreground">
                Exploring modern web frameworks and building interactive applications
              </p>
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
