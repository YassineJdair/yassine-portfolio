
import Layout from '@/components/Layout';
import { Briefcase, Calendar } from 'lucide-react';

const Experience = () => {
  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-12">Experience</h1>
          
          <div className="space-y-12">
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0"></div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">2021 - Present</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Tech Solutions Inc</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Software Engineer</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Developed and maintained web applications using React, Node.js, and TypeScript. 
                Collaborated with design and product teams to implement user interfaces and features.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">React</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Node.js</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">TypeScript</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Tailwind CSS</span>
              </div>
            </div>
            
            <div className="relative border-l border-primary/50 pl-8 pb-2">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-2 top-0"></div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">2019 - 2021</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Digital Innovations Ltd</h2>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Junior Developer</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Assisted in the development of web applications and participated in code reviews.
                Implemented UI components and fixed bugs in existing applications.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">JavaScript</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">HTML</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">CSS</span>
                <span className="bg-accent/30 text-xs px-2 py-1 rounded">Git</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Experience;
