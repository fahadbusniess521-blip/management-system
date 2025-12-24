import React, { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  BellIcon, 
  MoonIcon, 
  SunIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      const activities = response.data.recentActivities;
      
      const allNotifications = [];
      
      // Add ALL project notifications (no limit)
      if (activities?.projects && activities.projects.length > 0) {
        activities.projects.forEach((project, index) => {
          allNotifications.push({
            id: `project-${index}`,
            type: 'project',
            title: 'Project',
            message: `${project.name}`,
            user: project.createdBy?.name || 'Unknown',
            time: 'Recently',
            icon: '📁'
          });
        });
      }
      
      // Add ALL investment notifications (no limit)
      if (activities?.investments && activities.investments.length > 0) {
        activities.investments.forEach((investment, index) => {
          allNotifications.push({
            id: `investment-${index}`,
            type: 'investment',
            title: 'Investment',
            message: `${investment.source} - PKR ${investment.amount?.toLocaleString()}`,
            user: investment.createdBy?.name || 'Unknown',
            time: 'Recently',
            icon: '💰'
          });
        });
      }
      
      // Add ALL expense notifications (no limit)
      if (activities?.expenses && activities.expenses.length > 0) {
        activities.expenses.forEach((expense, index) => {
          allNotifications.push({
            id: `expense-${index}`,
            type: 'expense',
            title: 'Expense',
            message: `${expense.name} - PKR ${expense.amount?.toLocaleString()}`,
            user: expense.category || 'General',
            time: 'Recently',
            icon: '💳'
          });
        });
      }
      
      setNotifications(allNotifications);
      setNotificationCount(allNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setNotificationCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Intelligent Management System
          </h2>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {notificationCount > 0 && (
                    <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon/Emoji */}
                            <div className="flex-shrink-0 text-xl mt-0.5">
                              {notification.icon}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`text-xs font-semibold uppercase tracking-wide ${
                                  notification.type === 'project' ? 'text-blue-600 dark:text-blue-400' :
                                  notification.type === 'investment' ? 'text-green-600 dark:text-green-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {notification.title}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {notification.time}
                                </span>
                              </div>
                              
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {notification.message}
                              </p>
                              
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  notification.type === 'project' ? 'bg-blue-500' :
                                  notification.type === 'investment' ? 'bg-green-500' :
                                  'bg-red-500'
                                }`}></span>
                                {notification.user}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <BellIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No notifications yet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        We'll notify you when something new happens
                      </p>
                    </div>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 capitalize mt-1">
                    {user?.role}
                  </p>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <UserCircleIcon className="w-5 h-5 mr-3" />
                        Profile
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
