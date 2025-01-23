import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TokenizedAssets</h1>
          <Button onClick={() => setLocation("/auth")}>Get Started</Button>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Invest in Premium Real Estate & Businesses
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Access fractional ownership of high-quality commercial properties and
              established businesses through digital asset tokens.
            </p>
            <Button size="lg" onClick={() => setLocation("/auth")}>
              Start Investing
            </Button>
          </div>
        </section>

        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8">
              Why Choose TokenizedAssets?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Fractional Ownership</CardTitle>
                  <CardDescription>
                    Invest in premium assets with minimal capital
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Start with as little as you want and gradually build your
                  portfolio of tokenized assets.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Income</CardTitle>
                  <CardDescription>
                    Earn regular returns from your investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Receive your share of rental income and business profits
                  directly.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Liquidity</CardTitle>
                  <CardDescription>
                    Trade your tokens easily
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Sell your tokens on our secondary market when you need
                  liquidity.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 TokenizedAssets. All rights reserved.
        </div>
      </footer>
    </div>
  );
}