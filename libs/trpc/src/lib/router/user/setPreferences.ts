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
import type { ZodShape } from '@feynote/global-types';

export const setPreferences = authenticatedProcedure
  .input(
    z.object({
      preferencesVersion: z.number().min(0),

      [PreferenceNames.PanesRememberOpenState]: z.boolean(),
      [PreferenceNames.LeftPaneStartOpen]: z.boolean(),
      [PreferenceNames.LeftPaneShowArtifactTree]: z.boolean(),
      [PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate]: z.boolean(),
      [PreferenceNames.LeftPaneArtifactTreeShowUncategorized]: z.boolean(),
      [PreferenceNames.LeftPaneShowRecentThreads]: z.boolean(),
      [PreferenceNames.RightPaneStartOpen]: z.boolean(),
      [PreferenceNames.Language]: z.enum(SupportedLanguages).nullable(),
      [PreferenceNames.FontSize]: z.enum(SupportedFontSize),
      [PreferenceNames.Theme]: z.enum(AppTheme),
      [PreferenceNames.CollaborationColor]: z.string().length(7),
      [PreferenceNames.PreferencesSync]: z.enum(PreferencesSync),
      [PreferenceNames.GraphShowOrphans]: z.boolean(),
      [PreferenceNames.GraphLockNodeOnDrag]: z.boolean(),
      [PreferenceNames.ArtifactReferenceNewArtifactSharingMode]: z.enum(
        ArtifactReferenceNewArtifactSharingMode,
      ),
      [PreferenceNames.ArtifactReferenceExistingArtifactSharingMode]: z.enum(
        ArtifactReferenceExistingArtifactSharingMode,
      ),
    } satisfies ZodShape<AppPreferences>),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    await prisma.user.update({
      where: {
        id: ctx.session.userId,
      },
      data: {
        // We rebuild preferences as an object here to eliminate "extra" properties.
        // One _could_ use Zod's strict mode to do this, but then we'd 400 any request with an extra (potentially legacy) property. This is better.
        preferences: {
          preferencesVersion: input.preferencesVersion,

          [PreferenceNames.PanesRememberOpenState]:
            input[PreferenceNames.PanesRememberOpenState],
          [PreferenceNames.LeftPaneStartOpen]:
            input[PreferenceNames.LeftPaneStartOpen],
          [PreferenceNames.LeftPaneShowArtifactTree]:
            input[PreferenceNames.LeftPaneShowArtifactTree],
          [PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate]:
            input[PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate],
          [PreferenceNames.LeftPaneArtifactTreeShowUncategorized]:
            input[PreferenceNames.LeftPaneArtifactTreeShowUncategorized],
          [PreferenceNames.LeftPaneShowRecentThreads]:
            input[PreferenceNames.LeftPaneShowRecentThreads],
          [PreferenceNames.RightPaneStartOpen]:
            input[PreferenceNames.RightPaneStartOpen],
          [PreferenceNames.Language]: input[PreferenceNames.Language],
          [PreferenceNames.FontSize]: input[PreferenceNames.FontSize],
          [PreferenceNames.Theme]: input[PreferenceNames.Theme],
          [PreferenceNames.CollaborationColor]:
            input[PreferenceNames.CollaborationColor],
          [PreferenceNames.PreferencesSync]:
            input[PreferenceNames.PreferencesSync],
          [PreferenceNames.GraphShowOrphans]:
            input[PreferenceNames.GraphShowOrphans],
          [PreferenceNames.GraphLockNodeOnDrag]:
            input[PreferenceNames.GraphLockNodeOnDrag],
          [PreferenceNames.ArtifactReferenceNewArtifactSharingMode]:
            input[PreferenceNames.ArtifactReferenceNewArtifactSharingMode],
          [PreferenceNames.ArtifactReferenceExistingArtifactSharingMode]:
            input[PreferenceNames.ArtifactReferenceExistingArtifactSharingMode],
        } satisfies AppPreferences,
      },
    });

    return 'Ok';
  });
