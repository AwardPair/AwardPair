import type { HotelStayOpportunity } from "@/lib/domain";
import { demoHotelsForCity } from "@/lib/fixtures/hotels";
import { buildHotelStayOpportunities } from "./hotelStays";

export interface HotelSearchInput {
  destinationCity: string;
  checkInDate: string;
  checkOutDate: string;
}

export async function searchHotels(input: HotelSearchInput): Promise<HotelStayOpportunity[]> {
  const hotelIds = demoHotelsForCity(input.destinationCity).map((h) => h.id);
  if (hotelIds.length === 0) return [];
  return buildHotelStayOpportunities({
    hotelIds,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
  });
}
