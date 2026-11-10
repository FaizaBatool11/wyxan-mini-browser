
// import * as cheerio from 'cheerio';
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { Site, SiteDocument } from './schemas/site.schema';

// @Injectable()
// export class SitesService {
//   constructor(
//     @InjectModel(Site.name)
//     private siteModel: Model<SiteDocument>,
//   ) {}

//   async create(data: {
//     title: string;
//     address: string;
//     html: string;
//     author: string;
//   }) {
//     // Load HTML content
//     const $ = cheerio.load(data.html);

//     // Remove script and style content
//     $('script, style').remove();

//     // Extract readable text
//     const searchText = $('body')
//       .text()
//       .replace(/\s+/g, ' ')
//       .trim();

//     // Save website in database
//     const site = new this.siteModel({
//       title: data.title,
//       address: data.address,
//       html: data.html,
//       searchText: searchText,
//       author: new Types.ObjectId(data.author),
//     });

//     return site.save();
//   }

//   async updateByAddress(
//   address: string,
//   data: {
//     title: string;
//     html: string;
//     author: string;
//   },
// ) {
//   const $ = cheerio.load(data.html);

//   $('script, style').remove();

//   const searchText = $('body')
//     .text()
//     .replace(/\s+/g, ' ')
//     .trim();

//   const site = await this.siteModel.findOneAndUpdate(
//     { address: address.toLowerCase() },
//     {
//       $set: {
//         title: data.title,
//         html: data.html,
//         searchText,
//         author: new Types.ObjectId(data.author),
//       },
//     },
//     { new: true, runValidators: true },
//   ).exec();

//   if (!site) {
//     throw new NotFoundException('Website not found');
//   }

//   return site;
// }

//   async findAll() {
//     return this.siteModel
//       .find()
//       .populate('author', 'name')
//       .exec();
//   }

//   async findOne(address: string) {
//     const site = await this.siteModel
//       .findOne({ address: address.toLowerCase() })
//       .populate('author', 'name')
//       .exec();

//     if (!site) {
//       throw new NotFoundException('Website not found');
//     }

//     return site;
//   }
//   async search(keyword: string) {
//   if (!keyword || !keyword.trim()) {
//     return [];
//   }

//   return this.siteModel
//     .find({
//       searchText: {
//         $regex: keyword.trim(),
//         $options: 'i',
//       },
//     })
//     .select('title address author')
//     .populate('author', 'name')
//     .exec();
// }
// }


import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Site, SiteDocument } from './schemas/site.schema';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name)
    private siteModel: Model<SiteDocument>,
  ) {}

  // Sanitize HTML before saving
  private sanitizeContent(html: string) {
    return sanitizeHtml(html, {
      allowedTags: [
        'html',
        'head',
        'body',
        'title',
        'h1',
        'h2',
        'h3',
        'h4',
        'p',
        'div',
        'span',
        'a',
        'ul',
        'ol',
        'li',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'blockquote',
        'pre',
        'code',
        'br',
        'hr',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],

      allowedAttributes: {
        a: ['href', 'title'],
        th: ['colspan', 'rowspan'],
        td: ['colspan', 'rowspan'],
      },

      allowedSchemes: ['http', 'https'],

      disallowedTagsMode: 'discard',

      transformTags: {
        a: (_tagName, attribs) => {
          const href = attribs.href?.trim();

          if (!href) {
            return {
              tagName: 'a',
              attribs: {},
            };
          }

          // Reject external protocol-relative links
          if (href.startsWith('//')) {
            return {
              tagName: 'a',
              attribs: {},
            };
          }

          // Check absolute URLs
          if (/^https?:\/\//i.test(href)) {
            try {
              const url = new URL(href);

              if (!url.hostname.endsWith('.test')) {
                return {
                  tagName: 'a',
                  attribs: {},
                };
              }
            } catch {
              return {
                tagName: 'a',
                attribs: {},
              };
            }
          } else if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
            // Reject other URL schemes
            return {
              tagName: 'a',
              attribs: {},
            };
          }

          return {
            tagName: 'a',
            attribs: {
              href,
              ...(attribs.title ? { title: attribs.title } : {}),
            },
          };
        },
      },
    });
  }

  // Extract searchable text from HTML
  private extractSearchText(html: string) {
    const $ = cheerio.load(html);

    return $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Create website
  async create(data: {
    title: string;
    address: string;
    html: string;
    author: string;
  }) {
    const safeHtml = this.sanitizeContent(data.html);

    const searchText = this.extractSearchText(safeHtml);

    const site = new this.siteModel({
      title: data.title,
      address: data.address,
      html: safeHtml,
      searchText,
      author: new Types.ObjectId(data.author),
    });

    try {
  return await site.save();
} catch (error) {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  ) {
    throw new ConflictException(
      'A website with this address already exists.',
    );
  }

  throw error;
}
  }

  // Get all websites
  async findAll() {
    return this.siteModel
      .find()
      .populate('author', 'name')
      .exec();
  }

  // Get website by address
  async findOne(address: string) {
    const site = await this.siteModel
      .findOne({
        address: address.toLowerCase(),
      })
      .populate('author', 'name')
      .exec();

    if (!site) {
      throw new NotFoundException('Website not found');
    }

    return site;
  }

  // Search websites
  async search(keyword: string) {
    if (!keyword || !keyword.trim()) {
      return [];
    }

    const escapedKeyword = keyword.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    return this.siteModel
      .find({
        searchText: {
          $regex: escapedKeyword,
          $options: 'i',
        },
      })
      .select('title address author')
      .populate('author', 'name')
      .exec();
  }

  // Update website
  async updateByAddress(
    address: string,
    data: {
      title: string;
      html: string;
      author: string;
    },
  ) {
    const safeHtml = this.sanitizeContent(data.html);

    const searchText = this.extractSearchText(safeHtml);

    const site = await this.siteModel
      .findOneAndUpdate(
        {
          address: address.toLowerCase(),
        },
        {
          $set: {
            title: data.title,
            html: safeHtml,
            searchText,
            author: new Types.ObjectId(data.author),
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
        },
      )
      .exec();

    if (!site) {
      throw new NotFoundException('Website not found');
    }

    return site;
  }
}
