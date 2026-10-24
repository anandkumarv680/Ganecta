import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Network, Code2, Users, Dumbbell } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  altLinkText: string;
  altLinkTo: string;
  altLinkLabel: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  altLinkText,
  altLinkTo,
  altLinkLabel,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-neutral-900 to-secondary-900/20" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-end gap-0 w-fit mt-18">
            <img
              src="/ganecta-logo.png"
              alt="Ganecta"
              className="h-19 w-20 object-contain"
            />
            <span className="text-4xl font-bold tracking-tight text-white">
              anecta
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Where developers connect, build, and grow together.
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-8">
              Join a community of developers sharing ideas, tackling coding
              challenges, and leveling up their skills.
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: Code2,
                  text: "Share posts and get feedback from peers",
                },
                {
                  icon: Dumbbell,
                  text: "Solve challenges and track your progress.",
                },
                {
                  icon: Users,
                  text: "Follow developers and build your network",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                      <Icon className="h-4.5 w-4.5 text-primary-300" />
                    </div>
                    <span className="text-sm text-neutral-200">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-neutral-400">
            Built for developers, by developers.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Network className="h-5 w-5" />
                
              </div>
              <span className="text-lg font-bold text-neutral-900 tracking-tight">
                Ganecta
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
          <p className="text-sm text-neutral-500 mb-8">{subtitle}</p>

          {children}

          <p className="mt-8 text-center text-sm text-neutral-500">
            {altLinkText}{" "}
            <Link
              to={altLinkTo}
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {altLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
