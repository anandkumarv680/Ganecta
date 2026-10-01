
import { GitBranch, ExternalLink } from "lucide-react";

const projects = [
  {
    title: "DevConnect",
    description:
      "A platform where developers can connect, share ideas, and collaborate on projects.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    techStack: ["React", "Node.js", "MongoDB"],
    github: "https://github.com",
    demo: "https://example.com",
  },
  {
    title: "TaskFlow",
    description:
      "A productivity app that helps teams manage tasks and track their progress.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    techStack: ["React", "Express", "MongoDB"],
    github: "https://github.com",
    demo: "https://example.com",
  },
  {
    title: "CodeArena",
    description:
      "An interactive coding platform where developers can practice programming challenges.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    techStack: ["JavaScript", "Node.js", "React"],
    github: "https://github.com",
    demo: "https://example.com",
  },
];

const FeaturedProjects = () => {
  return (
    <section className="bg-gray-950 text-white py-20">
      <div className="container mx-auto px-4">

        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Amazing{" "}
            <span className="text-purple-500">Projects</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover what developers are building and get inspired
            to create something of your own.
          </p>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition duration-300"
            >
              {/* Project Image */}
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-48 object-cover"
              />

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">
                  {project.title}
                </h3>

                <p className="text-gray-400 mb-5 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-purple-600/20 text-purple-300 text-sm px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-700 hover:border-purple-500 py-2 rounded-lg transition"
                  >
                    <GitBranch size={18} />
                    GitHub
                  </a>

                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition"
                  >
                    <ExternalLink size={18} />
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedProjects;
