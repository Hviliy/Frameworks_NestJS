export interface WorkshopResponse {
  id: number;
  title: string;
  description: string;
  starts_at: Date;
  duration_minutes: number;
  capacity: number;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}
