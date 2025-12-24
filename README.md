# 🚀 GMNEXTGENTECH Intelligent Management System

A full-stack AI-powered company management web application built with PostgreSQL, Express.js, React, and Node.js.

## 📚 Documentation

- **[🚀 Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Complete setup & deployment instructions
- **[⚡ Quick Start Guide](./QUICK_START.md)** - Get running in 3 minutes
- **[✅ Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Production deployment guide
- **[🧹 Cleanup Summary](./CLEANUP_SUMMARY.md)** - Project structure overview

---

## Features

### 🔐 Authentication & User Roles
- Secure JWT-based authentication
- Three role types: Admin, Manager, Employee
- Role-based access control with granular permissions

### 💰 Investment Management
- Create, read, update, and delete investments
- Track investment sources, amounts, dates, and status
- Real-time analytics and trend visualization
- Filter by source, status, and date range

### 💸 Expense & Rent Management
- Comprehensive expense tracking by category
- Monthly rent management
- Auto-generated expense reports
- Export functionality (CSV/PDF ready)
- Category-wise breakdown and analytics

### 📊 Project Management
- Full CRUD operations for projects
- Track project source (who brought/referred the project)
- Project types: Client, Internal, Government
- Assign team members to projects
- Progress tracking with visual indicators
- Filter by source, type, status, and assigned members

### 🤖 AI Assistant
- Natural language query processing
- Intelligent data retrieval and insights
- Query examples:
  - "Show me all projects from Ali Khan"
  - "List active investments above 100,000"
  - "How much rent did we pay in July?"
  - "Give me a company overview"

### 📈 Dashboard & Analytics
- Real-time summary panels
- Interactive charts and graphs
- Investment vs Expense comparison
- Monthly and yearly trend analysis
- Project distribution by source and type
- Recent activities feed

### 🎨 Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark/Light mode toggle
- Smooth animations with Framer Motion
- Clean and intuitive interface
- Sidebar navigation with icons

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components
- **Heroicons** - Icon library
- **Chart.js & react-chartjs-2** - Data visualization
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client (for AI API calls)

### AI Integration
- Hugging Face API (optional)
- Natural language processing for queries
- Intelligent data retrieval

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gmnextgentech
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
```

5. Create PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE gmnextgentech;
\q
```

6. Initialize database and create admin:
```bash
node setupDatabase.js
node createAdmin.js
```

7. Start the backend server:
```bash
node server.js
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Admin Account

The admin account is automatically created when you run `createAdmin.js`:

```
Email:    admin@gmnextgentech.com
Password: admin123
Role:     admin
```

**⚠️ Important:** Change this password after first login in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin/Manager)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Investments (Admin/Manager)
- `GET /api/investments` - Get all investments
- `GET /api/investments/stats` - Get investment statistics
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment (Admin only)

### Expenses (Admin/Manager)
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/stats` - Get expense statistics
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense (Admin only)

### Projects
- `GET /api/projects` - Get projects (filtered by role)
- `GET /api/projects/stats` - Get project statistics
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Admin/Manager)
- `PUT /api/projects/:id` - Update project (Admin/Manager)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### AI Assistant
- `POST /api/ai/query` - Process natural language query

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

## Project Structure

```
gmnextgentech/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Investment.js
│   │   ├── Expense.js
│   │   └── Project.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── investments.js
│   │   ├── expenses.js
│   │   ├── projects.js
│   │   ├── ai.js
│   │   └── dashboard.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Layout/
│   │   │   └── Modals/
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Projects.js
│   │   │   ├── Investments.js
│   │   │   ├── Expenses.js
│   │   │   ├── Users.js
│   │   │   └── AIAssistant.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Role-Based Permissions

### Admin
- Full access to all features
- Manage users (create, edit, delete)
- Manage all projects, investments, and expenses
- Access all analytics and reports

### Manager
- Manage projects and expenses
- View and create investments
- View user list
- Access analytics and reports
- No user management

### Employee
- View assigned projects only
- View project details
- Use AI Assistant
- View dashboard (limited data)

## Deployment

📖 **See [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) for complete production deployment guide.**

### Quick Deployment Options

#### Backend (Heroku/Railway/DigitalOcean)
1. Create new project
2. Add PostgreSQL database
3. Set environment variables
4. Deploy from GitHub
5. Run `setupDatabase.js` and `createAdmin.js`

#### Frontend (Vercel/Netlify/GitHub Pages)
1. Create new project
2. Connect repository
3. Build command: `npm run build`
4. Publish directory: `build`
5. Deploy

#### Database (PostgreSQL)
- Heroku Postgres
- Railway Postgres
- DigitalOcean Managed Database
- ElephantSQL (free tier)

## Features Completed ✅

- [x] Export reports to CSV/PDF
- [x] Advanced analytics & charts
- [x] AI Assistant integration
- [x] Real-time notifications
- [x] Dark/Light theme
- [x] Responsive design
- [x] Role-based access control

## Future Enhancements

- [ ] Email notifications
- [ ] Project timeline view
- [ ] File attachments
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced AI features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@gmnextgentech.com or open an issue in the repository.

## Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- PostgreSQL team for the robust database
- Sequelize for the excellent ORM
- Chart.js for data visualization
- Framer Motion for beautiful animations
- All open-source contributors

---

Built with ❤️ by GMNEXTGENTECH Team
