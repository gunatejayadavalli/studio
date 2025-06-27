import { properties } from '@/lib/data';
import { PropertyCard } from '@/components/property-card';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold font-headline mb-2">Explore Stays</h1>
      <p className="text-muted-foreground mb-8">Find your next getaway from our curated list of properties.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
