import type { Generate5eWeaponParams } from '../tools/generate5eWeapon';

export const convert5eWeaponToTipTap = (
  generatedWeapon?: Generate5eWeaponParams,
) => {
  const content = [];
  if (generatedWeapon) {
    if (generatedWeapon.name) {
      content.push({
        type: 'heading',
        attrs: { level: 4 },
        content: [{ type: 'text', text: generatedWeapon.name }],
      });
    }
    generatedWeapon.subtitle &&
      content.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: generatedWeapon.subtitle,
          },
        ],
      });
    const weaponSpecParagraph = {
      type: 'paragraph',
      content: [] as any,
    };
    if (generatedWeapon.category) {
      weaponSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Category:',
        },
        {
          type: 'text',
          text: ' ' + generatedWeapon.category,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedWeapon.damage) {
      weaponSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Damage:',
        },
        {
          type: 'text',
          text: ' ' + generatedWeapon.damage,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedWeapon.damageType) {
      weaponSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Damage Type:',
        },
        {
          type: 'text',
          text: ' ' + generatedWeapon.damageType,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedWeapon.rarity) {
      weaponSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Item Rarity:',
        },
        {
          type: 'text',
          text: ' ' + generatedWeapon.rarity,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedWeapon.properties) {
      weaponSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Properties:',
        },
        {
          type: 'text',
          text: ' ' + generatedWeapon.properties,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedWeapon.weight) {
      weaponSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Weight:',
        },
        {
          type: 'text',
          text: ' ' + generatedWeapon.weight,
        },
      );
    }
    content.push(weaponSpecParagraph);
    if (generatedWeapon.descriptionBlocks) {
      generatedWeapon.descriptionBlocks.forEach((block) =>
        content.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: block,
            },
          ],
        }),
      );
    }
  }

  const tiptapContent = [
    {
      type: 'customSpellSheet',
      attrs: {
        wide: false,
      },
      content,
    },
  ];

  return tiptapContent;
};
