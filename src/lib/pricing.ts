import { supabase } from "@/integrations/supabase/client";

export type Vehicle = 'Vito' | 'Dacia';
export type TripType = 'one_way' | 'round_trip' | 'hourly';

export interface RouteRow {
  id: string;
  pickup: string;
  dropoff: string;
  vito_one_way: number;
  dacia_one_way: number;
  vito_round_trip: number | null;
  dacia_round_trip: number | null;
}

const HOURLY_RATE = 200; // MAD per hour, Vito only

export async function fetchRoutes(): Promise<RouteRow[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("pickup", { ascending: true });
  if (error || !data) return [];
  return data as RouteRow[];
}

export function getLocationsFromRoutes(routes: RouteRow[]): string[] {
  const set = new Set<string>();
  routes.forEach((r) => {
    set.add(r.pickup);
    set.add(r.dropoff);
  });
  return Array.from(set).sort();
}

export function calculatePriceFromRoutes(
  routes: RouteRow[],
  pickup: string | null,
  dropoff: string | null,
  vehicle: Vehicle,
  tripType: TripType,
  hours?: number
): number | null {
  if (tripType === 'hourly') {
    if (!hours || hours < 1) return null;
    return hours * HOURLY_RATE;
  }

  if (!pickup || !dropoff || pickup === dropoff) return null;

  const route = routes.find((r) => r.pickup === pickup && r.dropoff === dropoff);
  if (!route) return null;

  if (tripType === 'round_trip') {
    const price = vehicle === 'Vito' ? route.vito_round_trip : route.dacia_round_trip;
    return price ?? null;
  }

  return vehicle === 'Vito' ? route.vito_one_way : route.dacia_one_way;
}

export function hasRoundTripFromRoutes(
  routes: RouteRow[],
  pickup: string | null,
  dropoff: string | null
): boolean {
  if (!pickup || !dropoff) return false;
  const route = routes.find((r) => r.pickup === pickup && r.dropoff === dropoff);
  return !!(route?.vito_round_trip);
}
