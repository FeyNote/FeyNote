export const CAPABILITY_GRACE_PERIOD_DAYS = 7;

export enum Capability {
  LargeFiles = 'largeFiles',
  UltraLargeFiles = 'ultraLargeFiles',

  HighResImages = 'highResImages',
  UltraHighResImages = 'ultraHighResImages',

  AssistantEnhancedMessageContext = 'assistantEnhancedMessageContext',
  AssistantLimitedEnhancedModel = 'assistantLimitedEnhancedModel',
  AssistantUnlimitedEnhancedModel = 'assistantUnlimitedEnhancedModel',

  MoreRevisions = 'moreRevisions',
}

export interface SubscriptionModel {
  title: string;
  expiresInDays: number;
  capabilities: Capability[];
}

export enum SubscriptionModelName {
  PYOMonthly = 'pyo-monthly',
  PYOYearly = 'pyo-yearly',
  PYOForever = 'pyo-forever',
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
  [SubscriptionModelName.PYOMonthly]: {
    title: 'Choose Your Price (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.MoreRevisions,
      Capability.LargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.PYOYearly]: {
    title: 'Choose Your Price (Monthly)',
    expiresInDays: 365,
    capabilities: [
      Capability.MoreRevisions,
      Capability.LargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.PYOForever]: {
    title: 'Choose Your Price (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.MoreRevisions,
      Capability.LargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier1Monthly]: {
    title: 'Quill Bearer (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.MoreRevisions,
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier1Yearly]: {
    title: 'Quill Bearer (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.MoreRevisions,
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier1Forever]: {
    title: 'Quill Bearer (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.MoreRevisions,
      Capability.LargeFiles,
      Capability.HighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier2Monthly]: {
    title: 'Inkling (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.MoreRevisions,
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier2Yearly]: {
    title: 'Inkling (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.MoreRevisions,
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier2Forever]: {
    title: 'Inkling (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.MoreRevisions,
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier3Monthly]: {
    title: 'Tome Keeper (Monthly)',
    expiresInDays: 31,
    capabilities: [
      Capability.MoreRevisions,
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier3Yearly]: {
    title: 'Tome Keeper (Yearly)',
    expiresInDays: 365,
    capabilities: [
      Capability.MoreRevisions,
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
  [SubscriptionModelName.Tier3Forever]: {
    title: 'Tome Keeper (Forever)',
    expiresInDays: 3650, // 10 years - okay, not quite forever
    capabilities: [
      Capability.MoreRevisions,
      Capability.UltraLargeFiles,
      Capability.UltraHighResImages,
      Capability.AssistantEnhancedMessageContext,
      Capability.AssistantLimitedEnhancedModel,
    ],
  },
} satisfies Record<SubscriptionModelName, SubscriptionModel> as Record<
  SubscriptionModelName,
  SubscriptionModel
>;
