import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmationPage() {
  return (
    <div className="container mx-auto flex items-center justify-center py-20 px-4 md:px-6">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline mt-4">Booking Confirmed!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your trip is all set. We've sent a confirmation to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You can now view your trip details in the "My Trips" section.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/my-trips">View My Trips</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/home">Explore More</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
