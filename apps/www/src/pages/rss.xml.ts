import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );

  return rss({
    title: 'FeyNote Blog',
    description:
      'Tips, guides, and updates for TTRPG players and Dungeon Masters. Learn how to organize your D&D campaigns, build worlds, and get the most out of FeyNote.',
    site: context.site || 'https://feynote.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.slug}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
