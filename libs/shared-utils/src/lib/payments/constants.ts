export const CAPABILITY_GRACE_PERIOD_DAYS = 7;
export const MULTIPLE_IMAGES_UNLOCKED_LIMIT = 10;

export enum Capability {
  HighResImages = 'highResImages',
  AssistantMoreMessages = 'assistantMoreMessages',
}

export interface SubscriptionModel {
  title: string;
  expiresInDays: number;
  capabilities: Capability[];
}

export enum SubscriptionModelName {
  Tier1Monthly = 'tier1-monthly',
  Tier1Yearly = 'tier1-yearly',
  Tier2Monthly = 'tier2-monthly',
  Tier2Yearly = 'tier2-yearly',
  Forever = 'forever',
}

export const SUBSCRIPTION_MODELS = {
  [SubscriptionModelName.Tier1Monthly]: {
    title: 'Supporter (Monthly)',
    expiresInDays: 31,
    capabilities: [Capability.HighResImages, Capability.AssistantMoreMessages],
  },
  [SubscriptionModelName.Tier1Yearly]: {
    title: 'Supporter (Yearly)',
    expiresInDays: 365,
    capabilities: [Capability.HighResImages, Capability.AssistantMoreMessages],
  },
  [SubscriptionModelName.Tier2Monthly]: {
    title: 'Supporter+ (Monthly)',
    expiresInDays: 31,
    capabilities: [Capability.HighResImages, Capability.AssistantMoreMessages],
  },
  [SubscriptionModelName.Tier2Yearly]: {
    title: 'Supporter+ (Yearly)',
    expiresInDays: 365,
    capabilities: [Capability.HighResImages, Capability.AssistantMoreMessages],
  },
  [SubscriptionModelName.Forever]: {
    title: 'The Forever Subscription...',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [Capability.HighResImages, Capability.AssistantMoreMessages],
  },
} satisfies Record<SubscriptionModelName, SubscriptionModel> as Record<
  SubscriptionModelName,
  SubscriptionModel
>;
