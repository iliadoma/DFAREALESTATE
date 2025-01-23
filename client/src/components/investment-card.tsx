import { useState } from "react";
import { Building2, MapPin, TrendingUp } from "lucide-react";
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
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const totalUserTokens = userTokens.reduce((sum, token) => sum + token.amount, 0);
  const investmentValue = Number(investment.pricePerToken) * totalUserTokens;

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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{investment.name}</CardTitle>
            <CardDescription className="mt-1">
              {investment.type === "real_estate" ? "Real Estate" : "Business"}
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
          <p className="text-sm">{investment.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Price per Token</p>
              <p className="text-lg">${Number(investment.pricePerToken).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Expected ROI</p>
              <p className="text-lg text-green-600">
                {Number(investment.expectedRoi).toFixed(1)}%
              </p>
            </div>
          </div>
          {!preview && totalUserTokens > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Your Investment</p>
              <p className="text-lg">${investmentValue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {totalUserTokens} tokens
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {preview ? (
          <Button className="w-full" onClick={handleAction}>
            Sign Up to Invest
          </Button>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={handleAction}>
                {totalUserTokens > 0 ? "Purchase More" : "Invest Now"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Purchase Tokens</DialogTitle>
                <DialogDescription>
                  Enter the number of tokens you want to purchase for {investment.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Number of Tokens</Label>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="text-sm">
                  <p>Price per token: ${Number(investment.pricePerToken).toFixed(2)}</p>
                  <p className="font-medium mt-2">
                    Total: $
                    {(Number(investment.pricePerToken) * (parseInt(amount) || 0)).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePurchase}>Confirm Purchase</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}