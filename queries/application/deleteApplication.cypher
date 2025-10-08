MATCH (app:Application {id: $id})
OPTIONAL MATCH (app)-[r]-()
DELETE app, r
RETURN {id: $id, message: 'Application deleted successfully'} as result