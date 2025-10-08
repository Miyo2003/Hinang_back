MATCH (s:Skill {id: $id})
SET s.name = $name
RETURN s as skill