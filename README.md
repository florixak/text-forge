# TextForge

**TextForge** is a powerful AI-driven text transformation and data structuring platform. Convert between multiple data formats, generate structured data with AI, and process text at scale with support for both free and premium plans.

---

## ✨ Features

- **Format Conversion**: Convert text between multiple formats (JSON, CSV, YAML, XML, and more)
- **Intelligent Detection**: Auto-detect input format and convert to desired output
- **AI-Powered**: Leverage OpenAI and Google AI to structure and generate data
- **User Accounts**: Secure authentication with email verification
- **Subscription Plans**: Free and Pro tiers with different usage limits
- **History Tracking**: View and manage your past conversions
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Theme switcher for user preference

---

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Framework**: TanStack Start
- **Database**: PostgreSQL with Drizzle
- **Authentication**: Better Auth
- **AI Integration**: Vercel AI SDK (OpenAI, Google AI)
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Email**: Resend
- **Payments**: Stripe
- **Forms & Validation**: Zod, TanStack Form
- **Build Tool**: Vite
- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/)
- PostgreSQL database
- (Optional) [OpenAI API Key](https://platform.openai.com/)
- (Optional) [Google AI API Key](https://ai.google.dev/)
- (Optional) [Stripe Account](https://stripe.com/)
- (Optional) [Resend Account](https://resend.com/) for emails

---

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/florixak/text-forge.git
   cd text-forge
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   Create a `.env.local` file with required variables:

   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/text_forge

   # Authentication
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL=http://localhost:3000

   # AI Services
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key

   # Payments
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Email
   RESEND_API_KEY=your_resend_api_key

   # Client-side
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Setup database**

   ```bash
   pnpm db:push
   ```

5. **Run development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 📐 Project Structure

```text
/src
  /components       → Reusable UI components
    /dashboard      → Dashboard-specific components
    /history        → History and filtering components
    /state          → Loading, error, and state components
    /ui             → Base UI component library
  /routes           → TanStack Router route definitions
    /api            → Backend API endpoints
  /lib              → Utility and service functions
  /hooks            → Custom React hooks
  /constants        → App constants and configuration
  /db               → Database schema and utilities
  /types            → TypeScript type definitions
  /integrations     → Third-party service integrations
```

---

## 🔄 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build locally
pnpm test         # Run tests with Vitest
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm check        # Run format and lint with fixes
pnpm db:generate  # Generate database migrations
pnpm db:push      # Push migrations to database
pnpm db:studio    # Open Drizzle Studio
```

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
