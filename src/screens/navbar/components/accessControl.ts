export const routeAccessConfig: Record<string, (rights: any) => boolean> = {
  "opd-billing": r => r?.CanOPDBilling === 1,
  // "ipd-billing": r => r?.CanIPDBilling === 1,
};

export const hasAccess = (pageKey: string, rights: any) => {
  const rule = routeAccessConfig[pageKey];
  if (!rule) return true;
  return rule(rights);
};

export const canViewEmrSectionHistory = (rights: any) => rights?.CanViewEmrSectionHistory === 1;
