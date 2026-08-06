import { EnvironmentType } from "@core/enums/environment-type";

const KNOWN_SLUGS: Record<string, EnvironmentType> = {
  dev: EnvironmentType.DESENVOLVIMENTO,
  desenvolvimento: EnvironmentType.DESENVOLVIMENTO,
  suporte: EnvironmentType.DESENVOLVIMENTO,
  "dev.gpm.srv.br": EnvironmentType.DESENVOLVIMENTO,
  "desenvolvimento.gpm.srv.br": EnvironmentType.DESENVOLVIMENTO,
  "suporte.gpm.srv.br": EnvironmentType.DESENVOLVIMENTO,
  hml: EnvironmentType.HOMOLOGACAO,
  homologacao: EnvironmentType.HOMOLOGACAO,
  homologação: EnvironmentType.HOMOLOGACAO,
  "hml.gpm.srv.br": EnvironmentType.HOMOLOGACAO,
  "homologacao.gpm.srv.br": EnvironmentType.HOMOLOGACAO,
  "homologação.gpm.srv.br": EnvironmentType.HOMOLOGACAO,
  gpm: EnvironmentType.OPERACAO,
  operacao: EnvironmentType.OPERACAO,
  operação: EnvironmentType.OPERACAO,
  "gpm.srv.br": EnvironmentType.OPERACAO,
  "operacao.gpm.srv.br": EnvironmentType.OPERACAO,
  "operação.gpm.srv.br": EnvironmentType.OPERACAO,
};

export function resolveEnvironmentFromSlug(slug: string): EnvironmentType | null {
  const normalizedSlug = slug.trim().toLowerCase();
  return KNOWN_SLUGS[normalizedSlug] ?? null;
}
