import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NotFound = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getHomeRoute = () => {
    if (!isAuthenticated) return '/';
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'guide') return '/guide';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-healthcare-primary mb-4">404</h1>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
              <p className="text-gray-600 text-lg">
                We couldn't find the page you're looking for in the EduMindSolutions platform.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-gray-700">
                The page you requested might have been moved, deleted, or you may have entered an incorrect URL.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate(getHomeRoute())}
                className="bg-healthcare-primary hover:bg-blue-700 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/assessments" className="text-sm text-healthcare-primary hover:underline">
                  Assessments
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/community" className="text-sm text-healthcare-primary hover:underline">
                  Community
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/education" className="text-sm text-healthcare-primary hover:underline">
                  Education
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/resources" className="text-sm text-healthcare-primary hover:underline">
                  Resources
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;