'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { CartSheet } from '@/components/cart-sheet';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .eq('order_number', orderNumber.trim())
        .eq('customer_email', email.trim().toLowerCase())
        .single();

      if (error || !data) {
        toast.error('Order not found. Please check your order number and email.');
        setLoading(false);
        return;
      }

      router.push(`/orders/${data.order_number}`);
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <CartSheet />

      <main className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Track Your Order</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your order number and email to track your order
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="LTL-20241222-XXXX"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find this in your confirmation email
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The email you used when placing the order
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Searching...' : 'Track Order'}
                  </Button>
                </form>

                <div className="mt-6 rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="mb-2 font-medium">Need help?</p>
                  <p className="text-muted-foreground">
                    If you're having trouble tracking your order, please contact
                    us via Instagram{' '}
                    <a
                      href="https://www.instagram.com/letlalo_ng"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @letlalo_ng
                    </a>{' '}
                    or email us with your order details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
