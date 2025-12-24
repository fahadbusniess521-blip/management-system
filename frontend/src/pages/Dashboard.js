import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({
    investments: 0,
    expenses: 0,
    projects: 0,
    users: 0,
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/charts'),
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
      
      // Animate counters
      animateCounters({
        investments: statsRes.data?.summary?.totalInvestments || 0,
        expenses: statsRes.data?.summary?.totalExpenses || 0,
        projects: statsRes.data?.summary?.activeProjects || 0,
        users: statsRes.data?.summary?.totalUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateCounters = (targets) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setAnimatedValues({
        investments: Math.floor(targets.investments * easeProgress),
        expenses: Math.floor(targets.expenses * easeProgress),
        projects: Math.floor(targets.projects * easeProgress),
        users: Math.floor(targets.users * easeProgress),
      });
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(targets);
      }
    }, stepTime);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Investments',
      value: animatedValues.investments,
      prefix: 'PKR ',
      icon: ChartBarIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    },
    {
      title: 'Total Expenses',
      value: animatedValues.expenses,
      prefix: 'PKR ',
      icon: CurrencyDollarIcon,
      gradient: 'from-red-500 via-pink-500 to-rose-500',
      iconBg: 'bg-gradient-to-br from-red-400 to-pink-500',
    },
    {
      title: 'Active Projects',
      value: animatedValues.projects,
      prefix: '',
      icon: BriefcaseIcon,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    },
    {
      title: 'Team Members',
      value: animatedValues.users,
      prefix: '',
      icon: UserGroupIcon,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      iconBg: 'bg-gradient-to-br from-purple-400 to-violet-500',
    },
  ];

  const monthlyComparisonData = {
    labels: charts?.monthlyComparison?.map(m => `${m.month} ${m.year}`) || [],
    datasets: [
      {
        label: 'Investments',
        data: charts?.monthlyComparison?.map(m => m.investments) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: charts?.monthlyComparison?.map(m => m.expenses) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const expenseByCategoryData = {
    labels: charts?.expenseByCategory?.map(e => e._id) || [],
    datasets: [
      {
        label: 'Expenses by Category',
        data: charts?.expenseByCategory?.map(e => e.total) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };

  const projectByStatusData = {
    labels: charts?.projectByStatus?.map(p => p._id) || [],
    datasets: [
      {
        data: charts?.projectByStatus?.map(p => p.count) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 shadow-xl"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <SparklesIcon className="w-8 h-8" />
              Dashboard
            </h1>
          </div>
          <p className="text-blue-50 text-lg">
            Welcome back! Here's an overview of your company's performance.
          </p>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -5, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="relative overflow-hidden group"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`}></div>
            
            {/* Card content */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <SparklesIcon className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-extrabold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {card.prefix}{card.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Icon with gradient */}
                <div className={`${card.iconBg} p-3 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              
              {/* Bottom shine effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investment vs Expense Trends
            </h3>
          </div>
          <Line data={monthlyComparisonData} options={{ responsive: true, maintainAspectRatio: true }} />
        </motion.div>

        {/* Expense by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expenses by Category
            </h3>
          </div>
          <Bar data={expenseByCategoryData} options={{ responsive: true, maintainAspectRatio: true }} />
        </motion.div>

        {/* Project Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Projects by Status
            </h3>
          </div>
          <div className="max-w-sm mx-auto">
            <Doughnut data={projectByStatusData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 via-green-500 to-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activities
            </h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {/* Recent Projects */}
            {stats?.recentActivities?.projects?.slice(0, 3).map((project, index) => (
              <div key={`project-${index}`} className="flex items-start p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    New Project: {project.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created by {project.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Recent Investments */}
            {stats?.recentActivities?.investments?.slice(0, 2).map((investment, index) => (
              <div key={`investment-${index}`} className="flex items-start p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Investment: {investment.source}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PKR {investment.amount?.toLocaleString()} • {investment.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Recent Expenses */}
            {stats?.recentActivities?.expenses?.slice(0, 2).map((expense, index) => (
              <div key={`expense-${index}`} className="flex items-start p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Expense: {expense.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PKR {expense.amount?.toLocaleString()} • {expense.category}
                  </p>
                </div>
              </div>
            ))}

            {(!stats?.recentActivities?.projects?.length && 
              !stats?.recentActivities?.investments?.length && 
              !stats?.recentActivities?.expenses?.length) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
