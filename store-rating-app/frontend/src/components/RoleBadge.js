import React from 'react';

const LABELS = {
  ADMIN: 'Admin',
  NORMAL: 'Normal',
  STORE_OWNER: 'Store Owner',
};

export default function RoleBadge({ role }) {
  return <span className={`badge badge-${role.toLowerCase()}`}>{LABELS[role] || role}</span>;
}
