import { useState, useEffect, useMemo } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import InvestmentCard from "@/components/investment-card";
import InvestmentFilter from "@/components/investment-filter";
import PortfolioChart from "@/components/portfolio-chart";
import { Trophy, Star, Building2, Store, LineChart, LogOut, Wallet } from "lucide-react";

type FilterState = {
  type?: "real_estate" | "business";
  category?: string;
  minRoi?: number;
  maxPrice?: number;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const { investments, portfolio, isLoading } = useInvestments();
  const [filters, setFilters] = useState<FilterState>({
    type: "real_estate" // Default to real estate view
  });

  // XP needed for next level (simple calculation)
  const xpForNextLevel = (user?.level || 1) * 1000;
  const progressToNextLevel = ((user?.experience || 0) / xpForNextLevel) * 100;

  // Calculate portfolio statistics
  const stats = useMemo(() => {
    const realEstateInvestments = portfolio?.filter(t => 
      investments?.find(i => i.id === t.investmentId)?.type === 'real_estate'
    ) || [];

    const businessInvestments = portfolio?.filter(t => 
      investments?.find(i => i.investmentId === t.id)?.type === 'business'
    ) || [];

    return {
      realEstate: {
        count: realEstateInvestments.length,
        value: realEstateInvestments.reduce(
          (sum, token) => sum + Number(token.purchasePrice) * token.amount,
          0
        ),
      },
      business: {
        count: businessInvestments.length,
        value: businessInvestments.reduce(
          (sum, token) => sum + Number(token.purchasePrice) * token.amount,
          0
        ),
      },
    };
  }, [portfolio, investments]);

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
    if (filters.maxPrice && Number(investment.pricePerToken) > filters.maxPrice) return false;
    return true;
  });

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Real Estate Value
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.realEstate.value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.realEstate.count} properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Business Value
              </CardTitle>
              <Store className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.business.value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.business.count} businesses
              </p>
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