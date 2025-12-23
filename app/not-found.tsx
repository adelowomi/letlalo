import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-accent/20 flex items-center justify-center overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-[20rem] font-bold text-primary/5 select-none"
            style={{
              WebkitTextStroke: "2px hsl(var(--primary) / 0.1)",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </div>
        </div>
      </div>

      {/* Decorative Blurred Circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-7xl md:text-9xl font-bold text-primary mb-4">
            404
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! Looks like this page took a journey to somewhere beyond our
          collection. Let's get you back to exploring our Afrocentric treasures.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="group">
            <Link href="/">
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link
              href="/"
              className="text-primary hover:underline inline-flex items-center gap-1 group"
            >
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
              Return to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
