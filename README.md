# 🩺 Dr. Abel Gedefaw Ali Health Consultancy Web Application

A production-grade, multilingual, secure, and performant web platform built with Next.js (TypeScript) and an open-source, cost-efficient stack — tailored for public health communication, policy advocacy, and evidence-based content delivery in Ethiopia and beyond.

## 🔐 Authentication Setup

This project uses NextAuth.js for authentication with the following features:

- Email/Password authentication
- Google OAuth integration
- Role-based access control (Admin/User)
- Secure session management
- Password reset flow

### Available Authentication Methods

1. **Email/Password**
   - Users can sign up with email and password
   - Email verification is required for new accounts
   - Password reset functionality

2. **Google OAuth**
   - Single sign-on with Google
   - Automatic account creation for new users
   - Email verification is not required for OAuth users

### Role-Based Access Control

- **Admin**: Full access to all features
- **User**: Limited access to public features and personal account

### Environment Variables

See the `.env` section above for required authentication-related environment variables.

## 🎯 Features

- **Multilingual Support**: English, Amharic, Afaan Oromo, Tigrinya
- **Content Management**: Full CRUD for posts, users, roles, translations
- **Evidence-based Publishing**: Rich content editor with citations and author bios
- **Post Archiving & Versioning**: Content lifecycle management
- **Secure Authentication**: NextAuth.js with role-based access
- **Full-text Search**: Real-time fuzzy search
- **Newsletter Integration**: Email signup and management
- **Appointment Booking**: Secure consultation scheduling
- **Admin Dashboard**: Complete administrative interface
- **Performance Optimized**: Lighthouse score >95
- **WCAG Compliant**: Full accessibility support

## 🧱 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Validation**: Zod
- **UI Components**: Radix UI
- **Deployment**: Vercel/Railway

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/dr-abel-health-consultancy.git
   cd dr-abel-health-consultancy
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key" # Generate with: openssl rand -base64 32
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email (for password reset, etc.)
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="username"
   EMAIL_SERVER_PASSWORD="password"
   EMAIL_FROM="noreply@example.com"
   
   # Admin emails (comma-separated)
   ADMIN_EMAILS="admin@example.com,admin2@example.com"
   ```

   > **Note**: For production, ensure all secrets are securely managed and never committed to version control.
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   - Database URL
   - NextAuth secret and providers
   - Email configuration
   - Admin email

4. **Set up the database**
   \`\`\`bash
   npm run db:generate
   npm run db:push
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and role management
- **Posts**: Blog posts and articles with versioning
- **Comments**: User feedback with moderation
- **Contacts**: Contact form submissions
- **Appointments**: Consultation bookings
- **Newsletter**: Email subscriptions
- **Testimonials**: User reviews
- **Audit Logs**: Admin activity tracking

## 🔐 Authentication & Authorization

### Roles
- **ADMIN**: Full system access
- **EDITOR**: Content management
- **VIEWER**: Read-only access

### Setup OAuth (Optional)
1. Create Google OAuth credentials
2. Add client ID and secret to environment variables
3. Configure authorized redirect URIs

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app password
3. Use app password in EMAIL_SERVER_PASSWORD

### Other Providers
- SendGrid
- Mailgun
- AWS SES
- Any SMTP service

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Railway
1. Connect repository
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## 🛠 Development

### Database Operations
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
\`\`\`

### Code Quality
\`\`\`bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
\`\`\`

## 📱 API Endpoints

### Public APIs
- `GET /api/posts` - Fetch published posts
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter` - Newsletter subscription
- `POST /api/appointments` - Book appointment
- `GET /api/search` - Search content

### Admin APIs (Protected)
- `POST /api/posts` - Create post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `GET /api/admin/*` - Admin dashboard data

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in Next.js protection
- **SQL Injection Prevention**: Prisma ORM
- **XSS Protection**: Content sanitization
- **Role-based Access**: Granular permissions
- **Audit Logging**: Track admin activities

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**
- **Keyboard Navigation**
- **Screen Reader Support**
- **High Contrast Mode**
- **Focus Management**
- **Print Styles**

## 🌍 Internationalization

### Supported Languages
- English (EN)
- Amharic (AM) - አማርኛ
- Afaan Oromo (OR)
- Tigrinya (TI) - ትግርኛ

### Adding New Languages
1. Add language to Prisma schema
2. Create translation files
3. Update language selector
4. Add RTL support if needed

## 📈 Performance

- **Lighthouse Score**: >95
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Database query optimization
- **CDN**: Static asset delivery

## 🐛 Error Handling

- **Sentry Integration**: Error tracking and monitoring
- **Graceful Degradation**: Fallback UI states
- **User-friendly Messages**: Clear error communication
- **Logging**: Comprehensive error logging

## 🧪 Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
\`\`\`

## 📚 Documentation

- **API Documentation**: Available at `/api/docs`
- **Admin Guide**: See `/docs/admin-guide.md`
- **Deployment Guide**: See `/docs/deployment.md`
- **Contributing**: See `CONTRIBUTING.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: GitHub Issues
- **Email**: support@drabelhealthconsulting.org
- **Community**: Join our Discord

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Radix UI for accessible components
- Tailwind CSS for utility-first styling
- All contributors and supporters

---

**Built with ❤️ for Ethiopian health advancement**
