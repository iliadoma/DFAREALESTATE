import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["investor", "admin"] }).default("investor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
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
  totalTokens: integer("total_tokens").notNull(),
  availableTokens: integer("available_tokens").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
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

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertInvestmentSchema = createInsertSchema(investments);
export const selectInvestmentSchema = createSelectSchema(investments);
export const insertTokenSchema = createInsertSchema(tokens);
export const selectTokenSchema = createSelectSchema(tokens);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;
export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
export type Distribution = typeof distributions.$inferSelect;