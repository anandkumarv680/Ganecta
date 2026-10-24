import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Users, AlertCircle, X } from "lucide-react";
import type { SearchUserResult } from "@/types";
import { Card, EmptyState, Spinner } from "@/components/ui";
import UserListItem from "@/components/users/UserListItem";
import { searchUsers } from "@/api/userApi";
import { extractErrorMessage } from "@/api/errors";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await searchUsers(q);
      setResults(data);
    } catch (err) {
      setError(extractErrorMessage(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryFromUrl) {
      setInputValue(queryFromUrl);
      performSearch(queryFromUrl);
    }
  }, [queryFromUrl, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
    performSearch(trimmed);
  };

  const handleClear = () => {
    setInputValue("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">
          Discover Developers
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Search by name or username
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search developers..."
          autoFocus
          className="w-full h-12 pl-12 pr-12 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        )}
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <Card className="p-8">
          <EmptyState
            icon={<AlertCircle className="h-7 w-7" />}
            title="Search failed"
            description={error}
          />
        </Card>
      )}

      {!loading && !error && hasSearched && results.length === 0 && (
        <Card className="p-8">
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No results found"
            description={`No developers matched "${queryFromUrl}". Try a different name or username.`}
          />
        </Card>
      )}

      {!loading && !error && !hasSearched && (
        <Card className="p-8">
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="Start searching"
            description="Search by name or username"
          />
        </Card>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-neutral-500 mb-3">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <Card className="overflow-hidden">
            <div className="p-2">
              {results.map((user) => (
                <UserListItem key={user._id} user={user} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
