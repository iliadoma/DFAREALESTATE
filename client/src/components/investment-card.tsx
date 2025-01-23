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

type InvestmentCardProps = {
  investment: Investment;
  userTokens: Token[];
  preview?: boolean;
};

export default function InvestmentCard({ investment, userTokens, preview }: InvestmentCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { purchaseTokens } = useInvestments();
  const { t } = useI18n();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const totalUserTokens = userTokens.reduce((sum, token) => sum + token.amount, 0);
  const investmentValue = Number(investment.pricePerToken) * totalUserTokens;

  // Calculate progress to next level (simple calculation)
  const xpForNextLevel = investment.level * 1000;
  const progressToNextLevel = (investment.experience / xpForNextLevel) * 100;

  const handlePurchase = async () => {
    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) return;

    await purchaseTokens({
      investmentId: investment.id,
      amount: tokenAmount,
    });
    setIsOpen(false);
    setAmount("");
  };

  const handleAction = () => {
    if (preview) {
      setLocation("/auth");
      return;
    }
    setIsOpen(true);
  };

  return (
    <Card className="relative overflow-hidden">
      {!preview && investment.level > 1 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{t("investment.level")} {investment.level}</span>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{investment.name}</CardTitle>
            <CardDescription className="mt-1">
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
            <MapPin className="h-4 w-4 mr-1" />
            {investment.location}
          </div>
          <p className="text-sm">{t(`investment.descriptions.${investment.category}`)}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">{t("investment.pricePerToken")}</p>
              <p className="text-lg">${Number(investment.pricePerToken).toFixed(2)}</p>
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
              <p className="text-lg">${investmentValue.toFixed(2)}</p>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("investment.purchaseTokens.title")}</DialogTitle>
                <DialogDescription>
                  {t("investment.purchaseTokens.description", { name: investment.name })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("investment.purchaseTokens.numberOfTokens")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t("investment.purchaseTokens.enterAmount")}
                  />
                </div>
                <div className="text-sm">
                  <p>{t("investment.purchaseTokens.pricePerToken")}: ${Number(investment.pricePerToken).toFixed(2)}</p>
                  <p className="font-medium mt-2">
                    {t("investment.purchaseTokens.total")}: $
                    {(Number(investment.pricePerToken) * (parseInt(amount) || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handlePurchase}>{t("investment.purchaseTokens.confirm")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}