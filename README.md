# ⚡ Sonic - AI Visibility Tracker

> **Track, Analyze, and Optimize your brand's presence in AI-generated responses.**

Sonic is a powerful intelligence tool designed to audit how LLMs (like ChatGPT) perceive and recommend your brand. By simulating user queries and analyzing real-time responses, Sonic helps you understand your share of voice in the AI era.

---

## ✨ Features

### 🎯 **Playground & Real-Time Auditing**

- **Live Simulation**: Generate organic user questions based on your industry category.
- **Brand Detection**: Automatically detect mentions of your brand and competitors in AI responses.
- **Sentiment Analysis**: Understand the context of how your brand is being portrayed.

### 📊 **Intelligent Dashboard**

- **Win/Loss Analysis**: See exactly where you stand against competitors.
- **Visibility Score**: Track your "Share of Model" over time.
- **Session History**: Access past audit sessions and track improvements.

### 📝 **Comprehensive Reports**

- **Detailed Citations**: Identify which sources LLMs are using to gather information about you.
- **Gap Analysis**: Discover missing keywords or topics that competitors are ranking for.

---

## 🛠️ Tech Stack

Built with a modern, high-performance stack designed for scalability and developer experience.

### **Frontend** (`/frontend`)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### **Backend** (`/backend`)

- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Queue System**: [BullMQ](https://docs.bullmq.io/) & Redis
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API
- **Scraping**: Puppeteer (Stealth Plugin)
