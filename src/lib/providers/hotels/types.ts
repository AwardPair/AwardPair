import type { HotelRateObservation } from "@/lib/domain";

export interface HotelRateSearchParams {
  hotelIds: string[];
  checkInDate: string;
  checkOutDate: string;
}

/**
 * The only seam through which AwardPair obtains hotel pricing. Real
 * program-booking prices (FHR/THC/The Edit) are not assumed to be
 * reachable from a general-purpose rate API — see docs/data-sources.md.
 * A future licensed integration implements this same interface.
 */
export interface HotelRateProvider {
  readonly name: string;
  search(params: HotelRateSearchParams): Promise<HotelRateObservation[]>;
}
