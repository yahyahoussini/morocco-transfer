import { supabase } from "@/integrations/supabase/client";

export type Vehicle = 'Vito' | 'Dacia' | 'Octavia' | 'Karoq';
export type TripType = 'one_way' | 'round_trip' | 'hourly';

export interface RouteRow {
  id: string;
  pickup: string;
  dropoff: string;
  vito_one_way: number;
  dacia_one_way: number;
  octavia_one_way: number;
  karoq_one_way: number;
  vito_round_trip: number | null;
  dacia_round_trip: number | null;
  octavia_round_trip: number | null;
  karoq_round_trip: number | null;
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

export function getPickupLocations(routes: RouteRow[]): string[] {
  const set = new Set<string>();
  routes.forEach((r) => set.add(r.pickup));
  return Array.from(set).sort();
}

export function getDropoffLocations(routes: RouteRow[]): string[] {
  const set = new Set<string>();
  routes.forEach((r) => set.add(r.dropoff));
  return Array.from(set).sort();
}

export function getAvailableDropoffs(routes: RouteRow[], pickup: string | null): string[] {
  if (!pickup) return [];
  const set = new Set<string>();
  routes
    .filter((r) => r.pickup === pickup)
    .forEach((r) => set.add(r.dropoff));
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
    switch (vehicle) {
      case 'Vito': return route.vito_round_trip ?? null;
      case 'Dacia': return route.dacia_round_trip ?? null;
      case 'Octavia': return route.octavia_round_trip ?? null;
      case 'Karoq': return route.karoq_round_trip ?? null;
      default: return null;
    }
  }

  switch (vehicle) {
    case 'Vito': return route.vito_one_way;
    case 'Dacia': return route.dacia_one_way;
    case 'Octavia': return route.octavia_one_way;
    case 'Karoq': return route.karoq_one_way;
    default: return null;
  }
}

export function hasRoundTripFromRoutes(
  routes: RouteRow[],
  pickup: string | null,
  dropoff: string | null
): boolean {
  if (!pickup || !dropoff) return false;
  const route = routes.find((r) => r.pickup === pickup && r.dropoff === dropoff);
  // Assuming round trip is available if Vito has a round trip price, 
  // or generally if the route exists and has round_trip capability.
  // For simplicity, checking vito_round_trip as a proxy for the route supporting round trips at all,
  // but better to check if ANY vehicle has round trip.
  return !!(route?.vito_round_trip);
}

