# Design Document Part 2: UI Components & Workflow

## Error Handling

### Error Types

```typescript
// src/lib/errors.ts
class OJSError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

class ValidationError extends OJSError {
  fields: Record<string, string[]>;
}

class PermissionError extends OJSError {
  requiredRole: string;
}

class NotFoundError extends OJSError {
  resource: string;
  id: string;
}
```

### Error Handling Strategy

1. **Server Actions**: Return `{ success: boolean, error?: string, data?: T }`
2. **API Routes**: Use standard HTTP status codes
3. **Frontend**: Display errors using toast notifications (sonner)
4. **Validation**: Show inline field errors + summary at top

## Testing Strategy

### Unit Tests

```typescript
// src/features/admin/journals/__tests__/actions.test.ts
describe('createJournal', () => {
  it('should create journal with valid data', async () => {
    const data = {
      path: 'test-journal',
      name: { en_US: 'Test Journal' },
      primary_locale: 'en_US'
    };
    const result = await createJournal(data);
    expect(result.path).toBe('test-journal');
  });
  
  it('should reject duplicate path', async () => {
    await expect(createJournal({ path: 'existing' }))
      .rejects.toThrow(ValidationError);
  });
});
```

### Integration Tests

```typescript
// src/features/admin/__tests__/journal-wizard.integration.test.ts
describe('Journal Creation Wizard', () => {
  it('should complete full wizard flow', async () => {
    // Step 1: Basic info
    await fillBasicInfo({ name: 'Test', path: 'test' });
    await clickNext();
    
    // Step 2: Theme
    await selectTheme('default');
    await clickNext();
    
    // Step 3: Indexing
    await fillIndexing({ enable_oai: true });
    await clickFinish();
    
    // Verify journal created
    const journal = await getJournal('test');
    expect(journal).toBeDefined();
  });
});
```

### Property-Based Tests

```typescript
// Property 1: Path validation
// For any journal path, it should only contain lowercase letters, numbers, dash, underscore
test('journal path validation', () => {
  fc.assert(
    fc.property(fc.string(), (path) => {
      const isValid = /^[a-z0-9-_]+$/.test(path);
      const result = validateJournalPath(path);
      return result.valid === isValid;
    })
  );
});

// Property 2: Settings round-trip
// For any journal settings, saving then loading should return same values
test('settings round-trip', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        name: fc.string(),
        description: fc.string(),
        enabled: fc.boolean()
      }),
      async (settings) => {
        await saveJournalSettings(journalId, settings);
        const loaded = await loadJournalSettings(journalId);
        return deepEqual(settings, loaded);
      }
    )
  );
});
```

## UI Component Library

### PKP Component System

Semua komponen harus match dengan OJS 3.3 styling:

```typescript
// src/components/ui/pkp-button.tsx
interface PkpButtonProps {
  variant: 'primary' | 'secondary' | 'negative' | 'default';
  size: 'small' | 'medium' | 'large';
  isWorking?: boolean;
  children: React.ReactNode;
}

// Styling harus match OJS:
// - Primary: #1E6292 (PKP blue)
// - Hover: #003B5C
// - Border radius: 3px
// - Padding: 8px 16px
// - Font: 14px "Noto Sans"
```

### PKP Table Component

```typescript
// src/components/ui/pkp-table.tsx
interface PkpTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  pagination?: PaginationConfig;
  actions?: RowAction<T>[];
}

// Features yang harus ada:
// - Sortable columns
// - Filterable columns
// - Row selection
// - Inline editing
// - Bulk actions
// - Pagination
// - Loading states
```

### PKP Form Components

```typescript
// src/components/ui/pkp-input.tsx
interface PkpInputProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  locale?: string; // For localized inputs
  // ... standard input props
}

// src/components/ui/pkp-select.tsx
interface PkpSelectProps {
  label: string;
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  // ... standard select props
}

// src/components/ui/pkp-textarea.tsx
// src/components/ui/pkp-checkbox.tsx
// src/components/ui/pkp-radio.tsx
// src/components/ui/pkp-file-upload.tsx
```

### PKP Modal System

```typescript
// src/components/ui/pkp-modal.tsx
interface PkpModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Modal harus support:
// - Backdrop click to close
// - ESC key to close
// - Focus trap
// - Scroll lock
// - Nested modals
```

## Workflow Implementation

### Journal Creation Workflow

```typescript
// src/features/admin/journals/wizard/wizard-flow.ts
const JOURNAL_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'basic-info',
    title: 'Journal Information',
    component: BasicInfoStep,
    validate: validateBasicInfo
  },
  {
    id: 'theme',
    title: 'Theme & Appearance',
    component: ThemeStep,
    validate: validateTheme
  },
  {
    id: 'indexing',
    title: 'Search Indexing',
    component: IndexingStep,
    validate: validateIndexing
  },
  {
    id: 'users',
    title: 'Initial Users',
    component: UsersStep,
    validate: validateUsers
  }
];

// Wizard state management
interface WizardState {
  currentStep: number;
  data: Partial<JournalWizardData>;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
}

// Wizard actions
async function nextStep(state: WizardState): Promise<WizardState>
async function previousStep(state: WizardState): Promise<WizardState>
async function saveAndExit(state: WizardState): Promise<void>
async function completeWizard(state: WizardState): Promise<Journal>
```

### Settings Management Workflow

```typescript
// src/features/admin/settings/settings-flow.ts

// 1. Load settings from database
async function loadSettings(section: string): Promise<any> {
  const settings = await db
    .from('site_settings')
    .select('*')
    .eq('section', section);
  return deserializeSettings(settings);
}

// 2. User edits in form
// 3. Validate on blur and on submit

// 4. Save settings
async function saveSettings(section: string, data: any): Promise<void> {
  const serialized = serializeSettings(data);
  await db.from('site_settings').upsert(serialized);
  await clearCache(`settings:${section}`);
  await reloadConfig();
}

// 5. Show success message
// 6. Optionally reload page if needed
```

### User Management Workflow

```typescript
// src/features/admin/users/user-management-flow.ts

// Create User Flow
async function createUserFlow(data: CreateUserInput): Promise<AdminUser> {
  // 1. Validate input
  const validated = await validateUserInput(data);
  
  // 2. Check username/email uniqueness
  await checkUniqueness(validated.username, validated.email);
  
  // 3. Hash password
  const hashedPassword = await bcrypt.hash(validated.password, 10);
  
  // 4. Create user record
  const user = await db.from('users').insert({
    ...validated,
    password: hashedPassword
  }).single();
  
  // 5. Create user settings
  await createUserSettings(user.id, validated.settings);
  
  // 6. Send welcome email
  await sendWelcomeEmail(user);
  
  // 7. Log activity
  await logActivity('user.created', { userId: user.id });
  
  return user;
}

// Assign Role Flow
async function assignRoleFlow(
  userId: string,
  journalId: string,
  userGroupId: string
): Promise<void> {
  // 1. Verify user exists
  const user = await getUser(userId);
  
  // 2. Verify journal exists
  const journal = await getJournal(journalId);
  
  // 3. Verify user group exists and belongs to journal
  const userGroup = await getUserGroup(userGroupId);
  if (userGroup.context_id !== journalId) {
    throw new ValidationError('User group does not belong to journal');
  }
  
  // 4. Check if already assigned
  const existing = await db
    .from('user_user_groups')
    .select('*')
    .match({ user_id: userId, user_group_id: userGroupId })
    .single();
  
  if (existing) {
    throw new ValidationError('User already has this role');
  }
  
  // 5. Create assignment
  await db.from('user_user_groups').insert({
    user_id: userId,
    user_group_id: userGroupId
  });
  
  // 6. Send notification email
  await sendRoleAssignmentEmail(user, journal, userGroup);
  
  // 7. Log activity
  await logActivity('user.role.assigned', {
    userId,
    journalId,
    userGroupId
  });
}
```

