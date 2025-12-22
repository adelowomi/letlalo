'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/paystack';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    visibleProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();

        const [productsRes, ordersRes, revenueRes, recentOrdersRes] = await Promise.all([
          supabase.from('products').select('id, is_visible'),
          supabase.from('orders').select('id, status'),
          supabase
            .from('orders')
            .select('total')
            .eq('payment_status', 'paid'),
          supabase
            .from('orders')
            .select('order_number, customer_name, total, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const totalProducts = productsRes.data?.length || 0;
        const visibleProducts =
          productsRes.data?.filter((p) => p.is_visible).length || 0;
        const totalOrders = ordersRes.data?.length || 0;
        const pendingOrders =
          ordersRes.data?.filter((o) => o.status === 'pending' || o.status === 'confirmed').length || 0;
        const totalRevenue =
          revenueRes.data?.reduce((sum, order) => sum + order.total, 0) || 0;

        setStats({
          totalProducts,
          visibleProducts,
          totalOrders,
          pendingOrders,
          totalRevenue,
          recentOrders: recentOrdersRes.data || [],
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subtitle: `${stats.visibleProducts} visible`,
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: 'Paid orders only',
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'Avg Order Value',
      value: stats.totalOrders > 0
        ? formatCurrency(stats.totalRevenue / stats.totalOrders)
        : formatCurrency(0),
      subtitle: 'Per order',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats.recentOrders.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div
                  key={order.order_number}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
