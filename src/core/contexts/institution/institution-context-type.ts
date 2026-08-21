import { DataInstitution } from "@modules/institution/repository/institution-type";

export interface IInstitutionContextValue {
  institutions: DataInstitution[];
  selectedInstitution: DataInstitution | null;
  isLoadingInstitutions: boolean;
  errorMessage: string | null;
  selectInstitution: (institutionId: number, rememberSelection: boolean) => Promise<void>;
  refreshInstitutions: () => Promise<void>;
}
