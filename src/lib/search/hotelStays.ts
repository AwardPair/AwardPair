import type { HotelProgramMembership, HotelStayOpportunity } from "@/lib/domain";
import { isMembershipActive } from "@/lib/domain";
import { DEMO_HOTELS_BY_ID, DEMO_HOTEL_MEMBERSHIPS } from "@/lib/fixtures/hotels";
import { mockHotelRateProvider } from "@/lib/providers/hotels/mock";

/**
 * Builds HotelStayOpportunity records for a set of hotels/dates by
 * combining a HotelRateProvider's price observations with the hotel entity
 * and whichever program memberships were active on the check-in date.
 * Currently backed by the mock provider/fixtures — see docs/data-sources.md.
 */
export async function buildHotelStayOpportunities(params: {
  hotelIds: string[];
  checkInDate: string;
  checkOutDate: string;
}): Promise<HotelStayOpportunity[]> {
  const rates = await mockHotelRateProvider.search({
    hotelIds: params.hotelIds,
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
  });

  const stays: HotelStayOpportunity[] = [];
  for (const rate of rates) {
    const hotel = DEMO_HOTELS_BY_ID[rate.hotelId];
    if (!hotel) continue;
    const activeMemberships: HotelProgramMembership[] = DEMO_HOTEL_MEMBERSHIPS.filter(
      (m) => m.hotelId === rate.hotelId && isMembershipActive(m, rate.checkInDate),
    );
    stays.push({
      id: `stay-${rate.id}`,
      hotel,
      checkInDate: rate.checkInDate,
      checkOutDate: rate.checkOutDate,
      rate,
      activeMemberships,
    });
  }
  return stays;
}
