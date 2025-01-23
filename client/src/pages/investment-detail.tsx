import { useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n/context";
import { useInvestments } from "@/hooks/use-investments";
import { Building2, MapPin, TrendingUp, ArrowLeft, Star } from "lucide-react";
import type { Investment } from "@db/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InvestmentDetail() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const pathname = window.location.pathname;
  const investmentId = parseInt(pathname.split('/').pop() || '');

  const { data: investment, isLoading } = useQuery<Investment>({
    queryKey: [`/api/investments/${investmentId}`],
  });

  const { portfolio } = useInvestments();
  const userTokens = portfolio?.filter(t => t.investmentId === investmentId) ?? [];
  const totalUserTokens = userTokens.reduce((sum, token) => sum + token.amount, 0);
  const investmentValue = investment ? Number(investment.pricePerToken) * totalUserTokens : 0;

  // Mock data for the performance chart
  const performanceData = [
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 1100 },
    { month: 'Apr', value: 1400 },
    { month: 'May', value: 1300 },
    { month: 'Jun', value: 1600 }
  ];

  if (isLoading || !investment) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const xpForNextLevel = investment.level * 1000;
  const progressToNextLevel = (investment.experience / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {t(`investment.names.${investment.translationKey}.name`)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t(investment.type === "real_estate" ? "investment.types.realEstate" : "investment.types.business")}
                    </CardDescription>
                  </div>
                  {investment.type === "real_estate" ? (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {t(`investment.names.${investment.translationKey}.location`)}
                  </div>
                  
                  <p className="text-sm">{t(`investment.descriptions.${investment.category}`)}</p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">{t("investment.pricePerToken")}</p>
                      <p className="text-2xl">${Number(investment.pricePerToken).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("investment.expectedRoi")}</p>
                      <p className="text-2xl text-green-600">
                        {Number(investment.expectedRoi).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {investment.level > 1 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-lg font-medium">
                          {t("investment.level")} {investment.level}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("investment.levelProgress")}</span>
                        <span>{progressToNextLevel.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressToNextLevel} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("investment.performance")}</CardTitle>
                <CardDescription>{t("investment.performanceDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("investment.yourInvestment")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">
                      ${investmentValue.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {totalUserTokens} {t("investment.tokens")}
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => setLocation(`/dashboard`)}>
                    {totalUserTokens > 0 ? t("investment.purchaseMore") : t("investment.investNow")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {investment.type === "real_estate" ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("investment.propertyDetails")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">{t("investment.propertySize")}</p>
                      <p>1,200 m²</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("investment.occupancyRate")}</p>
                      <p>95%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("investment.tenantCount")}</p>
                      <p>3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t("investment.businessMetrics")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">{t("investment.monthlyRevenue")}</p>
                      <p>$45,000</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("investment.profitMargin")}</p>
                      <p>18%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("investment.customerCount")}</p>
                      <p>1,200</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
