import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["investor", "admin"] }).default("investor").notNull(),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  translationKey: text("translation_key").notNull(),
  type: text("type", { enum: ["real_estate", "business"] }).notNull(),
  category: text("category", { 
    enum: [
      // Real Estate Categories
      "standalone_building",
      "ground_floor_commercial",
      "mixed_use",
      "office_space",
      "warehouse",
      // Business Categories
      "yoga_studio",
      "restaurant",
      "fitness_center",
      "coffee_shop",
      "retail_store",
      "coworking_space"
    ]
  }).notNull(),
  location: text("location").notNull(),
  expectedRoi: decimal("expected_roi", { precision: 5, scale: 2 }).notNull(),
  pricePerToken: decimal("price_per_token", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency", { enum: ["RUB", "USD"] }).default("RUB").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  availableTokens: integer("available_tokens").notNull(),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type", { 
    enum: [
      "first_investment",
      "investment_milestone",
      "portfolio_value",
      "consecutive_login",
      "top_investor"
    ]
  }).notNull(),
  level: integer("level").default(1).notNull(),
  data: jsonb("data"),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  investmentId: integer("investment_id").references(() => investments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const distributions = pgTable("distributions", {
  id: serial("id").primaryKey(),
  investmentId: integer("investment_id").references(() => investments.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  distributionDate: timestamp("distribution_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const investmentsRelations = relations(investments, ({ many }) => ({
  tokens: many(tokens),
  distributions: many(distributions)
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  investment: one(investments, {
    fields: [tokens.investmentId],
    references: [investments.id]
  }),
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id]
  })
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id]
  })
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertInvestmentSchema = createInsertSchema(investments);
export const selectInvestmentSchema = createSelectSchema(investments);
export const insertTokenSchema = createInsertSchema(tokens);
export const selectTokenSchema = createSelectSchema(tokens);
export const insertAchievementSchema = createInsertSchema(achievements);
export const selectAchievementSchema = createSelectSchema(achievements);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;
export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
export type Distribution = typeof distributions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;