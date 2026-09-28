import { describe, expect, it } from "vitest";
import { DEMO_HOTELS } from "@/lib/fixtures/hotels";
import { MockHotelRateProvider } from "./mock";

describe("MockHotelRateProvider", () => {
  const provider = new MockHotelRateProvider();

  it("only returns rates for the requested hotels", async () => {
    const results = await provider.search({
      hotelIds: [DEMO_HOTELS.AMAN_TOKYO.id],
      checkInDate: "2026-01-01",
      checkOutDate: "2026-12-31",
    });
    expect(results.length).toBeGreaterThan(0);
    for (const rate of results) {
      expect(rate.hotelId).toBe(DEMO_HOTELS.AMAN_TOKYO.id);
    }
  });

  it("only returns rates whose stay overlaps the requested window", async () => {
    const results = await provider.search({
      hotelIds: [DEMO_HOTELS.PARK_HYATT_TOKYO.id],
      checkInDate: "2026-04-03",
      checkOutDate: "2026-04-07",
    });
    for (const rate of results) {
      expect(rate.checkInDate <= "2026-04-07").toBe(true);
      expect(rate.checkOutDate >= "2026-04-03").toBe(true);
    }
  });

  it("tags every observation as MOCK_RATE provenance", async () => {
    const results = await provider.search({
      hotelIds: Object.values(DEMO_HOTELS).map((h) => h.id),
      checkInDate: "2026-01-01",
      checkOutDate: "2026-12-31",
    });
    expect(results.length).toBeGreaterThan(0);
    for (const rate of results) {
      expect(rate.provenance).toBe("MOCK_RATE");
    }
  });

  it("returns no results for a hotel with no fixture rates", async () => {
    const results = await provider.search({
      hotelIds: ["hotel-does-not-exist"],
      checkInDate: "2026-01-01",
      checkOutDate: "2026-12-31",
    });
    expect(results).toHaveLength(0);
  });
});
