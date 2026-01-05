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


