import { configApiRef, useApi } from '@backstage/core-plugin-api';

export interface GodwitLinks {
  target(name: string): string | undefined;
  run(id: string): string | undefined;
  plan(id: string): string | undefined;
  drift(): string | undefined;
}

const none: GodwitLinks = {
  target: () => undefined,
  run: () => undefined,
  plan: () => undefined,
  drift: () => undefined,
};

export function linksTo(publicUrl: string | undefined): GodwitLinks {
  const base = (publicUrl ?? '').trim().replace(/\/+$/, '');
  if (!base) {
    return none;
  }
  const at = (path: string) => `${base}/ui${path}`;

  return {
    target: name => at(`/targets/${encodeURIComponent(name)}`),
    run: id => at(`/runs/${encodeURIComponent(id)}`),
    plan: id => at(`/plans/${encodeURIComponent(id)}`),
    drift: () => at('/drift'),
  };
}

export function useGodwitLinks(): GodwitLinks {
  const configApi = useApi(configApiRef);

  return linksTo(configApi.getOptionalString('godwit.publicUrl'));
}
