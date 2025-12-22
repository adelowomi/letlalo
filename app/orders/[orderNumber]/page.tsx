'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { CartSheet } from '@/components/cart-sheet';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatusHistory } from '@/lib/types';
import { formatCurrency } from '@/lib/paystack';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500' },
  processing: { label: 'Processing', color: 'bg-purple-500' },
  shipped: { label: 'Shipped', color: 'bg-indigo-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const supabase = createClient();

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .single();

        if (orderError) throw orderError;

        const { data: historyData, error: historyError } = await supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderData.id)
          .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        setOrder(orderData);
        setStatusHistory(historyData || []);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <>
        <Header />
        <CartSheet />
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <CartSheet />
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-bold">Order Not Found</h1>
            <p className="mb-8 text-muted-foreground">
              We couldn't find an order with that number.
            </p>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const currentStatus = statusConfig[order.status];

  return (
    <>
      <Header />
      <CartSheet />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Success Header */}
            {order.payment_status === 'paid' && (
              <Card className="border-green-500 bg-green-50">
                <CardContent className="flex items-center gap-4 py-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">
                      Order Confirmed!
                    </h2>
                    <p className="text-green-700">
                      Thank you for your purchase. We've sent a confirmation
                      email to {order.customer_email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order {order.order_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on {format(new Date(order.created_at), 'PPP')}
                    </p>
                  </div>
                  <Badge
                    className={currentStatus.color}
                    variant="secondary"
                  >
                    {currentStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Status Timeline */}
                <div>
                  <h3 className="mb-4 font-semibold">Order Status</h3>
                  <div className="space-y-4">
                    {statusHistory.map((history, index) => (
                      <div key={history.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          {index < statusHistory.length - 1 && (
                            <div className="h-full w-0.5 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">
                            {statusConfig[history.status].label}
                          </p>
                          {history.notes && (
                            <p className="text-sm text-muted-foreground">
                              {history.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(history.created_at), 'PPp')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Number */}
                {order.tracking_number && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Tracking Number</p>
                        <p className="font-mono text-sm">{order.tracking_number}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="mb-4 font-semibold">Items Ordered</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 rounded-lg border p-3">
                        <div className="relative h-20 w-20 overflow-hidden rounded bg-muted">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.product_slug}`}
                            className="font-medium hover:text-primary"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <Home className="h-4 w-4" />
                    Shipping Address
                  </h3>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <p className="font-medium">{order.shipping_address.full_name}</p>
                    <p>{order.shipping_address.address_line1}</p>
                    {order.shipping_address.address_line2 && (
                      <p>{order.shipping_address.address_line2}</p>
                    )}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.postal_code && (
                      <p>{order.shipping_address.postal_code}</p>
                    )}
                    <p className="mt-2">{order.shipping_address.phone}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="mb-2 font-semibold">Contact Information</h3>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <p>{order.customer_email}</p>
                    <p>{order.customer_phone}</p>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <h3 className="mb-2 font-semibold">Order Notes</h3>
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      <p>{order.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button asChild className="flex-1">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/track-order">Track Another Order</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
