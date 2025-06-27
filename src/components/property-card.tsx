import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={property.thumbnail}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={property.data_ai_hint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline leading-tight mb-1 group-hover:text-primary">{property.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground gap-1">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{property.location}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          <div className="text-lg font-bold">
            ${property.pricePerNight} <span className="text-sm font-normal text-muted-foreground">/ night</span>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{property.rating.toFixed(1)}</span>
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
