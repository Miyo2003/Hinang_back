// Update offer status
MATCH (o:Offer {id: $offerId})
SET o.status = $status,
    o.updatedAt = datetime()
RETURN o