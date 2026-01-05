"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TrackingForm } from "@/components/forms/TrackingForm";
import {
  Play,
  FileText,
  Globe,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { resultsApi } from "@/api";

interface RecentSession {
  id: string;
  category: string;
  brands: string[];
  status: string;
  createdAt: string;
}

export default function Home() {
  const { data: recentSessions = [] } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: async () => {
      const res = await resultsApi.getRecent();
      return (res.sessions || []).slice(0, 3) as RecentSession[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside className="hidden w-[220px] bg-sidebar text-sidebar-foreground flex-col md:flex">
        <div className="h-14 flex items-center px-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="text-sidebar-foreground">Sonic</span>
          </div>
        </div>

        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-full h-9 pl-9 pr-3 text-sm bg-sidebar-accent border-0 rounded-lg text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <kbd className="absolute right-2.5 top-2.5 pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded bg-zinc-700 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
              ⌘K
            </kbd>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg bg-sidebar-accent text-primary">
            <Play className="h-4 w-4" />
            Playground
          </button>
          <Link href="/reports" className="block">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <FileText className="h-4 w-4" />
              Reports
            </button>
          </Link>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/50 text-center">
            AI Visibility Tracker
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <main className="flex-1 overflow-auto">
          <div className="relative min-h-full">
            <div className="relative max-w-4xl mx-auto px-6 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
                  Playground
                </h1>
                <p className="text-muted-foreground">
                  Track brand visibility across AI platforms - all in one place
                </p>
              </div>

              <div className="max-w-xl mx-auto">
                <TrackingForm />
              </div>

              {recentSessions.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Runs</h3>
                    <Link
                      href="/reports"
                      className="text-sm text-primary hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentSessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/report/${session.id}`}
                        className="group block"
                      >
                        <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Globe className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(session.createdAt)}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {session.category}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              {session.status === "COMPLETED" ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-blue-500" />
                              )}
                              <span>
                                {session.status === "COMPLETED"
                                  ? "Completed"
                                  : session.status}
                              </span>
                            </p>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
