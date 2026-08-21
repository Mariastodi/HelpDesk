import { AxiosInstance } from "axios";
import { appConfig } from "@core/config/app-config";
import { DataInstitution } from "./institution-type";

interface IInstitutionsResponseBody {
  institutions: DataInstitution[];
}

export async function getInstitutions(
  apiClient: AxiosInstance,
  authenticatedUserId?: number,
): Promise<DataInstitution[]> {
  if (appConfig.isMockApiEnabled) {
    await new Promise((resolve) =>
      setTimeout(resolve, appConfig.simulatedRequestDelayInMilliseconds),
    );
    const mockInstitutions: DataInstitution[] = [
      {
        id: 101,
        name: "Matriz - Fortaleza",
        document: "00.000.000/0001-00",
        type: "HEADQUARTERS",
        active: true,
      },
      {
        id: 205,
        name: "Filial - Sobral",
        document: "00.000.000/0002-00",
        type: "BRANCH",
        active: true,
      },
    ];
    if (authenticatedUserId === 2) return [];
    if (authenticatedUserId === 3) return [mockInstitutions[0]];
    return mockInstitutions;
  }

  const { data } = await apiClient.get<IInstitutionsResponseBody | DataInstitution[]>(
    "/auth/me/institutions",
  );
  const institutions = Array.isArray(data) ? data : data.institutions;
  return institutions.filter((institution) => institution.active);
}
