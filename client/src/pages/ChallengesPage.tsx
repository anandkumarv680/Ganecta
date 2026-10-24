import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Dumbbell, AlertCircle, RefreshCw, X } from "lucide-react";
import type { Challenge } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Card, Button, EmptyState } from "@/components/ui";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import ChallengeForm from "@/components/challenges/ChallengeForm";
import { getAllChallenges } from "@/api/challengeApi";
import { extractErrorMessage } from "@/api/errors";

function ChallengeCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg skeleton" />
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
      <div className="h-5 w-48 skeleton rounded" />
      <div className="h-4 w-full skeleton rounded mt-2" />
      <div className="h-4 w-2/3 skeleton rounded mt-1" />
      <div className="flex gap-3 mt-3">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-3 w-24 skeleton rounded" />
      </div>
    </Card>
  );
}

export default function ChallengesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllChallenges();
      setChallenges(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleCreated = (challenge: Challenge) => {
    setChallenges((prev) => [challenge, ...prev]);
    setShowForm(false);
    navigate(`/challenges/${challenge._id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Challenges
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Join challenges and compete on leaderboards
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChallenges}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {token && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Create
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">
              New Challenge
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
          <ChallengeForm
            onSubmitSuccess={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Couldn't load challenges"
            description={error}
            action={
              <Button onClick={fetchChallenges} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !error && challenges.length === 0 && (
        <Card className="p-8">
          <EmptyState
            icon={<Dumbbell className="h-7 w-7" />}
            title="No challenges yet"
            description={
              token
                ? "Create the first coding challenge for the community to join."
                : "Sign in to create coding challenges for the community."
            }
            action={
              token ? (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  Create Challenge
                </Button>
              ) : (
                <Button onClick={() => navigate("/login")}>Sign In</Button>
              )
            }
          />
        </Card>
      )}

      {!loading && !error && challenges.length > 0 && (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
