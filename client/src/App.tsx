import { Route, Switch } from "wouter";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n/context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import InvestmentDetail from "@/pages/investment-detail";

function Router() {
  const { user, isLoading } = useUser();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated, only show public routes
  if (!user) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <LandingPage />
        </Route>
      </Switch>
    );
  }

  // If user is authenticated, only show protected routes
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/investments/:id" component={InvestmentDetail} />
      <Route>
        <Dashboard />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Router />
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}