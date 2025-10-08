MATCH (app:Application {id: $id})
SET app.status = $status
RETURN app
