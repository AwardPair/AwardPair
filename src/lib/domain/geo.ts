import type { IanaTimeZone } from "./common";

export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
  timeZone: IanaTimeZone;
}
