# 🚀 Complete Setup Instructions

## 📁 Project Structure
Create a new directory and set up the following structure:

\`\`\`
dr-abel-health-consultancy/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   ├── appointments/
│   │   │   └── route.ts
│   │   ├── contact/
│   │   │   └── route.ts
│   │   ├── newsletter/
│   │   │   └── route.ts
│   │   ├── posts/
│   │   │   └── route.ts
│   │   └── search/
│   │       └── route.ts
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── faq/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── publications/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── services/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   └── sidebar.tsx
│   ├── ui/
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   ├── footer.tsx
│   ├── header.tsx
│   ├── newsletter-form.tsx
│   └── search-dialog.tsx
├── lib/
│   ├── auth.ts
│   ├── email.ts
│   ├── prisma.ts
│   ├── rate-limit.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── next-auth.d.ts
├── .env.example
├── .gitignore
├── middleware.ts
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

## 🛠 Step-by-Step Setup

### 1. Initialize Project
\`\`\`bash
mkdir dr-abel-health-consultancy
cd dr-abel-health-consultancy
npm init -y
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Core dependencies
npm install next@14.0.0 react@^18.2.0 react-dom@^18.2.0

# Database & Auth
npm install @prisma/client prisma next-auth @next-auth/prisma-adapter

# Validation & Email
npm install zod nodemailer @types/nodemailer

# UI Components
npm install @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-navigation-menu @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-sheet @radix-ui/react-tabs @radix-ui/react-toast

# Styling
npm install class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate

# Dev Dependencies
npm install -D @types/node @types/react @types/react-dom autoprefixer eslint eslint-config-next postcss tailwindcss typescript tsx
\`\`\`

### 3. Create All Files
Copy all the files from the code project above into their respective directories.

### 4. Environment Setup
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables:
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/dr_abel_health"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@drabelhealthconsulting.org"
ADMIN_EMAIL="admin@drabelhealthconsulting.org"
\`\`\`

### 5. Database Setup
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with initial data
npm run db:seed
\`\`\`

### 6. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 7. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Database Studio**: `npx prisma studio`

## 🔧 Configuration

### Gmail Setup for Email
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_SERVER_PASSWORD`

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### PostgreSQL Setup
#### Local Setup:
\`\`\`bash
# Install PostgreSQL
# Create database
createdb dr_abel_health

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/dr_abel_health"
\`\`\`

#### Cloud Setup (Recommended):
- **Supabase**: Free PostgreSQL hosting
- **Railway**: Easy deployment with database
- **Neon**: Serverless PostgreSQL

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Railway
1. Connect GitHub repository
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy

## 📝 Usage

### Admin Access
1. Sign in at `/auth/signin`
2. Use Google OAuth or email magic link
3. Access admin panel at `/admin`

### Content Management
1. Create posts in admin panel
2. Manage users and roles
3. View analytics and audit logs
4. Handle contact forms and appointments

### API Usage
- Contact form: `POST /api/contact`
- Newsletter: `POST /api/newsletter`
- Search: `GET /api/search?q=query`
- Posts: `GET /api/posts`

## 🔒 Security Notes

- Rate limiting is enabled on all forms
- Input validation with Zod schemas
- Role-based access control
- Audit logging for admin actions
- CSRF protection built-in

## 🐛 Troubleshooting

### Common Issues:
1. **Database connection**: Check DATABASE_URL format
2. **Email not sending**: Verify SMTP credentials
3. **OAuth errors**: Check redirect URIs
4. **Build errors**: Run `npm run type-check`

### Debug Commands:
\`\`\`bash
# Check database connection
npx prisma db pull

# View database
npx prisma studio

# Check types
npm run type-check

# View logs
npm run dev
\`\`\`

## 📚 Next Steps

1. **Add Multilingual Support**: Implement i18n
2. **Setup Analytics**: Add Plausible or Umami
3. **Add Search**: Integrate Meilisearch
4. **PWA Features**: Add offline functionality
5. **Image Upload**: Integrate Cloudinary

Your complete Dr. Abel Health Consultancy application is now ready! 🎉
