import { Capability, SUBSCRIPTION_MODELS } from '@feynote/shared-utils';

export const getModelsForCapability = (capability: Capability) => {
  return Object.values(SUBSCRIPTION_MODELS).filter(
    (model) => model.capabilities.indexOf(capability) > -1,
  );
};
