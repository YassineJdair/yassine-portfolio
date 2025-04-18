
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';

const Projects = () => {
  const projects = [
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
      title: "Expense Tracker",
      description: "Track your expenses and manage your budget with visualizations and reports.",
      link: "/expense-tracker"
    }
  ];

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-12">Projects</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.title}
                title={project.title}
                description={project.description}
                link={project.link}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
