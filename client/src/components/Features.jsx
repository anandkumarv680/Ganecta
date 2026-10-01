import { Users, FolderGit2, Trophy, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Developer Community",
    description: "Connect with developers, share ideas, and grow your network.",
  },
  {
    icon: FolderGit2,
    title: "Project Showcase",
    description:
      "Showcase your projects, get feedback, and discover amazing work.",
  },
  {
    icon: Trophy,
    title: "Coding Challenges",
    description:
      "Participate in coding challenges and test your problem-solving skills.",
  },
  {
    icon: TrendingUp,
    title: "Skill Development",
    description:
      "Improve your skills, track your progress, and grow as a developer.",
  },
];

const Features = () => {
  return (
    <section className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-purple-500">Grow</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto">
            A platform built to help developers connect, build projects, improve
            their skills, and achieve more together.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition duration-300"
              >
                <div className="bg-purple-600/20 w-14 h-14 rounded-lg flex items-center justify-center mb-5">
                  <Icon size={28} className="text-purple-400" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>

                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
