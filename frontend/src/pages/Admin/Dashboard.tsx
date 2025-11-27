import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  MessageSquare,
  Star,
  AlertCircle,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchDashboardStats,
  fetchSentimentTrends,

} from "../../features/sentiment/sentimentSlice";
import { apiService } from "../../utils/api";

const AdminDashboard = () => {
  const { overview, trends, categoryStats, loading, error } = useAppSelector(
    (state) => state.sentiment
  );
  const dispatch = useAppDispatch();
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // Fetch real data from API
    dispatch(fetchDashboardStats());
    dispatch(fetchSentimentTrends("6months"));
  
    // Fetch additional dashboard metrics
    const fetchAdditionalData = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          apiService.getProducts(),
          apiService.getOrders(),
          apiService.getUsers(),
        ]);

        setDashboardData({
          totalProducts:
            productsRes.data.count || productsRes.data.results?.length || 0,
          totalOrders:
            ordersRes.data.count || ordersRes.data.results?.length || 0,
          totalUsers: usersRes.data.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch additional dashboard data:", error);
      }
    };

    fetchAdditionalData();
  }, [dispatch]);

  const sentimentData = [
    { name: "Positive", value: overview.positivePercent, color: "#10B981" },
    { name: "Neutral", value: overview.neutralPercent, color: "#F59E0B" },
    { name: "Negative", value: overview.negativePercent, color: "#EF4444" },
  ];

  // Transform trends data for chart
  const trendsData = trends.map((trend) => ({
    month: trend.month,
    positive: trend.positive,
    negative: trend.negative,
    neutral: trend.neutral,
  }));

  // Transform category stats for chart
  const categoryData = categoryStats.map((stat) => {
    const total = stat.positive + stat.negative + stat.neutral;
    return {
      category: `Category ${stat.category}`,
      positive: total > 0 ? Math.round((stat.positive / total) * 100) : 0,
      negative: total > 0 ? Math.round((stat.negative / total) * 100) : 0,
      neutral: total > 0 ? Math.round((stat.neutral / total) * 100) : 0,
    };
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor customer sentiment and business metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalReviews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Positive Sentiment
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.positivePercent}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Average Rating
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.averageSentiment}/5
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.totalProducts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="positive"
                stroke="#10B981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="negative"
                stroke="#EF4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="neutral"
                stroke="#F59E0B"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    
    </div>
  );
};

export default AdminDashboard;
