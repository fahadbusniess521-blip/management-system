# ⚡ Quick Start Guide - GMNEXTGENTECH

## 🚀 Start Your System in 3 Minutes

---

## ✅ Prerequisites Check

Before starting, verify you have:
- [x] PostgreSQL installed and running
- [x] Node.js installed (v16+)
- [x] Database `gmnextgentech` created

---

## 🏃 Quick Start

### Step 1: Start Backend (Terminal 1)
```bash
cd C:/Users/Ghost/Desktop/management/backend
node server.js
```
**Expected:** `Server is running on port 5000` ✓

### Step 2: Start Frontend (Terminal 2)
```bash
cd C:/Users/Ghost/Desktop/management/frontend
npm start
```
**Expected:** Browser opens at `http://localhost:3000` ✓

### Step 3: Login
```
Email:    admin@gmnextgentech.com
Password: admin123
```

---

## 🎯 Common Tasks

### Add a Project
1. Click **Projects** in sidebar
2. Click **+ New Project**
3. Fill form → **Save**

### Add an Investment
1. Click **Investments** in sidebar
2. Click **+ New Investment**
3. Fill form → **Save**

### Add an Expense
1. Click **Expenses** in sidebar
2. Click **+ New Expense**
3. Fill form → **Save**

### Add a User (Admin only)
1. Click **Users** in sidebar
2. Click **+ Add User**
3. Fill form → **Save**

### Export Data
- Go to **Investments** or **Expenses**
- Click **CSV** or **PDF** button

### Use AI Assistant
1. Click **AI Assistant** in sidebar
2. Type: "Show me all investments"
3. Press **Send**

---

## 🔧 Restart Servers

### Restart Backend
```bash
# In backend terminal
Ctrl + C  (stop)
node server.js  (start)
```

### Restart Frontend
```bash
# In frontend terminal
Ctrl + C  (stop)
npm start  (start)
```

---

## 🆘 Quick Fixes

### Backend won't start?
```bash
# Kill port 5000
netstat -ano | findstr :5000
taskkill /F /PID <number>
```

### Database error?
```bash
# Restart PostgreSQL
# Windows: Services → PostgreSQL → Restart
# Verify password in backend/.env
```

### Frontend can't connect?
```bash
# Check backend is running
# Clear browser cache (Ctrl + Shift + Delete)
# Hard refresh (Ctrl + Shift + R)
```

---

## 📱 System URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

---

## 🔐 Default Login

```
Email:    admin@gmnextgentech.com
Password: admin123
```

---

## 🎨 Features Overview

| Feature | Location | Action |
|---------|----------|--------|
| Dashboard | Dashboard page | View stats & charts |
| Projects | Projects page | CRUD operations |
| Investments | Investments page | Track funding |
| Expenses | Expenses page | Record spending |
| Users | Users page | Manage team |
| AI Chat | AI Assistant | Ask questions |
| Export | Inv/Exp pages | CSV/PDF download |
| Notifications | Bell icon (header) | View activities |
| Theme | Sun/Moon icon | Toggle dark mode |

---

## ⌨️ Keyboard Shortcuts

- **Ctrl + R** - Refresh page
- **Ctrl + Shift + R** - Hard refresh
- **F12** - Open dev tools
- **Esc** - Close modals

---

## 📊 Dashboard Info

The dashboard shows:
- 📈 Total Investments (PKR)
- 📉 Total Expenses (PKR)
- 📁 Active Projects (count)
- 👥 Team Members (count)
- 📊 Monthly Trends (line chart)
- 📊 Expense by Category (bar chart)
- 📊 Project Status (doughnut chart)
- 🔔 Recent Activities

All numbers animate on page load! ✨

---

## 🔔 Notifications

- Click bell icon in header
- Shows ALL recent:
  - 📁 Projects
  - 💰 Investments
  - 💳 Expenses
- Auto-updates every 30 seconds
- Badge shows total count

---

## 💡 Pro Tips

1. **Use AI Assistant** - Type "give me a summary" for quick overview
2. **Export Often** - Download CSV/PDF for reports
3. **Check Notifications** - Stay updated on all activities
4. **Use Dark Mode** - Easy on the eyes at night
5. **Assign Projects** - Select team members when creating projects

---

## 🎯 Daily Workflow

### Morning Routine:
1. Start backend → Start frontend
2. Login to dashboard
3. Check notifications bell
4. Review dashboard stats

### Adding Data:
1. Record expenses daily
2. Update project status weekly
3. Log investments when received
4. Add users as team grows

### End of Day:
1. Export reports (CSV/PDF)
2. Check AI assistant for summary
3. Review dashboard charts

---

## 📞 Quick Reference

| Need to... | Go to... | Click... |
|------------|----------|----------|
| See overview | Dashboard | - |
| Add project | Projects | + New Project |
| Track money | Investments | + New Investment |
| Log expense | Expenses | + New Expense |
| Add user | Users | + Add User |
| Ask AI | AI Assistant | Type & Send |
| Export data | Inv/Exp | CSV or PDF |
| Change theme | Header | Moon/Sun icon |
| View activities | Header | Bell icon |
| Logout | Header | Profile → Logout |

---

**That's it! You're ready to manage your business! 🚀**

---

**Need detailed info?** Check `IMPLEMENTATION_GUIDE.md`

**Version:** 1.0.0  
**Date:** November 7, 2025
