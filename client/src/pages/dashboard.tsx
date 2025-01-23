import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useInvestments } from "@/hooks/use-investments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InvestmentCard from "@/components/investment-card";
import InvestmentFilter from "@/components/investment-filter";
import PortfolioChart from "@/components/portfolio-chart";
import { Trophy, Star, Building2, LineChart, LogOut, Wallet } from "lucide-react";

type FilterState = {
  type?: "real_estate" | "business";
  category?: string;
  minRoi?: number;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const { investments, portfolio, isLoading } = useInvestments();
  const [filters, setFilters] = useState<FilterState>({});

  // XP needed for next level (simple calculation)
  const xpForNextLevel = (user?.level || 1) * 1000;
  const progressToNextLevel = ((user?.experience || 0) / xpForNextLevel) * 100;

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const filteredInvestments = investments?.filter((investment) => {
    if (filters.type && investment.type !== filters.type) return false;
    if (filters.category && investment.category !== filters.category) return false;
    if (filters.minRoi && Number(investment.expectedRoi) < filters.minRoi) return false;
    return true;
  });

  const totalPortfolioValue = portfolio?.reduce(
    (sum, token) => sum + Number(token.purchasePrice) * token.amount,
    0
  ) ?? 0;

  // If no user, don't render dashboard
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TokenizedAssets</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Level {user?.level}</span>
                <div className="w-32">
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>
              </div>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Portfolio Value
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalPortfolioValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Investments
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolio?.length ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Achievements
              </CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {/* TODO: Add actual achievements count */}
                3
              </div>
              <div className="text-xs text-muted-foreground">
                Latest: First Investment
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Performance
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <PortfolioChart portfolio={portfolio ?? []} />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Investment Opportunities</CardTitle>
            <CardDescription>
              Browse and invest in available opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestmentFilter
              onFilterChange={setFilters}
              className="mb-6"
            />

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[300px]" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInvestments?.map((investment) => (
                  <InvestmentCard
                    key={investment.id}
                    investment={investment}
                    userTokens={
                      portfolio?.filter(
                        (t) => t.investmentId === investment.id
                      ) ?? []
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}