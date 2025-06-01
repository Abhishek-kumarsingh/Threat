'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: '1',
      name: 'John Smith',
      email: 'admin@threatguard.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2 hours ago',
      createdAt: '2024-01-15',
      phone: '+1 (555) 123-4567'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'operator@threatguard.com',
      role: 'operator',
      status: 'active',
      lastLogin: '1 day ago',
      createdAt: '2024-02-20',
      phone: '+1 (555) 234-5678'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'user@threatguard.com',
      role: 'user',
      status: 'active',
      lastLogin: '3 days ago',
      createdAt: '2024-03-10',
      phone: '+1 (555) 345-6789'
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@threatguard.com',
      role: 'operator',
      status: 'inactive',
      lastLogin: '2 weeks ago',
      createdAt: '2024-01-05',
      phone: '+1 (555) 456-7890'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operator': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = [
    { label: 'Total Users', value: users.length.toString(), change: '+2' },
    { label: 'Active Users', value: users.filter(u => u.status === 'active').length.toString(), change: '+1' },
    { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length.toString(), change: '0' },
    { label: 'New This Month', value: '2', change: '+2' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage user accounts and access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                          <Phone className="w-3 h-3 ml-2" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {user.createdAt}</span>
                          <span>•</span>
                          <span>Last login: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Administrator
                </CardTitle>
                <CardDescription>Full system access and management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• User management</p>
                  <p className="text-sm">• System configuration</p>
                  <p className="text-sm">• All sensor access</p>
                  <p className="text-sm">• Report generation</p>
                  <p className="text-sm">• Security settings</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Edit Permissions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Operator
                </CardTitle>
                <CardDescription>Monitoring and response capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Monitor sensors</p>
                  <p className="text-sm">• Manage alerts</p>
                  <p className="text-sm">• View threat zones</p>
                  <p className="text-sm">• Generate reports</p>
                  <p className="text-sm text-muted-foreground">• No user management</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Edit Permissions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  User
                </CardTitle>
                <CardDescription>Basic monitoring and viewing access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• View assigned sensors</p>
                  <p className="text-sm">• View alerts</p>
                  <p className="text-sm">• Basic reports</p>
                  <p className="text-sm text-muted-foreground">• No configuration</p>
                  <p className="text-sm text-muted-foreground">• No user management</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Edit Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>Track user logins and system interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { user: 'John Smith', action: 'Logged in', time: '2 hours ago', ip: '192.168.1.100' },
                  { user: 'Sarah Johnson', action: 'Generated report', time: '4 hours ago', ip: '192.168.1.101' },
                  { user: 'Mike Wilson', action: 'Acknowledged alert', time: '1 day ago', ip: '192.168.1.102' },
                  { user: 'John Smith', action: 'Updated sensor threshold', time: '2 days ago', ip: '192.168.1.100' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{activity.time}</p>
                      <p>{activity.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementPage;
