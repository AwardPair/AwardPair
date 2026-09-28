import { DEMO_HOTEL_RATES } from "@/lib/fixtures/hotels";
import type { HotelRateObservation } from "@/lib/domain";
import type { HotelRateProvider, HotelRateSearchParams } from "./types";

/** Returns fixture MOCK_RATE observations. See docs/data-sources.md. */
export class MockHotelRateProvider implements HotelRateProvider {
  readonly name = "mock-hotel-rates";

  async search(params: HotelRateSearchParams): Promise<HotelRateObservation[]> {
    return DEMO_HOTEL_RATES.filter(
      (rate) =>
        params.hotelIds.includes(rate.hotelId) &&
        rate.checkInDate <= params.checkOutDate &&
        rate.checkOutDate >= params.checkInDate,
    );
  }
}

export const mockHotelRateProvider = new MockHotelRateProvider();
