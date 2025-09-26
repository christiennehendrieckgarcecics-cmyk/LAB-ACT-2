const db = require('../config/db');

/**
 * A) INNER JOIN — users who have at least one role
 * Expected: u.id, u.email, r.role_name
 */
exports.usersWithRoles = (req, res) => {
  const sql = `
    SELECT u.id AS user_id, u.email, r.role_name
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.id
    INNER JOIN roles r ON r.id = ur.role_id
    ORDER BY u.id, r.role_name;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * B) LEFT JOIN — all users with profile info (if present)
 * Expected: u.id, u.email, p.phone, p.city, p.country
 */
exports.usersWithProfiles = (req, res) => {
  const sql = `
    SELECT u.id AS user_id, u.email, p.phone, p.city, p.country
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY u.id;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * C) RIGHT JOIN — keep all roles even if unassigned
 * Expected: r.role_name, user_id, email
 *
 * Note: MySQL supports RIGHT JOIN. We'll join user_roles and users.
 */
exports.rolesRightJoin = (req, res) => {
  const sql = `
    SELECT r.role_name, u.id AS user_id, u.email
    FROM user_roles ur
    RIGHT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN users u ON u.id = ur.user_id
    ORDER BY r.role_name, user_id;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * D) FULL OUTER JOIN emulation — profiles vs users
 * Use LEFT JOIN UNION RIGHT JOIN to emulate FULL OUTER JOIN (dedupe)
 */
exports.profilesFullOuter = (req, res) => {
  const sql = `
    SELECT u.id AS user_id, u.email, p.id AS profile_id, p.phone, p.city, p.country
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
  UNION
    SELECT u.id AS user_id, u.email, p.id AS profile_id, p.phone, p.city, p.country
    FROM users u
    RIGHT JOIN profiles p ON p.user_id = u.id
    ORDER BY user_id;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * E) CROSS JOIN — every user × every role
 * Expected: user_id, email, role_name
 */
exports.userRoleCombos = (req, res) => {
  const sql = `
    SELECT u.id AS user_id, u.email, r.role_name
    FROM users u
    CROSS JOIN roles r
    ORDER BY u.id, r.role_name;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * F) SELF JOIN — who referred whom
 * Expected: referrer_user_id, referrer_email, referred_user_id, referred_email, referred_at
 */
exports.referrals = (req, res) => {
  const sql = `
    SELECT ref.referrer_user_id,
           u1.email AS referrer_email,
           ref.referred_user_id,
           u2.email AS referred_email,
           ref.referred_at
    FROM referrals ref
    INNER JOIN users u1 ON u1.id = ref.referrer_user_id
    INNER JOIN users u2 ON u2.id = ref.referred_user_id
    ORDER BY ref.referred_at DESC;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * G) Latest login per user — LEFT JOIN + subquery
 * Expected: u.id, u.email, la.ip_address, la.occurred_at
 *
 * We'll use a subquery that selects the latest occurred_at per user.
 */
exports.latestLogin = (req, res) => {
  const sql = `
    SELECT u.id AS user_id, u.email, la.ip_address, la.occurred_at
    FROM users u
    LEFT JOIN (
      SELECT t1.user_id, t1.ip_address, t1.occurred_at
      FROM login_audit t1
      INNER JOIN (
        SELECT user_id, MAX(occurred_at) AS max_occurred
        FROM login_audit
        GROUP BY user_id
      ) t2 ON t1.user_id = t2.user_id AND t1.occurred_at = t2.max_occurred
    ) la ON la.user_id = u.id
    ORDER BY u.id;
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
