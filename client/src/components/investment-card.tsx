import { useState } from "react";
import { Building2, Store, MapPin, TrendingUp, Star } from "lucide-react";
import { useInvestments } from "@/hooks/use-investments";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
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

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setLocation("/auth");
      return;
    }

    if (!preview) {
      setIsOpen(true);
    }
  };

  const handleCardClick = () => {
    if (!preview && user) {
      setLocation(`/investments/${investment.id}`);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={investment.imageUrl}
          alt={investment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white/95">
            {t(investment.type === "real_estate" ? "investment.types.realEstate" : "investment.types.business")}
          </Badge>
          {Number(investment.expectedRoi) > 15 && (
            <Badge variant="secondary" className="bg-green-500/90 text-white hover:bg-green-500/95">
              High ROI
            </Badge>
          )}
        </div>
        {!preview && investment.level > 1 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-yellow-500/90 rounded-full text-white">
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">Level {investment.level}</span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight">
                {investment.name}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{investment.location}</span>
              </div>
            </div>
            {investment.type === "real_estate" ? (
              <Building2 className="h-6 w-6 text-primary" />
            ) : (
              <Store className="h-6 w-6 text-primary" />
            )}
          </div>

          {/* Investment Details */}
          <div className="grid grid-cols-2 gap-6 py-4 border-y">
            <div>
              <p className="text-sm text-muted-foreground">{t("investment.expectedRoi")}</p>
              <p className="text-xl font-semibold text-green-600">
                {Number(investment.expectedRoi).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("investment.pricePerToken")}</p>
              <p className="text-xl font-semibold">
                {formatCurrency(Number(investment.pricePerToken), investment.currency)}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {investment.description}
          </p>

          {/* User Investment Info */}
          {!preview && totalUserTokens > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium">{t("investment.yourInvestment")}</p>
              <p className="text-lg font-semibold">
                {formatCurrency(investmentValue, investment.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalUserTokens} {t("investment.tokens")}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        {!user ? (
          <Button className="w-full" size="lg" onClick={handleAction}>
            {t("investment.signUpToInvest")}
          </Button>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg" onClick={handleAction}>
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