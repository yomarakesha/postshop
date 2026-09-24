import React, { ReactNode } from 'react';

export type ProviderConfig =
  | React.ComponentType<{ children: ReactNode }>
  | [React.ComponentType<any>, Record<string, any>];

interface ComposeProvidersProps {
  providers: ProviderConfig[];
  children: ReactNode;
}

const ComposeProviders = ({ providers, children }: ComposeProvidersProps) => {
  const composed = providers.reduceRight((acc, provider) => {
    if (Array.isArray(provider)) {
      const [Provider, props] = provider;
      return <Provider {...props}>{acc}</Provider>;
    }

    const Provider = provider;
    return <Provider>{acc}</Provider>;
  }, children);

  return composed;
};

export default ComposeProviders;
