# Tabel Tambahan & Helper Tables

## 1.2 Tabel yang Belum Ada di Schema OJS Asli

### Tabel dari 202511170001_ojs_core.sql
| Tabel | Purpose | Status | Catatan |
|-------|---------|--------|---------|
| `site_settings` | Site-wide configuration | ✅ | Wrapper modern untuk site config |
| `site_information` | Site info & contact | ✅ | Simplified site metadata |
| `site_languages` | Installed languages | ✅ | Language management |
| `site_navigation` | Navigation menus | ✅ | Menu builder |
| `site_bulk_emails` | Bulk email config | ✅ | Email management |
| `site_appearance` | Theme & styling | ✅ | Appearance settings |
| `site_plugins` | Plugin management | ✅ | Plugin registry |

### Tabel Legacy/Compatibility
| Tabel | Purpose | Status | Rekomendasi |
|-------|---------|--------|-------------|
| `user_accounts` | Legacy user table | ⚠️ | Migrate ke `users` |
| `user_account_roles` | Site-level roles | ⚠️ | Gunakan untuk site admin only |
| `journal_user_roles` | Old role system | ⚠️ | Migrate ke `user_user_groups` |

## 1.3 Tabel OJS yang Masih Perlu Ditambahkan ❌

### Queries & Discussions
```sql
-- Belum ada di schema
CREATE TABLE queries (
    id UUID PRIMARY KEY,
    assoc_type INTEGER,
    assoc_id UUID,
    stage_id INTEGER,
    seq INTEGER,
    date_posted TIMESTAMPTZ,
    date_modified TIMESTAMPTZ,
    closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE query_participants (
    query_id UUID REFERENCES queries(id),
    user_id UUID REFERENCES users(id),
    PRIMARY KEY (query_id, user_id)
);
```

### Edit Decisions
```sql
-- Perlu ditambahkan untuk tracking keputusan
CREATE TABLE edit_decisions (
    id UUID PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id),
    review_round_id UUID REFERENCES review_rounds(id),
    stage_id INTEGER,
    round INTEGER,
    editor_id UUID REFERENCES users(id),
    decision INTEGER,
    date_decided TIMESTAMPTZ
);
```

### Stage Assignments
```sql
-- Untuk tracking participant assignments
CREATE TABLE stage_assignments (
    id UUID PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id),
    user_group_id UUID REFERENCES user_groups(id),
    user_id UUID REFERENCES users(id),
    date_assigned TIMESTAMPTZ,
    recommend_only BOOLEAN DEFAULT FALSE,
    can_change_metadata BOOLEAN DEFAULT FALSE
);
```

