import Link from 'next/link';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { CartSheet } from '@/components/cart-sheet';

export default function ContactPage() {
  return (
    <>
      <Header />
      <CartSheet />

      <main className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold">Get in Touch</h1>
            <p className="mb-12 text-lg text-muted-foreground">
              We'd love to hear from you! Reach out to us through any of these
              channels.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Instagram className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Instagram</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Follow us and send us a DM
                  </p>
                  <Button asChild>
                    <Link
                      href="https://www.instagram.com/letlalo_ng"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @letlalo_ng
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">All Links</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Find all our contact options
                  </p>
                  <Button asChild variant="outline">
                    <Link
                      href="https://linktr.ee/letlalonig"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Linktree
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 rounded-lg border bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="mb-2 font-semibold">
                    Do you ship internationally?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! We offer worldwide shipping. Delivery times vary
                    depending on your location. Within Lagos takes 2-3 business
                    days, while international orders typically arrive in 7-14
                    business days.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We accept all major payment methods through Paystack,
                    including cards, bank transfers, and USSD.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">
                    Can I return or exchange an item?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please contact us within 7 days of receiving your order if
                    you'd like to discuss a return or exchange. Conditions
                    apply.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">
                    How can I track my order?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use our{' '}
                    <Link href="/track-order" className="text-primary hover:underline">
                      order tracking page
                    </Link>{' '}
                    with your order number and email address to see the status
                    of your order.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">
                    Are your products authentic African items?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! We carefully curate each item to ensure
                    authenticity and quality. It's not Letlalo if it's not
                    Afrocentric.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Still have questions?{' '}
                <Link
                  href="https://www.instagram.com/letlalo_ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Send us a message on Instagram
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
