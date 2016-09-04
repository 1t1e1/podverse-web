const
    SqlEngine = require('repositories/sequelize/engineFactory.js'),
    registerModels = require('repositories/sequelize/models'),
    {locator} = require('locator.js'),
    appFactory = require('appFactory.js'),
    PodcastService = require('services/podcast/PodcastService.js'),
    PlaylistService = require('services/playlist/PlaylistService.js'),
    ClipService = require('services/clip/ClipService.js'),
    nJwt = require('njwt'),
    config = require('config.js');

function configureDatabaseModels (resolve) {

  beforeEach(function (done) {
    this._sqlEngine = new SqlEngine({storagePath: ':memory:'});
    const Models = registerModels(this._sqlEngine);

    this._sqlEngine.sync()
      .then(() => {
        locator.set('Models', Models);
        resolve.apply(this, [Models]);
        done();
      });
  });

  afterEach(function (done) {
    locator.set('Models', undefined);
    this._sqlEngine.dropAllSchemas()
      .then(() => done());
  });
}

function createTestApp (Models) {
  locator.set('PlaylistService', new PlaylistService());
  locator.set('ClipService', new ClipService());
  locator.set('PodcastService', new PodcastService());
  return appFactory();
}

function createValidTestJWT () {
  const userId = 'kungfury@podverse.fm'

  const claims = {
    iss: 'http://localhost:8080',
    // iss: 'https://podverse.fm', // for production
    sub: userId
  };

  const jwt = nJwt.create(claims, config.jwtSigningKey);
  jwt.setExpiration(); // Never expire why not
  const token = jwt.compact();

  return token
}

function createTestPodcastAndEpisode (Models) {

  const {Podcast, Episode} = Models;

  return Podcast.findOrCreate({
    where: {
      'feedURL': 'http://example.com/test333'
    },
    defaults: {
      'feedURL': 'http://example.com/test333',
      'title': 'Most interesting podcast in the world'
    }
  })
    .then(podcasts => {

      return Promise.all([
        Promise.resolve(podcasts),
        Episode.findOrCreate({
          where: {
            mediaURL: 'http://example.com/test999'
          },
          defaults: Object.assign({}, {}, {
            feedURL: 'http://example.com/test999',
            title: 'Best episode in the history of time',
            podcastId: podcasts[0].id
          })
        })
      ]);
    });
}

function createTestMediaRefs (Models) {

  const {MediaRef} = Models;

  return createTestPodcastAndEpisode(Models)
    .then(([podcasts, episodes]) => {

      let mediaRefs = [];
      for (let i = 0; i < 4; i++) {
        let mediaRef = {
          ownerId: 'testOwner',
          episodeId: episodes[0].id,
          title: `TestTitle${i}`
        }
        mediaRefs.push(mediaRef);
      }

      return Promise.all([
        MediaRef.create(mediaRefs[0]),
        MediaRef.create(mediaRefs[1]),
        MediaRef.create(mediaRefs[2]),
        MediaRef.create(mediaRefs[3])
      ]);

    });

}

function createTestPlaylist (Models) {

  const {Playlist} = Models;

  const playlistSvc = new PlaylistService({Models: Models});

  return createTestMediaRefs(Models)
    .then(mediaRefs => {
      return playlistSvc.create({
        'title': 'Playlist Title',
        'slug': 'playlist-slug',
        'ownerId': 'kungfury@podverse.fm',
        'playlistItems': [mediaRefs[0], mediaRefs[1]]
      });
    });
}

module.exports = {
  configureDatabaseModels,
  createTestApp,
  createValidTestJWT,
  createTestPodcastAndEpisode,
  createTestPlaylist,
  createTestMediaRefs
};
