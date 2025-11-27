import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Server, Shield, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemMetrics {
  timestamp: number;
  cpu: {
    percent: number;
    count: number;
  };
  memory: {
    percent: number;
    total: number;
    available: number;
    used: number;
  };
  disk: {
    percent: number;
    total: number;
    free: number;
    used: number;
  };
  network: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
  };
}

interface ApplicationMetrics {
  api: {
    total_requests: number;
    avg_response_time: number;
    concurrent_requests: number;
    status_codes: Record<string, number>;
    top_endpoints: Array<{
      endpoint: string;
      count: number;
      avg_time: number;
    }>;
    last_updated: number;
  };
  database: {
    healthy: boolean;
    size: string;
    connections: number;
    response_time: string;
  };
  process: {
    pid: number;
    cpu_percent: number;
    memory_percent: number;
    num_threads: number;
    status: string;
  };
}

interface HealthMetrics {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  system: {
    healthy: boolean;
    cpu_percent: number;
    cpu_healthy: boolean;
    memory_percent: number;
    memory_healthy: boolean;
    disk_percent: number;
    disk_healthy: boolean;
  };
  database: {
    healthy: boolean;
    response_time: number;
    status: string;
  };
  application: {
    healthy: boolean;
    last_request: number;
    active: boolean;
  };
}

const MonitoringDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [applicationMetrics, setApplicationMetrics] = useState<ApplicationMetrics | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const [systemRes, appRes, healthRes] = await Promise.all([
        fetch('/monitoring/system/'),
        fetch('/monitoring/application/'),
        fetch('/monitoring/health/')
      ]);

      if (!systemRes.ok || !appRes.ok || !healthRes.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const [systemData, appData, healthData] = await Promise.all([
        systemRes.json(),
        appRes.json(),
        healthRes.json()
      ]);

      setSystemMetrics(systemData.data);
      setApplicationMetrics(appData.data);
      setHealthMetrics(healthData.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load monitoring data: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      {healthMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(healthMetrics.overall_status)}
              System Health Overview
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(healthMetrics.timestamp * 1000).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">System</p>
                  <p className="text-2xl font-bold">{healthMetrics.system.healthy ? 'Healthy' : 'Issues'}</p>
                </div>
                <Badge variant={healthMetrics.system.healthy ? 'default' : 'destructive'}>
                  {healthMetrics.system.healthy ? 'OK' : 'Alert'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-2xl font-bold">{healthMetrics.database.healthy ? 'Connected' : 'Issues'}</p>
                </div>
                <Badge variant={healthMetrics.database.healthy ? 'default' : 'destructive'}>
                  {healthMetrics.database.healthy ? 'OK' : 'Alert'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Application</p>
                  <p className="text-2xl font-bold">{healthMetrics.application.healthy ? 'Active' : 'Issues'}</p>
                </div>
                <Badge variant={healthMetrics.application.healthy ? 'default' : 'destructive'}>
                  {healthMetrics.application.healthy ? 'OK' : 'Alert'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="application">Application Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          {systemMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.cpu.percent.toFixed(1)}%</div>
                  <Progress value={systemMetrics.cpu.percent} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemMetrics.cpu.count} cores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.memory.percent.toFixed(1)}%</div>
                  <Progress value={systemMetrics.memory.percent} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.disk.percent.toFixed(1)}%</div>
                  <Progress value={systemMetrics.disk.percent} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(systemMetrics.disk.free)} free
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div>↑ {formatBytes(systemMetrics.network.bytes_sent)}</div>
                    <div>↓ {formatBytes(systemMetrics.network.bytes_recv)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          {applicationMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total Requests</p>
                      <p className="text-2xl font-bold">{applicationMetrics.api.total_requests}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg Response Time</p>
                      <p className="text-2xl font-bold">{applicationMetrics.api.avg_response_time}s</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Concurrent Requests</p>
                      <p className="text-2xl font-bold">{applicationMetrics.api.concurrent_requests}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Status Codes</p>
                    <div className="space-y-1">
                      {Object.entries(applicationMetrics.api.status_codes).map(([code, count]) => (
                        <div key={code} className="flex justify-between text-sm">
                          <span>{code}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database & Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(applicationMetrics.database.healthy ? 'healthy' : 'unhealthy')}
                      <span className="text-sm">{applicationMetrics.database.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Size: {applicationMetrics.database.size} | 
                      Connections: {applicationMetrics.database.connections}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Process</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-xs text-muted-foreground">CPU</p>
                        <p className="text-sm font-bold">{applicationMetrics.process.cpu_percent.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Memory</p>
                        <p className="text-sm font-bold">{applicationMetrics.process.memory_percent.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Threads</p>
                        <p className="text-sm font-bold">{applicationMetrics.process.num_threads}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-bold">{applicationMetrics.process.status}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>Most frequently accessed API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationMetrics?.api.top_endpoints && (
                <div className="space-y-2">
                  {applicationMetrics.api.top_endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{endpoint.endpoint}</p>
                        <p className="text-xs text-muted-foreground">
                          {endpoint.count} requests | {endpoint.avg_time}s avg
                        </p>
                      </div>
                      <Badge variant="outline">{endpoint.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
