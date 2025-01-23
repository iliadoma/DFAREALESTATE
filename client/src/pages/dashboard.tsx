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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Trophy, Star, Building2, Store, LineChart, LogOut, Wallet, Menu } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/language-switcher";
import InvestmentCard from "@/components/investment-card";
import InvestmentFilter from "@/components/investment-filter";
import PortfolioChart from "@/components/portfolio-chart";

type FilterState = {
  type?: "real_estate" | "business";
  category?: string;
  minRoi?: number;
  maxPrice?: number;
};

export default function Dashboard() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const { investments, portfolio, isLoading } = useInvestments();
  const [filters, setFilters] = useState<FilterState>({
    type: "real_estate" // Default to real estate view
  });

  const xpForNextLevel = (user?.level || 1) * 1000;
  const progressToNextLevel = ((user?.experience || 0) / xpForNextLevel) * 100;

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">TokenizedAssets</h1>

            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      {t("dashboard.portfolio.title")}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">Level {user?.level}</span>
                        <Progress value={progressToNextLevel} className="h-2" />
                      </div>
                      <Star className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                    </div>
                    <LanguageSwitcher />
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("common.logout")}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Level {user?.level}</span>
                  <div className="w-32">
                    <Progress value={progressToNextLevel} className="h-2" />
                  </div>
                </div>
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <LanguageSwitcher />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("common.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.portfolio.realEstateValue")}
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.realEstate.value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.realEstate.count} {t("dashboard.portfolio.properties")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.portfolio.businessValue")}
              </CardTitle>
              <Store className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.business.value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.business.count} {t("dashboard.portfolio.businesses")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.portfolio.achievements")}
              </CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-muted-foreground">
                Latest: First Investment
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.portfolio.performance")}
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
            <CardTitle>{t("dashboard.investments.title")}</CardTitle>
            <CardDescription>
              {t("dashboard.investments.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestmentFilter
              onFilterChange={setFilters}
              className="mb-6"
            />

            {isLoading ? (
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[300px]" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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