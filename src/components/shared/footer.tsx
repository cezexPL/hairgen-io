import Link from "next/link";
import { Scissors } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Scissors className="h-5 w-5 text-primary" />
              hairgen.io
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered hairstyle try-on. See your new look before the salon.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/try" className="hover:text-foreground transition-colors">Try It Free</Link></li>
              <li><Link href="/gallery" className="hover:text-foreground transition-colors">Gallery</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/gdpr" className="hover:text-foreground transition-colors">GDPR</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:support@hairgen.io" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><Link href="/api/user/delete-data" className="hover:text-foreground transition-colors">Delete My Data</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} hairgen.io. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
