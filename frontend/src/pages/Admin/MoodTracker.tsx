import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Filter, TrendingUp, TrendingDown, Minus, Eye, Calendar, BarChart3, Brain, Users, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { moodService } from '@/services/moodService';

interface MoodData {
  emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'calm' | 'frustrated';
  confidence: number;
  timestamp: number;
}

interface UserMoodProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastActive: string;
  currentMood?: MoodData;
  moodHistory: MoodData[];
  totalSessions: number;
  averageMood: string;
  moodTrend: 'improving' | 'declining' | 'stable';
}

const AdminMoodTracker: React.FC = () => {
  const [users, setUsers] = useState<UserMoodProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserMoodProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      setLoading(true);
      
      try {
        console.log('Fetching real mood data from backend...');
        const moodData = await moodService.getAdminMoodDashboard();
        console.log('Received mood data:', moodData);
        
        const transformedUsers: UserMoodProfile[] = moodData.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          lastActive: user.lastActive,
          currentMood: user.currentMood ? {
            emotion: user.currentMood.emotion as any,
            confidence: user.currentMood.confidence,
            timestamp: user.currentMood.timestamp
          } : null,
          moodHistory: user.moodHistory.map((mood: any) => ({
            emotion: mood.emotion as any,
            confidence: mood.confidence,
            timestamp: mood.timestamp
          })),
          totalSessions: user.totalSessions,
          averageMood: user.averageMood as any,
          moodTrend: user.moodTrend as any
        }));
        
        setUsers(transformedUsers);
      } catch (error) {
        console.error('Failed to fetch mood data, falling back to mock data:', error);
        
        const emotions: ('happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'calm' | 'frustrated')[] = 
          ['happy', 'sad', 'neutral', 'excited', 'anxious', 'calm', 'frustrated'];
        const names = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor'];
        
        const mockUsers: UserMoodProfile[] = names.map((name, index) => {
          const moodHistory: MoodData[] = [];
          const now = Date.now();
          
          for (let i = 29; i >= 0; i--) {
            const timestamp = now - (i * 24 * 60 * 60 * 1000);
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            moodHistory.push({
              emotion: randomEmotion,
              confidence: 0.7 + Math.random() * 0.3,
              timestamp
            });
          }
          
          const currentMood = moodHistory[moodHistory.length - 1];
          const averageMoodIndex = Math.floor(moodHistory.reduce((acc, mood) => {
            return acc + emotions.indexOf(mood.emotion);
          }, 0) / moodHistory.length);
          
          return {
            id: `user-${index + 1}`,
            name,
            email: name.toLowerCase().replace(' ', '.') + '@example.com',
            lastActive: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            currentMood,
            moodHistory,
            totalSessions: Math.floor(Math.random() * 50) + 10,
            averageMood: emotions[averageMoodIndex],
            moodTrend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as any
          };
        });
        
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  const getMoodEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      neutral: '😐',
      excited: '🤩',
      anxious: '😰',
      calm: '😌',
      frustrated: '😤'
    };
    return emojiMap[emotion] || '😐';
  };

  const getMoodColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      happy: '#10B981',
      sad: '#3B82F6',
      neutral: '#6B7280',
      excited: '#F59E0B',
      anxious: '#EF4444',
      calm: '#8B5CF6',
      frustrated: '#F97316'
    };
    return colorMap[emotion] || '#6B7280';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = filterMood === 'all' || user.currentMood?.emotion === filterMood;
    return matchesSearch && matchesMood;
  });

  const prepareMoodChartData = (moodHistory: MoodData[]) => {
    return moodHistory.slice(-14).map((mood, index) => ({
      day: `Day ${index + 1}`,
      mood: mood.emotion,
      confidence: Math.round(mood.confidence * 100),
      timestamp: mood.timestamp
    }));
  };

  const prepareMoodDistribution = (moodHistory: MoodData[]) => {
    const distribution: Record<string, number> = {};
    moodHistory.forEach(mood => {
      distribution[mood.emotion] = (distribution[mood.emotion] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / moodHistory.length) * 100)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Loading mood data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            Admin Mood Tracker
          </h1>
          <p className="text-gray-600 mt-1">Monitor and analyze user mood patterns across the platform</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {users.length} Users Tracked
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{users.reduce((acc, user) => acc + user.totalSessions, 0)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => new Date(u.lastActive) > new Date(Date.now() - 24*60*60*1000)).length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Improving Trends</p>
                <p className="text-2xl font-bold">{users.filter(u => u.moodTrend === 'improving').length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold">{users.filter(u => u.moodTrend === 'declining').length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500 rotate-180" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white"
              >
                <option value="all">All Moods</option>
                <option value="happy">😊 Happy</option>
                <option value="sad">😢 Sad</option>
                <option value="neutral">😐 Neutral</option>
                <option value="excited">🤩 Excited</option>
                <option value="anxious">😰 Anxious</option>
                <option value="calm">😌 Calm</option>
                <option value="frustrated">😤 Frustrated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Mood Overview ({filteredUsers.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {getTrendIcon(user.moodTrend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Mood:</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {user.currentMood && getMoodEmoji(user.currentMood.emotion)}
                        {user.currentMood?.emotion || 'Unknown'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sessions:</span>
                      <span className="text-sm font-medium">{user.totalSessions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Active:</span>
                      <span className="text-sm text-gray-500">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedUser(user)}
                    className="w-full mt-3"
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">
                      {selectedUser.currentMood && getMoodEmoji(selectedUser.currentMood.emotion)}
                    </div>
                    <p className="text-sm text-gray-600">Current Mood</p>
                    <p className="font-medium">{selectedUser.currentMood?.emotion || 'Unknown'}</p>
                    {selectedUser.currentMood && (
                      <p className="text-xs text-gray-500">
                        {Math.round(selectedUser.currentMood.confidence * 100)}% confidence
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{getTrendIcon(selectedUser.moodTrend)}</div>
                    <p className="text-sm text-gray-600">Mood Trend</p>
                    <p className="font-medium capitalize">{selectedUser.moodTrend}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="font-medium">{selectedUser.totalSessions}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Mood Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Mood Trend (Last 14 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareMoodChartData(selectedUser.moodHistory)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${(value * 100).toFixed(1)}%`, 
                            name === 'confidence' ? 'Confidence' : name
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="confidence" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Mood Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Mood Distribution (All Time)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareMoodDistribution(selectedUser.moodHistory)}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            fill="#8884d8"
                          >
                            {prepareMoodDistribution(selectedUser.moodHistory).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-3">
                      {prepareMoodDistribution(selectedUser.moodHistory).map((mood, index) => (
                        <div key={mood.emotion} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{getMoodEmoji(mood.emotion)}</span>
                            <span className="capitalize">{mood.emotion}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{mood.count}</span>
                            <span className="text-sm text-gray-500 ml-1">({mood.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Mood History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Mood History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedUser.moodHistory.slice(-10).reverse().map((mood, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getMoodEmoji(mood.emotion)}</span>
                          <div>
                            <p className="font-medium capitalize">{mood.emotion}</p>
                            <p className="text-sm text-gray-500">
                              Confidence: {Math.round(mood.confidence * 100)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(mood.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(mood.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminMoodTracker;
