import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ExpenseModal from '../components/Modals/ExpenseModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/expenses/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        fetchExpenses();
        fetchStats();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Category', 'Date', 'Description'];
    const data = expenses.map(expense => [
      expense.name,
      `PKR ${expense.amount.toLocaleString()}`,
      expense.category,
      new Date(expense.date).toLocaleDateString(),
      expense.description || '-'
    ]);

    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    try {
      console.log('Starting PDF export...');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('NADEEM&SONSTECH - Expense Report', 14, 20);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      
      // Add summary
      doc.setFontSize(12);
      doc.text(`Total Expenses: PKR ${stats?.totalExpense?.toLocaleString() || 0}`, 14, 36);
      
      // Add table
      const tableData = expenses.map(expense => [
        expense.name || '',
        `PKR ${parseFloat(expense.amount || 0).toLocaleString()}`,
        expense.category || '',
        new Date(expense.date).toLocaleDateString() || '',
        expense.description || '-'
      ]);

      console.log('Table data:', tableData);

      doc.autoTable({
        head: [['Name', 'Amount', 'Category', 'Date', 'Description']],
        body: tableData,
        startY: 44,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [14, 165, 233] }
      });

      const filename = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF:', filename);
      doc.save(filename);
      console.log('PDF saved successfully!');
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Rent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Utility: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Equipment: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Salary: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      Marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      Travel: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      Other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[category] || colors.Other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all company expenses including rent
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-colors"
            title="Export to CSV"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
            title="Export to PDF"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            PDF
          </button>
          <button
            onClick={() => {
              setSelectedExpense(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            PKR {stats?.totalExpense?.toLocaleString() || 0}
          </p>
        </div>
        {stats?.categoryBreakdown?.slice(0, 3).map((item) => (
          <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">{item._id}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              PKR {item.total?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {item.count} expense{item.count !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map((expense) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {expense.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    PKR {expense.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {expense.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onSuccess={() => {
          fetchExpenses();
          fetchStats();
        }}
      />
    </div>
  );
};

export default Expenses;
