import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rafikipay - Payment Processing Platform',
  description: 'Secure payment processing with M-Pesa, PayPal, and Bank integrations',
  keywords: ['payments', 'mpesa', 'paypal', 'banking', 'fintech'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Global theme provider */}
        {/* TODO: Add theme configuration (dark/light mode) */}
        {/* TODO: Add authentication provider context */}
        {/* TODO: Add notification/toast provider */}
        
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}