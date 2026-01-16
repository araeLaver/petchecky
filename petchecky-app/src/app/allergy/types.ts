export interface Allergy {
  id: string;
  petId: string;
  name: string;
  type: "food" | "environmental" | "medication" | "contact";
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  diagnosedDate?: string;
  notes?: string;
  reactions: AllergyReaction[];
}

export interface AllergyReaction {
  id: string;
  date: string;
  trigger?: string;
  symptoms: string[];
  severity: "mild" | "moderate" | "severe";
  treatment?: string;
  notes?: string;
}

export interface DietaryRestriction {
  id: string;
  petId: string;
  ingredient: string;
  reason: "allergy" | "intolerance" | "medical" | "preference";
  notes?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
}

export type AllergyType = Allergy["type"];
export type Severity = Allergy["severity"];
