export interface Service {
  // Read-only properties (set by server/database)
  readonly id?: number;
  company?: number; // Set from request.user on server
  readonly created_at?: string;
  
  // User-provided properties
  name: string;
  description: string;
  price_per_hour: number;
  field: string;
}