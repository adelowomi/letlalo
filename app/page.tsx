'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Instagram, Package, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { CartSheet } from '@/components/cart-sheet';
import { LetlaloPattern } from '@/components/letlalo-pattern';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/paystack';
import { useCartStore } from '@/lib/store/cart-store';
import toast from 'react-hot-toast';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success('Added to cart!');
    openCart();
  };

  return (
    <>
      <Header />
      <CartSheet />

      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-b from-white to-accent/20">
          <LetlaloPattern />
          <div className="container mx-auto px-4 py-20">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
                It&apos;s not{' '}
                <span className="text-primary">Letlalo</span>
                <br />
                if it&apos;s not Afrocentric
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Discover unique African-inspired gifts, accessories, and home
                decor. Worldwide shipping available.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="min-w-[200px]" asChild>
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px]"
                  asChild
                >
                  <Link
                    href="https://linktr.ee/letlalonig"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="mr-2 h-5 w-5" />
                    Follow Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Worldwide Shipping
                </h3>
                <p className="text-sm text-muted-foreground">
                  We deliver authentic African products anywhere in the world
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Curated Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Each item is carefully selected for authenticity and quality
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Safe and secure payment processing powered by Paystack
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                Featured Products
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore our handpicked selection of Afrocentric treasures
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-80 animate-pulse bg-muted" />
                    <CardContent className="p-4">
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No products available yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative h-80 overflow-hidden bg-muted">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Package className="h-16 w-16" />
                          </div>
                        )}
                        {product.is_sold_out && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="rounded bg-white px-4 py-2 text-sm font-semibold">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="mb-2 font-semibold transition-colors hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>
                      {product.description && (
                        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <Button
                          size="sm"
                          disabled={product.is_sold_out}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/shop">
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Join Our Community
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Follow us on Instagram for updates, new arrivals, and exclusive
              offers
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link
                href="https://www.instagram.com/letlalo_ng"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5" />
                @letlalo_ng
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2">
                <h3 className="mb-4 text-lg font-bold">LETLALO</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Afrocentric/African Gift store in Lagos. It&apos;s not Letlalo
                  if it&apos;s not Afrocentric. Worldwide shipping available.
                </p>
              </div>

              <div>
                <h4 className="mb-4 font-semibold">Shop</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/shop" className="hover:text-primary">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="hover:text-primary">
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="/track-order" className="hover:text-primary">
                      Track Order
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="https://www.instagram.com/letlalo_ng"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      Instagram
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://linktr.ee/letlalonig"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      Linktree
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-primary">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Letlalo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
