export const CAPABILITY_GRACE_PERIOD_DAYS = 7;
export const MULTIPLE_IMAGES_UNLOCKED_LIMIT = 10;

export enum Capability {
  LargeFiles = 'largeFiles',
  UltraLargeFiles = 'ultraLargeFiles',

  HighResImages = 'highResImages',
  UltraHighResImages = 'ultraHighResImages',

  AssistantEnhancedMessageLimit = 'assistantEnhancedMessageHistory',
  AssistantEnhancedMessageContext = 'assistantEnhancedMessageContext',
  AssistantLimitedEnhancedModel = 'assistantLimitedEnhancedModel',
  AssistantUnlimitedEnhancedModel = 'assistantUnlimitedEnhancedModel',
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
  Tier3Monthly = 'tier3-monthly',
  Tier3Yearly = 'tier3-yearly',
  Tier3Forever = 'tier3-forever',
}

export const SUBSCRIPTION_MODELS = {
  [SubscriptionModelName.Tier1Monthly]: {
    title: 'Quill Bearer (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
    ],
  },
  [SubscriptionModelName.Tier1Yearly]: {
    title: 'Quill Bearer (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
    ],
  },
  [SubscriptionModelName.Tier1Forever]: {
    title: 'Quill Bearer (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
    ],
  },
  [SubscriptionModelName.Tier2Monthly]: {
    title: 'Inkling (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier2Yearly]: {
    title: 'Inkling (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier2Forever]: {
    title: 'Inkling (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier3Monthly]: {
    title: 'Tome Keeper (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantUnlimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier3Yearly]: {
    title: 'Tome Keeper (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantUnlimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier3Forever]: {
    title: 'Tome Keeper (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageLimit,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantUnlimitedEnhancedModel,
    ],
  },
} satisfies Record<SubscriptionModelName, SubscriptionModel> as Record<
  SubscriptionModelName,
  SubscriptionModel
>;
