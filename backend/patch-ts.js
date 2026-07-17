const fs = require('fs');

// Fix auth.service.ts
let auth = fs.readFileSync('src/auth/auth.service.ts', 'utf8');
auth = auth.replace(/tenantId: user.tenantId,/g, 'tenantId: user.tenantId ?? "",');
fs.writeFileSync('src/auth/auth.service.ts', auth);

// Fix seed.ts
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');
seed = seed.replace(/tenantId: tenant.id/g, 'tenant: { connect: { id: tenant.id } }');
fs.writeFileSync('prisma/seed.ts', seed);

// Fix add-revenue.ts
let revenue = fs.readFileSync('prisma/add-revenue.ts', 'utf8');
revenue = revenue.replace(/role: 'ADMIN'/g, 'roleId: null');
fs.writeFileSync('prisma/add-revenue.ts', revenue);

// Fix seed-20-leads.ts
let seed20 = fs.readFileSync('prisma/seed-20-leads.ts', 'utf8');
seed20 = seed20.replace(/role: 'ADMIN'/g, 'roleId: null');
fs.writeFileSync('prisma/seed-20-leads.ts', seed20);
