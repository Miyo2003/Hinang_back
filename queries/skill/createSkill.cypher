MERGE (s:Skill {name: $name}) 
ON CREATE SET s.id = randomUUID()
RETURN s as skill