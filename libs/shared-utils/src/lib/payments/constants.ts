export const CAPABILITY_GRACE_PERIOD_DAYS = 7;
export const MULTIPLE_IMAGES_UNLOCKED_LIMIT = 10;

export enum Capability {
  LargeFiles = 'largeFiles',
  UltraLargeFiles = 'ultraLargeFiles',

  HighResImages = 'highResImages',
  UltraHighResImages = 'ultraHighResImages',

  AssistantMoreMessages = 'assistantMoreMessages',
  AssistantUnlimitedMessages = 'assistantUnlimitedMessages',
}

export interface SubscriptionModel {
  title: string;
  expiresInDays: number;
  capabilities: Capability[];
}

export enum SubscriptionModelName {
  Tier1Monthly = 'tier1-monthly',
  Tier1Yearly = 'tier1-yearly',
  Tier1Forever = 'tier1-forever',
  Tier2Monthly = 'tier2-monthly',
  Tier2Yearly = 'tier2-yearly',
  Tier2Forever = 'tier2-forever',
}

export const SUBSCRIPTION_MODELS = {
  [SubscriptionModelName.Tier1Monthly]: {
    title: 'Supporter (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantMoreMessages,
    ],
  },
  [SubscriptionModelName.Tier1Yearly]: {
    title: 'Supporter (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantMoreMessages,
    ],
  },
  [SubscriptionModelName.Tier1Forever]: {
    title: 'Supporter (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantMoreMessages,
    ],
  },
  [SubscriptionModelName.Tier2Monthly]: {
    title: 'Supporter+ (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantUnlimitedMessages,
    ],
  },
  [SubscriptionModelName.Tier2Yearly]: {
    title: 'Supporter+ (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantUnlimitedMessages,
    ],
  },
  [SubscriptionModelName.Tier2Forever]: {
    title: 'Supporter+ (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantUnlimitedMessages,
    ],
  },
} satisfies Record<SubscriptionModelName, SubscriptionModel> as Record<
  SubscriptionModelName,
  SubscriptionModel
>;
