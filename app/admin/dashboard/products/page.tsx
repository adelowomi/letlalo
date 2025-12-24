'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit, Eye, EyeOff, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/paystack';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inventory_count: '',
    images: '',
    slug: '',
    is_visible: true,
    is_sold_out: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Always auto-generate slug from product name
      if (name === 'name') {
        const slug = generateSlug(value);
        setFormData((prev) => ({ ...prev, slug }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      inventory_count: '',
      images: '',
      slug: '',
      is_visible: true,
      is_sold_out: false,
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      inventory_count: product.inventory_count.toString(),
      images: product.images?.join('\n') || '',
      slug: product.slug,
      is_visible: product.is_visible,
      is_sold_out: product.is_sold_out,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const supabase = createClient();
      const imagesArray = formData.images
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      // Always generate slug from the product name to ensure consistency
      const generatedSlug = generateSlug(formData.name);

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category || null,
        inventory_count: parseInt(formData.inventory_count) || 0,
        images: imagesArray,
        slug: generatedSlug,
        is_visible: formData.is_visible,
        is_sold_out: formData.is_sold_out,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { error } = await supabase.from('products').insert(productData);

        if (error) throw error;
        toast.success('Product created successfully!');
      }

      setDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product';
      toast.error(errorMessage);
    }
  };

  const toggleVisibility = async (product: Product) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ is_visible: !product.is_visible })
        .eq('id', product.id);

      if (error) throw error;
      toast.success(`Product ${!product.is_visible ? 'shown' : 'hidden'}`);
      loadProducts();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="The Kyauta Box"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="kyauta-box"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version (auto-generated from name)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="Product description..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (₦) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="25000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventory_count">Inventory Count</Label>
                  <Input
                    id="inventory_count"
                    name="inventory_count"
                    type="number"
                    value={formData.inventory_count}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="gift-sets"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Images (one URL per line)</Label>
                <Textarea
                  id="images"
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_visible"
                    name="is_visible"
                    checked={formData.is_visible}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_visible" className="cursor-pointer">
                    Visible to customers
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_sold_out"
                    name="is_sold_out"
                    checked={formData.is_sold_out}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_sold_out" className="cursor-pointer">
                    Mark as sold out
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="h-48 animate-pulse bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No products yet</h3>
          <p className="text-muted-foreground">
            Get started by adding your first product
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="relative h-48 overflow-hidden rounded-t-lg bg-muted">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-2">
                  {!product.is_visible && (
                    <Badge variant="secondary">Hidden</Badge>
                  )}
                  {product.is_sold_out && (
                    <Badge variant="destructive">Sold Out</Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="mb-1 font-semibold">{product.name}</h3>
                <p className="mb-2 text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Stock: {product.inventory_count}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleVisibility(product)}
                  >
                    {product.is_visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => deleteProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
