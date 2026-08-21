export interface DataInstitution {
  id: number;
  name: string;
  document?: string;
  type?: "HEADQUARTERS" | "BRANCH";
  active: boolean;
}
