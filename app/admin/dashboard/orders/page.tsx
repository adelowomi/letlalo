'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/paystack';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500' },
  processing: { label: 'Processing', color: 'bg-purple-500' },
  shipped: { label: 'Shipped', color: 'bg-indigo-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const openOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setStatusNotes('');
    setDialogOpen(true);
  };

  const updateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const supabase = createClient();

      const updates: any = {};
      if (newStatus !== selectedOrder.status) {
        updates.status = newStatus;
      }
      if (trackingNumber !== (selectedOrder.tracking_number || '')) {
        updates.tracking_number = trackingNumber || null;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', selectedOrder.id);

        if (updateError) throw updateError;
      }

      if (newStatus !== selectedOrder.status) {
        const { error: historyError } = await supabase
          .from('order_status_history')
          .insert({
            order_id: selectedOrder.id,
            status: newStatus,
            notes: statusNotes || null,
          });

        if (historyError) throw historyError;
      }

      toast.success('Order updated successfully!');
      setDialogOpen(false);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Orders</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search by order number, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here when customers make purchases'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="font-semibold">{order.order_number}</h3>
                  <Badge className={statusConfig[order.status].color}>
                    {statusConfig[order.status].label}
                  </Badge>
                  {order.payment_status === 'paid' && (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      Paid
                    </Badge>
                  )}
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground md:grid-cols-3">
                  <div>
                    <span className="font-medium">Customer:</span> {order.customer_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {order.customer_email}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{' '}
                    {format(new Date(order.created_at), 'PPp')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item(s)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openOrderDialog(order)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Order: {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 font-semibold">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{' '}
                    {selectedOrder.customer_name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {selectedOrder.customer_email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{' '}
                    {selectedOrder.customer_phone}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 font-semibold">Shipping Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shipping_address.address_line1}</p>
                  {selectedOrder.shipping_address.address_line2 && (
                    <p>{selectedOrder.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {selectedOrder.shipping_address.city},{' '}
                    {selectedOrder.shipping_address.state}
                  </p>
                  <p>{selectedOrder.shipping_address.country}</p>
                  {selectedOrder.shipping_address.postal_code && (
                    <p>{selectedOrder.shipping_address.postal_code}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="mb-3 font-semibold">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Update Order Status */}
              <div className="space-y-4 rounded-lg border bg-accent/30 p-4">
                <h3 className="font-semibold">Update Order</h3>

                <div className="space-y-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>

                {newStatus !== selectedOrder.status && (
                  <div className="space-y-2">
                    <Label htmlFor="notes">Status Update Notes</Label>
                    <Textarea
                      id="notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Add notes about this status change..."
                      rows={3}
                    />
                  </div>
                )}

                <Button onClick={updateOrder} className="w-full">
                  Update Order
                </Button>
              </div>

              {selectedOrder.notes && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h3 className="mb-2 font-semibold">Customer Notes</h3>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
