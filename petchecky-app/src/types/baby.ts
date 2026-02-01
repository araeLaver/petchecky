// ============================================
// Baby/Child Types
// ============================================

export type Gender = "male" | "female";
export type BloodType = "A" | "B" | "O" | "AB" | "unknown";
export type FeedingType = "breast" | "formula" | "baby_food";
export type BreastSide = "left" | "right" | "both";
export type DiaperType = "wet" | "dirty" | "mixed" | "dry";
export type MilestoneCategory = "gross_motor" | "fine_motor" | "language" | "social" | "cognitive";

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string; // ISO date
  gender: Gender;
  birthWeight?: number; // kg
  birthHeight?: number; // cm
  bloodType?: BloodType;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  date: string;
  weight?: number; // kg
  height?: number; // cm
  headCircumference?: number; // cm
  notes?: string;
  createdAt: string;
}

export interface FeedingRecord {
  id: string;
  childId: string;
  type: FeedingType;
  startTime: string; // ISO datetime
  endTime?: string;
  // Breast feeding
  side?: BreastSide;
  durationMinutes?: number;
  // Formula
  amountMl?: number;
  // Baby food
  foodDescription?: string;
  notes?: string;
  createdAt: string;
}

export interface SleepRecord {
  id: string;
  childId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  quality?: "good" | "fair" | "poor";
  notes?: string;
  createdAt: string;
}

export interface DiaperRecord {
  id: string;
  childId: string;
  time: string;
  type: DiaperType;
  color?: string;
  notes?: string;
  createdAt: string;
}

export interface MilestoneRecord {
  id: string;
  childId: string;
  category?: MilestoneCategory;
  milestoneKey: string;
  achievedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ChildVaccination {
  id: string;
  childId: string;
  vaccineKey: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: string;
  completedDate?: string;
  hospital?: string;
  notes?: string;
  createdAt: string;
}

export interface ChildMedication {
  id: string;
  childId: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  notes?: string;
  active?: boolean;
  createdAt: string;
}
