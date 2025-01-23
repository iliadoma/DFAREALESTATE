import { Route, Switch } from "wouter";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - only show when not authenticated */}
      {!user ? (
        <>
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : null}

      {/* Protected routes - only show when authenticated */}
      {user ? (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/">
            <Dashboard />
          </Route>
        </>
      ) : null}

      {/* 404 for authenticated users, redirect to landing for unauthenticated */}
      <Route>
        {user ? <NotFound /> : <LandingPage />}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}