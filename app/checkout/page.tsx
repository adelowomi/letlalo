'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { CartSheet } from '@/components/cart-sheet';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency, initializePaystack, generatePaystackReference } from '@/lib/paystack';
import { createClient } from '@/lib/supabase/client';
import { OrderItem, ShippingAddress } from '@/lib/types';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    notes: '',
  });

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 50000 ? 0 : 2500; // Free shipping over ₦50,000
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'addressLine1',
      'city',
      'state',
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Please fill in ${field.replace('customer', '').replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const createOrder = async (paymentReference: string) => {
    try {
      const supabase = createClient();

      const shippingAddress: ShippingAddress = {
        full_name: formData.customerName,
        phone: formData.customerPhone,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2 || undefined,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postalCode || undefined,
      };

      const orderItems: OrderItem[] = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_slug: item.product.slug,
        product_image: item.product.images?.[0] || '',
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderNumber = `LTL-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          shipping_address: shippingAddress,
          items: orderItems,
          subtotal,
          shipping_cost: shippingCost,
          total,
          payment_reference: paymentReference,
          payment_status: 'pending',
          status: 'pending',
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const reference = generatePaystackReference();

      const paystackConfig = {
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: formData.customerEmail,
        amount: total,
        currency: 'NGN',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: formData.customerName,
            },
            {
              display_name: 'Phone Number',
              variable_name: 'phone_number',
              value: formData.customerPhone,
            },
          ],
        },
        onSuccess: async (response: any) => {
          try {
            const order = await createOrder(response.reference);

            const supabase = createClient();
            await supabase
              .from('orders')
              .update({ payment_status: 'paid', status: 'confirmed' })
              .eq('id', order.id);

            await supabase.from('order_status_history').insert({
              order_id: order.id,
              status: 'confirmed',
              notes: 'Payment successful',
            });

            clearCart();
            toast.success('Payment successful!');
            router.push(`/orders/${order.order_number}`);
          } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Payment successful but order update failed. Please contact support.');
          }
        },
        onClose: () => {
          setLoading(false);
          toast.error('Payment cancelled');
        },
      };

      if (!paystackConfig.publicKey) {
        toast.error('Payment system not configured. Please contact support.');
        setLoading(false);
        return;
      }

      await createOrder(reference);
      initializePaystack(paystackConfig);
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Header />
      <CartSheet />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>

          <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="customerEmail"
                          name="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="+234 xxx xxx xxxx"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">
                        Address Line 1 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Lagos"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">
                          State <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Lagos State"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="100001"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special instructions for your order..."
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                          {item.product.images?.[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatCurrency(shippingCost)
                        )}
                      </span>
                    </div>
                    {subtotal >= 50000 && (
                      <p className="text-xs text-green-600">
                        You qualify for free shipping!
                      </p>
                    )}
                    <div className="flex justify-between border-t pt-2 text-base font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
