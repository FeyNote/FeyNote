import {
  AppPreferences,
  AppTheme,
  ArtifactReferenceExistingArtifactSharingMode,
  ArtifactReferenceNewArtifactSharingMode,
  PreferenceNames,
  PreferencesSync,
  SupportedFontSize,
  SupportedLanguages,
} from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { z } from 'zod';

export const setPreferences = authenticatedProcedure
  .input(
    z.object({
      preferencesVersion: z.number().min(0),

      [PreferenceNames.PanesRememberOpenState]: z.boolean(),
      [PreferenceNames.LeftPaneStartOpen]: z.boolean(),
      [PreferenceNames.LeftPaneShowArtifactTree]: z.boolean(),
      [PreferenceNames.LeftPaneArtifactTreeShowUncategorized]: z.boolean(),
      [PreferenceNames.LeftPaneShowRecentThreads]: z.boolean(),
      [PreferenceNames.RightPaneStartOpen]: z.boolean(),
      [PreferenceNames.Language]: z.nativeEnum(SupportedLanguages).nullable(),
      [PreferenceNames.FontSize]: z.nativeEnum(SupportedFontSize),
      [PreferenceNames.Theme]: z.nativeEnum(AppTheme),
      [PreferenceNames.CollaborationColor]: z.string().length(7),
      [PreferenceNames.PreferencesSync]: z.nativeEnum(PreferencesSync),
      [PreferenceNames.GraphShowOrphans]: z.boolean(),
      [PreferenceNames.GraphLockNodeOnDrag]: z.boolean(),
      [PreferenceNames.ArtifactReferenceNewArtifactSharingMode]: z.nativeEnum(
        ArtifactReferenceNewArtifactSharingMode,
      ),
      [PreferenceNames.ArtifactReferenceExistingArtifactSharingMode]:
        z.nativeEnum(ArtifactReferenceExistingArtifactSharingMode),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) satisfies z.ZodSchema<AppPreferences, any, any>,
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    await prisma.user.update({
      where: {
        id: ctx.session.userId,
      },
      data: {
        preferences: input,
      },
    });

    return 'Ok';
  });
