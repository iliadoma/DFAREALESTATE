import { useState } from "react";
import { Building2, MapPin, TrendingUp, Star } from "lucide-react";
import { useInvestments } from "@/hooks/use-investments";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n/context";
import type { Investment, Token } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type InvestmentCardProps = {
  investment: Investment;
  userTokens: Token[];
  preview?: boolean;
};

const formatCurrency = (amount: number, currency: string) => {
  return currency === 'RUB' ? `${amount.toLocaleString('ru-RU')} ₽` : `$${amount.toFixed(2)}`;
};

export default function InvestmentCard({ investment, userTokens, preview }: InvestmentCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { purchaseTokens } = useInvestments();
  const { t } = useI18n();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalUserTokens = userTokens.reduce((sum, token) => sum + token.amount, 0);
  const investmentValue = Number(investment.pricePerToken) * totalUserTokens;

  const xpForNextLevel = investment.level * 1000;
  const progressToNextLevel = (investment.experience / xpForNextLevel) * 100;

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

    if (tokenAmount > investment.availableTokens) {
      toast({
        variant: "destructive",
        title: "Not enough tokens",
        description: `Only ${investment.availableTokens} tokens available`
      });
      return;
    }

    setIsLoading(true);
    try {
      await purchaseTokens({
        investmentId: investment.id,
        amount: tokenAmount,
      });
      setIsOpen(false);
      setAmount("");
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (preview) {
      setLocation("/auth");
      return;
    }
    setIsOpen(true);
  };

  const handleCardClick = () => {
    if (!preview && user) {
      setLocation(`/investments/${investment.id}`);
    }
  };

  return (
    <Card
      className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      {!preview && investment.level > 1 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{t("investment.level")} {investment.level}</span>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="leading-tight">
              {investment.name}
            </CardTitle>
            <CardDescription>
              {t(investment.type === "real_estate" ? "investment.types.realEstate" : "investment.types.business")}
            </CardDescription>
          </div>
          {investment.type === "real_estate" ? (
            <Building2 className="h-5 w-5 text-muted-foreground" />
          ) : (
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {investment.location}
            </span>
          </div>
          <p className="text-sm line-clamp-2">
            {investment.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">{t("investment.pricePerToken")}</p>
              <p className="text-lg">{formatCurrency(Number(investment.pricePerToken), investment.currency)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("investment.expectedRoi")}</p>
              <p className="text-lg text-green-600">
                {Number(investment.expectedRoi).toFixed(1)}%
              </p>
            </div>
          </div>
          {!preview && investment.level > 1 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t("investment.levelProgress")}</span>
                <span>{progressToNextLevel.toFixed(0)}%</span>
              </div>
              <Progress value={progressToNextLevel} className="h-1" />
            </div>
          )}
          {!preview && totalUserTokens > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">{t("investment.yourInvestment")}</p>
              <p className="text-lg">{formatCurrency(investmentValue, investment.currency)}</p>
              <p className="text-sm text-muted-foreground">
                {totalUserTokens} {t("investment.tokens")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {preview ? (
          <Button className="w-full" onClick={handleAction}>
            {t("investment.signUpToInvest")}
          </Button>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={handleAction}>
                {totalUserTokens > 0 ? t("investment.purchaseMore") : t("investment.investNow")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("investment.purchaseTokens.title")}</DialogTitle>
                <DialogDescription>
                  {t("investment.purchaseTokens.description")}
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
      </CardFooter>
    </Card>
  );
}