MATCH (s:Skill {id: $id})
DETACH DELETE s
RETURN {success: true} as result