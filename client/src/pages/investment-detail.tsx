import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n/context";
import { useInvestments } from "@/hooks/use-investments";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, TrendingUp, ArrowLeft, Star } from "lucide-react";
import type { Investment } from "@db/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount: number, currency: string) => {
  return currency === 'RUB' ? `${amount.toLocaleString('ru-RU')} ₽` : `$${amount.toFixed(2)}`;
};

export default function InvestmentDetail() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const pathname = window.location.pathname;
  const investmentId = parseInt(pathname.split('/').pop() || '');
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: investment, isLoading: investmentLoading } = useQuery<Investment>({
    queryKey: [`/api/investments/${investmentId}`],
  });

  const { portfolio, purchaseTokens } = useInvestments();
  const userTokens = portfolio?.filter(t => t.investmentId === investmentId) ?? [];
  const totalUserTokens = userTokens.reduce((sum, token) => sum + token.amount, 0);
  const investmentValue = investment ? Number(investment.pricePerToken) * totalUserTokens : 0;

  const handlePurchase = async () => {
    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid number of tokens"
      });
      return;
    }

    if (tokenAmount > (investment?.availableTokens || 0)) {
      toast({
        variant: "destructive",
        title: "Not enough tokens",
        description: `Only ${investment?.availableTokens} tokens available`
      });
      return;
    }

    setIsLoading(true);
    try {
      await purchaseTokens({
        investmentId: investment!.id,
        amount: tokenAmount,
      });
      setIsOpen(false);
      setAmount("");
      toast({
        title: "Success",
        description: "Successfully purchased tokens"
      });
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to purchase tokens"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestClick = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    setIsOpen(true);
  };

  // Mock data for the performance chart
  const performanceData = [
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 1100 },
    { month: 'Apr', value: 1400 },
    { month: 'May', value: 1300 },
    { month: 'Jun', value: 1600 }
  ];

  if (investmentLoading || !investment) {
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

                  <p className="text-sm">{t(`investment.descriptions.${investment.translationKey}`)}</p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">{t("investment.pricePerToken")}</p>
                      <p className="text-2xl">{formatCurrency(Number(investment.pricePerToken), investment.currency)}</p>
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
                      {formatCurrency(investmentValue, investment.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {totalUserTokens} {t("investment.tokens")}
                    </p>
                  </div>
                  <Button className="w-full" onClick={handleInvestClick}>
                    {!user ? t("investment.signUpToInvest") :
                      totalUserTokens > 0 ? t("investment.purchaseMore") : t("investment.investNow")}
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

      {user && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("investment.purchaseTokens.title")}</DialogTitle>
              <DialogDescription>
                {t("investment.purchaseTokens.description", { investment: investment.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("investment.purchaseTokens.numberOfTokens")}</Label>
                <Input
                  type="number"
                  min="1"
                  max={investment.availableTokens}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("investment.purchaseTokens.enterAmount")}
                />
              </div>
              <div className="text-sm">
                <p>
                  {t("investment.purchaseTokens.pricePerToken")}: {formatCurrency(Number(investment.pricePerToken), investment.currency)}
                </p>
                <p className="font-medium mt-2">
                  {t("investment.purchaseTokens.total")}: {formatCurrency((Number(investment.pricePerToken) * (parseInt(amount) || 0)), investment.currency)}
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handlePurchase} disabled={isLoading}>
                {isLoading ? t("common.loading") : t("investment.purchaseTokens.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}