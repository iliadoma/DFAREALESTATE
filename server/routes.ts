import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { investments, tokens, distributions, insertInvestmentSchema } from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Investment routes
  app.get("/api/investments", async (_req, res) => {
    try {
      const result = await db.query.investments.findMany({
        orderBy: (investments, { desc }) => [desc(investments.createdAt)]
      });
      res.json(result);
    } catch (error) {
      res.status(500).send("Error fetching investments");
    }
  });

  app.get("/api/investments/:id", async (req, res) => {
    try {
      const [investment] = await db
        .select()
        .from(investments)
        .where(eq(investments.id, parseInt(req.params.id)))
        .limit(1);
      
      if (!investment) {
        return res.status(404).send("Investment not found");
      }
      
      res.json(investment);
    } catch (error) {
      res.status(500).send("Error fetching investment");
    }
  });
  
  app.post("/api/investments", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }

    try {
      const result = insertInvestmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send("Invalid input");
      }

      const [investment] = await db
        .insert(investments)
        .values(result.data)
        .returning();

      res.json(investment);
    } catch (error) {
      res.status(500).send("Error creating investment");
    }
  });

  // Token routes
  app.get("/api/portfolio", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userTokens = await db.query.tokens.findMany({
        where: eq(tokens.userId, req.user.id),
        with: {
          investment: true
        }
      });

      res.json(userTokens);
    } catch (error) {
      res.status(500).send("Error fetching portfolio");
    }
  });

  app.post("/api/tokens/purchase", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { investmentId, amount } = req.body;

    try {
      const [investment] = await db
        .select()
        .from(investments)
        .where(and(
          eq(investments.id, investmentId),
          eq(investments.isActive, true)
        ))
        .limit(1);

      if (!investment) {
        return res.status(404).send("Investment not found or inactive");
      }

      const [token] = await db
        .insert(tokens)
        .values({
          investmentId,
          userId: req.user.id,
          amount,
          purchasePrice: investment.pricePerToken
        })
        .returning();

      res.json(token);
    } catch (error) {
      res.status(500).send("Error purchasing tokens");
    }
  });

  // Distribution routes
  app.get("/api/distributions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userDistributions = await db
        .select({
          distribution: distributions,
          investment: investments
        })
        .from(distributions)
        .innerJoin(tokens, eq(tokens.investmentId, distributions.investmentId))
        .innerJoin(investments, eq(investments.id, distributions.investmentId))
        .where(eq(tokens.userId, req.user.id));

      res.json(userDistributions);
    } catch (error) {
      res.status(500).send("Error fetching distributions");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}