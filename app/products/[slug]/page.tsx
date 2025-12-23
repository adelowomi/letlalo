'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { CartSheet } from '@/components/cart-sheet';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/paystack';
import { useCartStore } from '@/lib/store/cart-store';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadProduct() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_visible', true)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Product not found');
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug, router]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
    openCart();
  };

  const increaseQuantity = () => {
    if (product && quantity < product.inventory_count) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <CartSheet />
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="h-96 animate-pulse rounded-lg bg-muted" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <>
      <Header />
      <CartSheet />

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {images.length > 0 ? (
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Package className="h-32 w-32" />
                  </div>
                )}
                {product.is_sold_out && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded bg-white px-6 py-3 text-lg font-semibold">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight">
                  {product.name}
                </h1>
                {product.category && (
                  <Badge variant="secondary" className="mb-4">
                    {product.category}
                  </Badge>
                )}
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {product.description && (
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Availability</h3>
                  {product.is_sold_out ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : product.inventory_count <= 5 ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      Only {product.inventory_count} left in stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      In Stock
                    </Badge>
                  )}
                </div>

                {!product.is_sold_out && (
                  <>
                    <div>
                      <h3 className="mb-2 font-semibold">Quantity</h3>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-lg font-semibold">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={increaseQuantity}
                          disabled={quantity >= product.inventory_count}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </>
                )}
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-2 font-semibold">Shipping Information</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Worldwide shipping available</li>
                  <li>Delivery within Lagos: 2-3 business days</li>
                  <li>International shipping: 7-14 business days</li>
                  <li>Free shipping on orders over ₦50,000</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
