import { Link, useNavigate } from 'react-router-dom';
import {
  Network,
  Users,
  Dumbbell,
  MessageSquare,
  Code2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-pattern">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <header className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Network className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              Ganecta
            </span>
          </div>
          {token ? (
            <Button size="sm" onClick={() => navigate('/')}>
              Go to Feed
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          )}
        </header>

        <section className="pt-20 pb-24 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Built for developers, by developers
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-6 animate-slide-up">
            Connect. Build. Grow.
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-8 animate-slide-up">
            A social platform where developers share ideas, join coding
            challenges, and grow together. Find your community and level up
            your skills.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up">
            {token ? (
              <Button size="lg" onClick={() => navigate('/')}>
                Enter Ganecta
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/register')}>
                  Create your account
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  I already have one
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-24">
          {[
            {
              icon: Users,
              title: 'Connect with developers',
              description:
                'Follow other devs, share posts, and build your network in a space designed for technical conversations.',
            },
            {
              icon: Dumbbell,
              title: 'Join coding challenges',
              description:
                'Participate in daily challenges, track your progress, and compete on leaderboards to stay motivated.',
            },
            {
              icon: MessageSquare,
              title: 'Real-time messaging',
              description:
                'Chat with other developers in real time. Share ideas, get feedback, and collaborate instantly.',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-card hover:shadow-card-hover hover:border-neutral-300 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>

        <footer className="border-t border-neutral-200 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Code2 className="h-4 w-4" />
            <span>Ganecta — A developer community platform</span>
          </div>
          {!token && (
            <Link
              to="/register"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Join the community
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
}
