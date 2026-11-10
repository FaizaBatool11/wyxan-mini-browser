
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import * as cheerio from 'cheerio';

import { PersonSchema } from './people/schemas/person.schema';
import { SiteSchema } from './sites/schemas/site.schema';
import { VisitSchema } from './visits/schemas/visit.schema';

async function seed() {
  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI!);

  console.log('MongoDB connected');

  // 2. Create models
  const PersonModel = mongoose.model('Person', PersonSchema);
  const SiteModel = mongoose.model('Site', SiteSchema);
  const VisitModel = mongoose.model('Visit', VisitSchema);

  // 3. Create people
  const peopleData = [
    'Ayesha Khan',
    'Bilal Ahmed',
    'Sara Malik',
    'Hamza Ali',
    'Noor Fatima',
  ];

  const people: Record<string, Types.ObjectId> = {};

  for (const name of peopleData) {
    const person = await PersonModel.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, returnDocument: 'after' }
    );

    people[name] = person._id;
  }

  console.log('People created');

  // 4. Website data
  const websites = [
    {
      title: 'Tech World',
      address: 'http://techworld.test',
      author: 'Ayesha Khan',
      html: `<html><body>
        <h1>Welcome to Tech World</h1>
        <p>Technology, artificial intelligence, programming and software development.</p>
        <a href="http://dailynews.test">Daily News</a>
        <a href="http://sciencedaily.test">Science Hub</a>
        <a href="http://missing.test">Broken Link</a>
      </body></html>`,
    },
    {
      title: 'Daily News',
      address: 'http://dailynews.test',
      author: 'Ayesha Khan',
      html: `<html><body>
        <h1>Daily News</h1>
        <p>Latest national news, world news, business and current affairs.</p>
        <a href="http://techworld.test">Tech World</a>
        <a href="http://sportsarena.test">Sports Arena</a>
      </body></html>`,
    },
    {
      title: 'Food Corner',
      address: 'http://foodcorner.test',
      author: 'Bilal Ahmed',
      html: `<html><body>
        <h1>Food Corner</h1>
        <p>Cooking recipes, healthy food, desserts and traditional dishes.</p>
        <a href="http://travelguide.test">Travel Guide</a>
        <a href="http://healthhub.test">Health Hub</a>
      </body></html>`,
    },
    {
      title: 'Travel Guide',
      address: 'http://travelguide.test',
      author: 'Bilal Ahmed',
      html: `<html><body>
        <h1>Travel Guide</h1>
        <p>Explore beautiful destinations, tourism, hotels and travel tips.</p>
        <a href="http://foodcorner.test">Food Corner</a>
        <a href="http://missingplace.test">Broken Destination</a>
      </body></html>`,
    },
    {
      title: 'Health Hub',
      address: 'http://healthhub.test',
      author: 'Sara Malik',
      html: `<html><body>
        <h1>Health Hub</h1>
        <p>Health, fitness, exercise, nutrition and wellness information.</p>
        <a href="http://foodcorner.test">Food Corner</a>
        <a href="http://educationpoint.test">Education Point</a>
      </body></html>`,
    },
    {
      title: 'Sports Arena',
      address: 'http://sportsarena.test',
      author: 'Sara Malik',
      html: `<html><body>
        <h1>Sports Arena</h1>
        <p>Cricket, football, sports news, match results and player updates.</p>
        <a href="http://dailynews.test">Daily News</a>
        <a href="http://moviezone.test">Movie Zone</a>
      </body></html>`,
    },
    {
      title: 'Education Point',
      address: 'http://educationpoint.test',
      author: 'Hamza Ali',
      html: `<html><body>
        <h1>Education Point</h1>
        <p>Online learning, programming courses, tutorials and education.</p>
        <a href="http://techworld.test">Tech World</a>
        <a href="http://sciencedaily.test">Science Daily</a>
      </body></html>`,
    },
    {
      title: 'Movie Zone',
      address: 'http://moviezone.test',
      author: 'Hamza Ali',
      html: `<html><body>
        <h1>Movie Zone</h1>
        <p>Movies, entertainment, cinema, reviews and film news.</p>
        <a href="http://fashionstreet.test">Fashion Street</a>
        <a href="http://sportsarena.test">Sports Arena</a>
      </body></html>`,
    },
    {
      title: 'Science Daily',
      address: 'http://sciencedaily.test',
      author: 'Noor Fatima',
      html: `<html><body>
        <h1>Science Daily</h1>
        <p>Science, research, discoveries, space and scientific technology.</p>
        <a href="http://educationpoint.test">Education Point</a>
        <a href="http://techworld.test">Tech World</a>
      </body></html>`,
    },
    {
      title: 'Fashion Street',
      address: 'http://fashionstreet.test',
      author: 'Noor Fatima',
      html: `<html><body>
        <h1>Fashion Street</h1>
        <p>Fashion trends, clothing, lifestyle, beauty and design.</p>
        <a href="http://moviezone.test">Movie Zone</a>
        <a href="http://healthhub.test">Health Hub</a>
      </body></html>`,
    },
  ];

  // 5. Save websites
  const savedSites: Record<string, Types.ObjectId> = {};

  for (const website of websites) {
    const $ = cheerio.load(website.html);

    $('script, style').remove();

    const searchText = $('body').text().replace(/\s+/g, ' ').trim();

    const site = await SiteModel.findOneAndUpdate(
      { address: website.address },
      {
        $set: {
          title: website.title,
          address: website.address,
          html: website.html,
          searchText,
          author: people[website.author],
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    savedSites[website.address] = site._id;
  }

  console.log('10 websites created');

  // 6. Browsing history for one hour
  const browsingHistory = [
    ['Ayesha Khan', 'http://techworld.test', 0, 'typed'],
    ['Ayesha Khan', 'http://dailynews.test', 4, 'link'],
    ['Ayesha Khan', 'http://sportsarena.test', 8, 'link'],
    ['Ayesha Khan', 'http://moviezone.test', 12, 'link'],
    ['Ayesha Khan', 'http://fashionstreet.test', 17, 'link'],
    ['Ayesha Khan', 'http://moviezone.test', 21, 'back'],
    ['Ayesha Khan', 'http://sciencedaily.test', 26, 'typed'],
    ['Ayesha Khan', 'http://educationpoint.test', 30, 'link'],
    ['Ayesha Khan', 'http://techworld.test', 35, 'history'],
    ['Ayesha Khan', 'http://dailynews.test', 40, 'typed'],
    ['Ayesha Khan', 'http://sportsarena.test', 45, 'link'],
    ['Ayesha Khan', 'http://foodcorner.test', 49, 'typed'],
    ['Ayesha Khan', 'http://travelguide.test', 53, 'link'],
    ['Ayesha Khan', 'http://healthhub.test', 57, 'link'],
    ['Ayesha Khan', 'http://techworld.test', 60, 'search'],

    ['Bilal Ahmed', 'http://foodcorner.test', 5, 'typed'],
    ['Bilal Ahmed', 'http://travelguide.test', 15, 'link'],
    ['Bilal Ahmed', 'http://healthhub.test', 25, 'link'],

    ['Sara Malik', 'http://sportsarena.test', 10, 'typed'],
    ['Sara Malik', 'http://dailynews.test', 20, 'link'],
    ['Sara Malik', 'http://healthhub.test', 35, 'typed'],

    ['Hamza Ali', 'http://educationpoint.test', 8, 'typed'],
    ['Hamza Ali', 'http://techworld.test', 22, 'link'],
    ['Hamza Ali', 'http://sciencedaily.test', 42, 'link'],

    ['Noor Fatima', 'http://fashionstreet.test', 12, 'typed'],
    ['Noor Fatima', 'http://moviezone.test', 32, 'link'],
    ['Noor Fatima', 'http://sciencedaily.test', 52, 'typed'],
  ] as const;

  // Fixed starting time makes the seed history deterministic
  const startTime = new Date('2026-11-10T10:00:00.000Z');

  for (const [personName, address, minute, navigationType] of browsingHistory) {
    const visitedAt = new Date(
      startTime.getTime() + minute * 60 * 1000,
    );

    await VisitModel.updateOne(
      {
        person: people[personName],
        site: savedSites[address],
        visitedAt,
      },
      {
        $setOnInsert: {
          person: people[personName],
          site: savedSites[address],
          visitedAt,
          navigationType,
        },
      },
      { upsert: true },
    );
  }

  console.log('Browsing history created');
  console.log('Seed completed successfully!');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
