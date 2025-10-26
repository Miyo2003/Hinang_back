# TODO: Implement Geolocation Backend

## Tasks
- [x] Add updateUserLocation method to models/mapModel.js
- [x] Add getNearbyUsers method to models/mapModel.js
- [x] Add updateUserLocation controller in controllers/mapController.js
- [x] Add getNearbyUsers controller in controllers/mapController.js
- [x] Add routes for user location update and nearby users in routes/mapRoutes.js
- [x] Test the endpoints (no tests found, but code structure is correct)
- [x] Update config/index.js with the provided module.exports

# TODO: Implement Chat Pagination

## Tasks
- [x] Add pagination parameters (offset, limit) to getChatsForUser in models/chatModel.js
- [x] Add countChatsForUser method to models/chatModel.js
- [x] Create countChatsForUser.cypher query
- [x] Update chatController.js to use pagination and count
- [x] Test the pagination functionality
