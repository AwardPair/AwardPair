import type { HotelStayOpportunity } from "@/lib/domain";
import { HotelCard } from "./HotelCard";

export function HotelsResults({ hotels }: { hotels: HotelStayOpportunity[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {hotels.length} hotel stay{hotels.length === 1 ? "" : "s"} found. Rates shown are reference estimates, not live booking prices — see each card for details.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {hotels.map((stay) => (
          <HotelCard key={stay.id} stay={stay} />
        ))}
      </div>
    </div>
  );
}
