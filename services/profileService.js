// services/profileService.js
const driver = require('../db/neo4j');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const updateProfile = async ({ userId, profile }) => {
  assertFeatureEnabled('customProfilesEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (user:User {id: $userId})
      SET user += {
        headline: $profile.headline,
        biography: $profile.biography,
        portfolioUrl: $profile.portfolioUrl,
        badges: $profile.badges,
        endorsements: $profile.endorsements
      }
      RETURN user
      `,
      { userId, profile }
    );

    return result.records[0]?.get('user')?.properties || null;
  } finally {
    await session.close();
  }
};

module.exports = {
  updateProfile
};