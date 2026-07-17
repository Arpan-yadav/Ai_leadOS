const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

const additionalModels = `
model Tenant {
  id                String             @id @default(cuid())
  name              String
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  users             User[]
  leads             Lead[]
  settings          TenantSettings?
  customRoles       CustomRole[]

  @@map("tenants")
}

model CustomRole {
  id                String             @id @default(cuid())
  name              String
  permissions       Json               // stores granular permissions e.g. { viewAllLeads: true }
  isDefault         Boolean            @default(false)
  tenantId          String
  tenant            Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users             User[]

  @@map("custom_roles")
}
`;

code = code.replace('model User {', additionalModels + '\nmodel User {');

// Inject tenantId into User
code = code.replace(/(model User \{[^}]*?)role\s+Role\s+@default\(EXECUTIVE\)([^}]*?\})/s, (m, p1, p2) => {
  return p1 + 'tenantId          String\n  tenant            Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  roleId            String?\n  role              CustomRole?        @relation(fields: [roleId], references: [id], onDelete: SetNull)' + p2;
});

// Inject tenantId into Lead
code = code.replace(/(model Lead \{[^}]*?)(assignedToId\s+String\?[^}]*?\})/s, (m, p1, p2) => {
  return p1 + 'tenantId          String\n  tenant            Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  ' + p2;
});

// Make tenantId optional for child models
const models = ['Activity', 'AIInsight', 'CommunicationLog', 'Deal', 'Task', 'Sequence', 'SequenceEnrollment', 'Workflow', 'WorkflowExecution'];
for (const model of models) {
  code = code.replace(new RegExp('(model ' + model + ' \\{[^}]*?)@@map', 's'), (m, p1) => {
    return p1 + 'tenantId          String?\n  tenant            Tenant?              @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  @@map';
  });
}

// Rename UserSettings to TenantSettings
code = code.replace(/model UserSettings \{/g, 'model TenantSettings {');
code = code.replace(/userSettings      UserSettings\?/g, 'tenantSettings    TenantSettings?');
code = code.replace(/userId            String    @unique/g, 'tenantId          String    @unique');
code = code.replace(/user              User      @relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/g, 'tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)');
code = code.replace(/@@map\("user_settings"\)/g, '@@map("tenant_settings")');

fs.writeFileSync('prisma/schema.prisma', code);
console.log('Done restoring schema');
