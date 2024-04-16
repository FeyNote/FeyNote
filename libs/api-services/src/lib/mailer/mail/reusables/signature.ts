import dedent from 'dedent';

export const signature = {
  html: () => dedent`
    Best regards,<br />
    Chris and Julian<br />
    FeyNote - <a href="https://feynote.com">https://feynote.com</a>
  `,
  plain: () => dedent`
    Best regards,
    Chris and Julian
    FeyNote - https://feynote.com
  `,
};
