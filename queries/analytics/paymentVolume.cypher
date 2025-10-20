WITH CASE $interval
  WHEN 'day' THEN 'day'
  WHEN 'week' THEN 'week'
  ELSE 'month'
END AS interval
MATCH (p:Payment {status: 'completed'})
WITH p, interval,
     CASE interval
       WHEN 'day' THEN date(p.completedAt)
       WHEN 'week' THEN date(truncate(p.completedAt, 'week'))
       ELSE date(truncate(p.completedAt, 'month'))
     END AS period
RETURN period, sum(p.amount) AS totalAmount, count(p) AS count
ORDER BY period ASC