import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InvestmentCard from "@/components/investment-card";
import type { Investment } from "@db/schema";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/language-switcher";
import { useUser } from "@/hooks/use-user";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { user } = useUser();

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
  });

  const realEstateInvestments = investments?.filter(inv => inv.type === 'real_estate') ?? [];
  const businessInvestments = investments?.filter(inv => inv.type === 'business') ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">metr.digital</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={() => setLocation("/auth")}>{t("common.login")}</Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              {t("landing.hero.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("landing.hero.description")}
            </p>
            <Button size="lg" onClick={() => setLocation("/auth")}>
              {t("landing.hero.cta")}
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-center mb-12">
            {t("landing.featured.title")}
          </h3>

          {/* Real Estate Section */}
          <div className="mb-16">
            <h4 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span>{t("investment.types.realEstate")}</span>
              <span className="text-sm text-muted-foreground">({realEstateInvestments.length})</span>
            </h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {realEstateInvestments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  userTokens={[]}
                  preview
                />
              ))}
            </div>
          </div>

          {/* Business Section */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span>{t("investment.types.business")}</span>
              <span className="text-sm text-muted-foreground">({businessInvestments.length})</span>
            </h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businessInvestments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  userTokens={[]}
                  preview
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8">
              {t("landing.features.title")}
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t("landing.features.ownership.title")}</CardTitle>
                  <CardDescription>
                    {t("landing.features.ownership.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {t("landing.features.ownership.description")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("landing.features.income.title")}</CardTitle>
                  <CardDescription>
                    {t("landing.features.income.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {t("landing.features.income.description")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("landing.features.liquidity.title")}</CardTitle>
                  <CardDescription>
                    {t("landing.features.liquidity.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {t("landing.features.liquidity.description")}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t("landing.footer")} © 2024 metr.digital.
            </p>
            {user?.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setLocation("/admin")}
              >
                Admin Panel
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}