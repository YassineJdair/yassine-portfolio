import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-6 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com/YassineJdair"
            className="text-foreground hover:text-primary"
            aria-label="GitHub"
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/yassinejdair/"
            className="text-foreground hover:text-primary"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-6 w-6" />
          </a>
          <a
            href="mailto:yassinejdair@gmail.com"
            className="text-foreground hover:text-primary"
            aria-label="Email"
          >
            <Mail className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
