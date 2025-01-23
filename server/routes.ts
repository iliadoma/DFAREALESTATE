import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { investments, tokens, distributions, insertInvestmentSchema } from "@db/schema";
import { eq, and } from "drizzle-orm";
import path from "path";
import express from "express";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Serve attached assets statically with proper content type handling
  const assetsPath = path.join(process.cwd(), 'attached_assets');
  console.log('Serving assets from:', assetsPath);

  app.use('/assets', (req, res, next) => {
    console.log('Asset request:', req.path);
    next();
  }, express.static(assetsPath, {
    setHeaders: (res, filePath) => {
      console.log('Serving file:', filePath);
      // Set proper content type for PNG files
      if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      // Set proper content type for JPG/JPEG files
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
    }
  }));

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

  // Portfolio route
  app.get("/api/portfolio", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userTokens = await db.query.tokens.findMany({
        where: eq(tokens.userId, req.user!.id),
        with: {
          investment: true
        }
      });

      res.json(userTokens);
    } catch (error) {
      console.error("Portfolio fetch error:", error);
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
          userId: req.user!.id,
          amount,
          purchasePrice: investment.pricePerToken
        })
        .returning();

      res.json(token);
    } catch (error) {
      console.error("Token purchase error:", error);
      res.status(500).send("Error purchasing tokens");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}