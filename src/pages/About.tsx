
import Layout from '@/components/Layout';
import { User, Heart, Coffee } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-primary mb-6 flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            <span>~/ABOUT-ME</span>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-8">About Me</h1>
          
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 mb-12">
            <p className="text-muted-foreground leading-relaxed mb-6">
              I'm a passionate software engineer who loves building things. With a focus on web development,
              I enjoy creating intuitive and responsive user interfaces that solve real problems.
              When I'm not coding, you can find me exploring new technologies, reading tech blogs,
              or contributing to open-source projects.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              My goal is to continuously improve my skills and stay updated with the latest
              industry trends. I believe in writing clean, maintainable code and following best practices
              to deliver high-quality software solutions.
            </p>
          </div>
          
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Interests</h2>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {['Reading', 'Coding', 'Music', 'Travel', 'Photography'].map((interest) => (
                <span 
                  key={interest} 
                  className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Fun Facts</h2>
            </div>
            
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>I love all things DIY</li>
              <li>I've visited 10 countries</li>
              <li>One of my favorite movies is Inception</li>
              <li>I can solve a Rubik's cube in under 2 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
