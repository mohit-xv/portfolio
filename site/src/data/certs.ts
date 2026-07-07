/**
 * AWS certification data for the laurel wall.
 * Badge IDs taken from the 5 Credly URLs provided.
 * Order: foundational → associate → speciality — verify against Credly profile.
 */
export interface Cert {
  name: string;
  shortName: string;
  level: string;
  badgeImage: string;
  credly: string;
  badgeId: string;
  year: string;
}

export const certs: Cert[] = [
  {
    name: 'AWS Certified Cloud Practitioner',
    shortName: 'Cloud Practitioner',
    level: 'Foundational',
    badgeImage: '/badges/cloud-practitioner.png',
    credly: 'https://www.credly.com/badges/e2c1843b-c2db-401a-a1ee-ce6b8d807e6d/public_url',
    badgeId: 'e2c1843b-c2db-401a-a1ee-ce6b8d807e6d',
    year: 'MMXXIV',
  },
  {
    name: 'AWS Certified Solutions Architect – Associate',
    shortName: 'Solutions Architect',
    level: 'Associate',
    badgeImage: '/badges/solutions-architect.png',
    credly: 'https://www.credly.com/badges/92ba7c3d-5e7b-4d10-91bb-db101c1b935f/public_url',
    badgeId: '92ba7c3d-5e7b-4d10-91bb-db101c1b935f',
    year: 'MMXXV',
  },
  {
    name: 'AWS Certified Data Engineer – Associate',
    shortName: 'Data Engineer',
    level: 'Associate',
    badgeImage: '/badges/data-engineer.png',
    credly: 'https://www.credly.com/badges/3353f067-f82d-4a16-a715-1d6733b39cfb/public_url',
    badgeId: '3353f067-f82d-4a16-a715-1d6733b39cfb',
    year: 'MMXXV',
  },
  {
    name: 'AWS Certified CloudOps Engineer – Associate',
    shortName: 'CloudOps Engineer',
    level: 'Associate',
    badgeImage: '/badges/cloudops-engineer.png',
    credly: 'https://www.credly.com/badges/34e2f49d-a555-4f07-8fce-147e24ee3e0b/public_url',
    badgeId: '34e2f49d-a555-4f07-8fce-147e24ee3e0b',
    year: 'MMXXV',
  },
  {
    name: 'AWS Certified AI Practitioner',
    shortName: 'AI Practitioner',
    level: 'Foundational',
    badgeImage: '/badges/ai-practitioner.png',
    credly: 'https://www.credly.com/badges/1782092e-c4c7-4d96-9b59-92b585c9c893/public_url',
    badgeId: '1782092e-c4c7-4d96-9b59-92b585c9c893',
    year: 'MMXXV',
  },
];
