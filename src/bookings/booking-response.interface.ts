import { WorkshopResponse } from '../workshops/workshop-response.interface';

export interface BookingResponse {
  id: number;
  workshop: number;
  workshop_detail: WorkshopResponse;
  created_at: Date;
}
