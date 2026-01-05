# 🔍 AI Visibility Tracker

Track how prominently your brand appears in AI-generated responses from **ChatGPT**.

---

## 🎯 What It Does

This tool acts as an **Audit System** for AI visibility. Use it to understand if LLMs (like ChatGPT) recommend your product when users ask generic questions about your industry.

1. **Simulate User Queries**: Generates organic questions based on your category (e.g., "Best CRM software", "Cost-effective project tools").
2. **Audit AI Responses**: Queries OpenAI's models to get authentic AI responses.
3. **Analyze Visibility**: Detects if your brand (and competitors) are mentioned, widely cited, or appearing in specific contexts.
4. **Compare & Optimize**: Side-by-side comparison to see where you win or lose against competitors.

---

## ✨ Features

### Core Capabilities

- ✅ **Category-Based Auditing** - Test how AI responds to generic searches in your niche.
- ✅ **Multi-Brand Tracking** - Monitor your brand alongside multiple competitors.
- ✅ **Organic Prompt Engine** - Uses realistic user intents (Discovery, Recommendation, Pricing) rather than direct brand queries.
- ✅ **Citation Extraction** - Identifies which websites the AI uses as sources of truth.

### Report Dashboard

- ✅ **Visibility Score** - Percentage of prompts where the brand appears.
- ✅ **Citation Share** - Leaderboard of most credited sources.
- ✅ **Brand Leaderboard** - Ranking based on overall presence.
- ✅ **Detailed Insights** - Exact quotes/context of where brands were mentioned.

### Brand Comparison (Gap Analysis)

- ✅ **Neutral Comparison** - Compare any two brands side-by-side.
- ✅ **Win/Loss Analysis** - Identify specific prompts where one brand is recommended over another.
- ✅ **Visual Metrics** - Easy-to-read charts for visibility and mention dominance.

---

## 🛠 Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS + shadcn/ui**
- **TanStack Query** (React Query) - Polling & State Management

### Backend

- **Node.js + Express**
- **TypeScript**
- **BullMQ + Redis** (Job Queue System)
- **OpenAI API** (Auditing & Analysis)
- **PostgreSQL** (Persistence via DAO pattern)

---

## 📖 How It Works

### Audit Pipeline

```
1. User Request (Category + Brands)
       ↓
2. Prompt Generator
       ↓
3. Audit Queue (BullMQ)
       ↓
4. Worker Process
   → Calls OpenAI API (Simulates User)
   → Calls OpenAI API (Analyzer Agent)
   → Extracts Mentions & Citations
       ↓
5. Database (Results Stored)
       ↓
6. Frontend Polling (Updates UI)
```

---

## 🔑 Key Design Decisions

### 1. Reliable API-First Auditing

Migration from web scraping to **OpenAI API** ensures 100% reliability, faster execution, and eliminates "broken selector" issues common with UI scrapers.

### 2. Linear Worker Architecture

To prevent race conditions (where a session marks as "Complete" before analysis is done), the worker handles **Generation + Analysis** synchronously in a single job. This guarantees that when a job finishes, the data is ready.

### 3. Organic Prompt Engineering

Instead of asking "Tell me about Brand X", the system asks **"What are the best CRM tools?"**. This reveals _true_ organic visibility—whether the AI recommends the brand unprompted.

### 4. Neutral Comparison Logic

The UI treats all brands equally. There is no hardcoded "My Brand". Users can select any two brands from the pool to perform a Gap Analysis, making the tool flexible for agency or competitive research use cases.

### 5. Clean Code & Modularity

The Frontend report page was refactored from a monolithic 900-line file into modular components (`MetricCards`, `CompetitorAnalysis`, `BrandLeaderboard`), improving maintainability and readability.

---

# writesonic-challenge
