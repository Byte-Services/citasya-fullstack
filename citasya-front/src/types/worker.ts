export interface DayAvailability {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface Availability {
  days: {
    Mon: DayAvailability;
    Tue: DayAvailability;
    Wed: DayAvailability;
    Thu: DayAvailability;
    Fri: DayAvailability;
    Sat: DayAvailability;
    Sun: DayAvailability;
  };
  breakTime: string;
}

export interface Specialist {
  id: number;
  name: string;
  specialties: string[];
  phone: string;
  documentId: string;
  email: string;
  services: { id: number; name: string }[];
  schedule?: Availability;
}

export interface Specialty {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  specialty: Specialty;
}