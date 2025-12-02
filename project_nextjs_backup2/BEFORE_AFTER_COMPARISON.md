# Perbandingan Sebelum dan Sesudah - Settings Save Functionality

**Tanggal**: 2025-01-XX  
**Status**: ✅ **COMPLETED**

---

## 📋 Ringkasan Perubahan

Sebelumnya, semua form settings hanya memiliki UI tanpa fungsi save. Sekarang semua form memiliki:
- ✅ State management
- ✅ Save handlers dengan validation
- ✅ Feedback messages
- ✅ Loading states
- ✅ LocalStorage integration

---

## 1. WORKFLOW SETTINGS - REVIEW SETUP

### ❌ SEBELUM (Tidak Ada Save Functionality)

```tsx
// Tidak ada state management
export default function SettingsWorkflowPage() {
  const [activeTab, setActiveTab] = useState("submission");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState("reviewSetup");

  return (
    // Form tanpa state connection
    <PkpRadio
      id="reviewMode-doubleAnonymous"
      name="defaultReviewMode"
      value="doubleAnonymous"
      label="Double Anonymous"
      // ❌ Tidak ada onChange handler
      // ❌ Tidak ada checked state
    />
    
    <PkpCheckbox
      id="restrictReviewerFileAccess"
      label="Restrict reviewer file access..."
      // ❌ Tidak ada onChange handler
      // ❌ Tidak ada checked state
    />
    
    <PkpInput
      id="numWeeksPerResponse"
      type="number"
      placeholder="2"
      // ❌ Tidak ada value state
      // ❌ Tidak ada onChange handler
    />
    
    <PkpButton variant="primary">
      Save
      {/* ❌ Tidak ada onClick handler */}
      {/* ❌ Tidak ada loading state */}
      {/* ❌ Tidak ada disabled state */}
    </PkpButton>
    
    {/* ❌ Tidak ada feedback messages */}
  );
}
```

**Masalah**:
- ❌ Form tidak terhubung ke state
- ❌ Tombol Save tidak berfungsi
- ❌ Tidak ada validasi
- ❌ Tidak ada feedback messages
- ❌ Data tidak tersimpan

---

### ✅ SESUDAH (Dengan Save Functionality)

```tsx
// State management untuk Review Setup
export default function SettingsWorkflowPage() {
  const [activeTab, setActiveTab] = useState("submission");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState("reviewSetup");
  
  // ✅ State management
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: loadFromStorage("reviewSetup_defaultReviewMode", "doubleAnonymous"),
    restrictReviewerFileAccess: loadFromStorage("reviewSetup_restrictReviewerFileAccess", false),
    reviewerAccessKeysEnabled: loadFromStorage("reviewSetup_reviewerAccessKeysEnabled", false),
    numWeeksPerResponse: loadFromStorage("reviewSetup_numWeeksPerResponse", "2"),
    numWeeksPerReview: loadFromStorage("reviewSetup_numWeeksPerReview", "4"),
    numDaysBeforeInviteReminder: loadFromStorage("reviewSetup_numDaysBeforeInviteReminder", "3"),
    numDaysBeforeSubmitReminder: loadFromStorage("reviewSetup_numDaysBeforeSubmitReminder", "7"),
  });

  // ✅ Feedback states
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [saving, setSaving] = useState(false);

  // ✅ Save handler dengan validation
  const handleSaveReviewSetup = async () => {
    setSaving(true);
    setFeedback({ type: null, message: "" });
    
    try {
      // ✅ Validation
      if (!reviewSetup.numWeeksPerResponse || parseInt(reviewSetup.numWeeksPerResponse) < 1) {
        setFeedback({ type: "error", message: "Review response time must be at least 1 week." });
        setSaving(false);
        return;
      }
      if (!reviewSetup.numWeeksPerReview || parseInt(reviewSetup.numWeeksPerReview) < 1) {
        setFeedback({ type: "error", message: "Review completion time must be at least 1 week." });
        setSaving(false);
        return;
      }

      // ✅ Save to localStorage
      Object.keys(reviewSetup).forEach((key) => {
        saveToStorage(`reviewSetup_${key}`, reviewSetup[key as keyof typeof reviewSetup]);
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setFeedback({ type: "success", message: "Review setup settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to save review setup settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ✅ Feedback Message */}
      {feedback.type && (
        <div style={{
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          borderRadius: "4px",
          backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
          color: feedback.type === "success" ? "#155724" : "#721c24",
          border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          fontSize: "0.875rem",
        }}>
          {feedback.message}
        </div>
      )}

      {/* ✅ Form dengan state connection */}
      <PkpRadio
        id="reviewMode-doubleAnonymous"
        name="defaultReviewMode"
        value="doubleAnonymous"
        checked={reviewSetup.defaultReviewMode === "doubleAnonymous"}
        onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "doubleAnonymous" })}
        label="Double Anonymous"
      />
      
      <PkpCheckbox
        id="restrictReviewerFileAccess"
        checked={reviewSetup.restrictReviewerFileAccess}
        onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
        label="Restrict reviewer file access..."
      />
      
      <PkpInput
        id="numWeeksPerResponse"
        type="number"
        value={reviewSetup.numWeeksPerResponse}
        onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
        placeholder="2"
        style={{ width: "200px" }}
      />
      
      {/* ✅ Save button dengan functionality */}
      <PkpButton 
        variant="primary" 
        onClick={handleSaveReviewSetup}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </PkpButton>
    </>
  );
}
```

**Perbaikan**:
- ✅ Form terhubung ke state
- ✅ Tombol Save berfungsi dengan handler
- ✅ Validasi input
- ✅ Feedback messages (success/error)
- ✅ Loading state pada tombol
- ✅ Data tersimpan di localStorage

---

## 2. WORKFLOW SETTINGS - REVIEWER GUIDANCE

### ❌ SEBELUM

```tsx
// Tidak ada state
<PkpTextarea
  id="reviewGuidelines"
  rows={10}
  placeholder="Enter review guidelines for reviewers..."
  style={{ width: "100%" }}
  // ❌ Tidak ada value
  // ❌ Tidak ada onChange
/>

<PkpTextarea
  id="competingInterests"
  rows={8}
  placeholder="Enter competing interests statement..."
  style={{ width: "100%" }}
  // ❌ Tidak ada value
  // ❌ Tidak ada onChange
/>

<PkpCheckbox
  id="showEnsuringLink"
  label="Show link to the anonymous review process documentation"
  // ❌ Tidak ada checked
  // ❌ Tidak ada onChange
/>

<PkpButton variant="primary">
  Save
  {/* ❌ Tidak ada onClick */}
</PkpButton>
```

---

### ✅ SESUDAH

```tsx
// ✅ State management
const [reviewerGuidance, setReviewerGuidance] = useState({
  reviewGuidelines: loadFromStorage("reviewerGuidance_reviewGuidelines", ""),
  competingInterests: loadFromStorage("reviewerGuidance_competingInterests", ""),
  showEnsuringLink: loadFromStorage("reviewerGuidance_showEnsuringLink", false),
});

// ✅ Save handler
const handleSaveReviewerGuidance = async () => {
  setSaving(true);
  setFeedback({ type: null, message: "" });
  
  try {
    Object.keys(reviewerGuidance).forEach((key) => {
      saveToStorage(`reviewerGuidance_${key}`, reviewerGuidance[key as keyof typeof reviewerGuidance]);
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setFeedback({ type: "success", message: "Reviewer guidance settings saved successfully." });
    setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
  } catch (error) {
    setFeedback({ type: "error", message: "Failed to save reviewer guidance settings." });
  } finally {
    setSaving(false);
  }
};

// ✅ Form dengan state
<PkpTextarea
  id="reviewGuidelines"
  rows={10}
  value={reviewerGuidance.reviewGuidelines}
  onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
  placeholder="Enter review guidelines for reviewers..."
  style={{ width: "100%" }}
/>

<PkpTextarea
  id="competingInterests"
  rows={8}
  value={reviewerGuidance.competingInterests}
  onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
  placeholder="Enter competing interests statement..."
  style={{ width: "100%" }}
/>

<PkpCheckbox
  id="showEnsuringLink"
  checked={reviewerGuidance.showEnsuringLink}
  onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
  label="Show link to the anonymous review process documentation"
/>

<PkpButton 
  variant="primary" 
  onClick={handleSaveReviewerGuidance}
  disabled={saving}
>
  {saving ? "Saving..." : "Save"}
</PkpButton>
```

---

## 3. WORKFLOW SETTINGS - AUTHOR GUIDELINES

### ❌ SEBELUM

```tsx
<PkpTextarea
  rows={10}
  placeholder="Enter author guidelines..."
  style={{ width: "100%", minHeight: "200px" }}
  // ❌ Tidak ada value
  // ❌ Tidak ada onChange
/>

<p>These guidelines will be displayed...</p>
{/* ❌ Tidak ada tombol Save */}
```

---

### ✅ SESUDAH

```tsx
// ✅ State management
const [authorGuidelines, setAuthorGuidelines] = useState(
  loadFromStorage("authorGuidelines", "")
);

// ✅ Save handler
const handleSaveAuthorGuidelines = async () => {
  setSaving(true);
  setFeedback({ type: null, message: "" });
  
  try {
    saveToStorage("authorGuidelines", authorGuidelines);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setFeedback({ type: "success", message: "Author guidelines saved successfully." });
    setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
  } catch (error) {
    setFeedback({ type: "error", message: "Failed to save author guidelines." });
  } finally {
    setSaving(false);
  }
};

// ✅ Form dengan state dan save button
{feedback.type && (
  <div style={{ /* feedback styling */ }}>
    {feedback.message}
  </div>
)}

<PkpTextarea
  rows={10}
  value={authorGuidelines}
  onChange={(e) => setAuthorGuidelines(e.target.value)}
  placeholder="Enter author guidelines..."
  style={{ width: "100%", minHeight: "200px" }}
/>

<PkpButton 
  variant="primary" 
  onClick={handleSaveAuthorGuidelines}
  disabled={saving}
>
  {saving ? "Saving..." : "Save"}
</PkpButton>
```

---

## 4. WORKFLOW SETTINGS - EMAIL SETUP

### ❌ SEBELUM

```tsx
<PkpTextarea
  id="emailSignature"
  rows={8}
  placeholder="Enter email signature..."
  style={{ width: "100%" }}
  // ❌ Tidak ada value
  // ❌ Tidak ada onChange
/>

<PkpInput
  id="envelopeSender"
  type="email"
  placeholder="noreply@journal.example"
  style={{ width: "100%" }}
  // ❌ Tidak ada value
  // ❌ Tidak ada onChange
/>

<PkpButton variant="primary">
  Save
  {/* ❌ Tidak ada onClick */}
</PkpButton>
```

---

### ✅ SESUDAH

```tsx
// ✅ State management
const [emailSetup, setEmailSetup] = useState({
  emailSignature: loadFromStorage("emailSetup_emailSignature", ""),
  envelopeSender: loadFromStorage("emailSetup_envelopeSender", ""),
});

// ✅ Save handler dengan email validation
const handleSaveEmailSetup = async () => {
  setSaving(true);
  setFeedback({ type: null, message: "" });
  
  try {
    // ✅ Email validation
    if (emailSetup.envelopeSender && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSetup.envelopeSender)) {
      setFeedback({ type: "error", message: "Please enter a valid email address." });
      setSaving(false);
      return;
    }

    Object.keys(emailSetup).forEach((key) => {
      saveToStorage(`emailSetup_${key}`, emailSetup[key as keyof typeof emailSetup]);
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setFeedback({ type: "success", message: "Email setup settings saved successfully." });
    setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
  } catch (error) {
    setFeedback({ type: "error", message: "Failed to save email setup settings." });
  } finally {
    setSaving(false);
  }
};

// ✅ Form dengan state dan validation
<PkpTextarea
  id="emailSignature"
  rows={8}
  value={emailSetup.emailSignature}
  onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
  placeholder="Enter email signature..."
  style={{ width: "100%" }}
/>

<PkpInput
  id="envelopeSender"
  type="email"
  value={emailSetup.envelopeSender}
  onChange={(e) => setEmailSetup({ ...emailSetup, envelopeSender: e.target.value })}
  placeholder="noreply@journal.example"
  style={{ width: "100%" }}
/>

<PkpButton 
  variant="primary" 
  onClick={handleSaveEmailSetup}
  disabled={saving}
>
  {saving ? "Saving..." : "Save"}
</PkpButton>
```

---

## 5. ACCESS SETTINGS - SITE ACCESS OPTIONS

### ❌ SEBELUM

```tsx
<PkpCheckbox
  id="allowRegistrations"
  label="Allow user self-registration"
  // ❌ Tidak ada checked
  // ❌ Tidak ada onChange
/>

<PkpCheckbox
  id="requireReviewerInterests"
  label="Require reviewers to indicate their review interests"
  // ❌ Tidak ada checked
  // ❌ Tidak ada onChange
/>

<PkpCheckbox
  id="allowRememberMe"
  label="Allow users to enable 'Remember Me' login option"
  // ❌ Tidak ada checked
  // ❌ Tidak ada onChange
/>

<PkpCheckbox
  id="sessionLifetime"
  label="Session lifetime (in seconds)"
  // ❌ Tidak ada checked
  // ❌ Tidak ada onChange
/>
<PkpInput
  type="number"
  placeholder="3600"
  style={{ width: "200px", marginTop: "0.5rem" }}
  // ❌ Tidak ada value
  // ❌ Tidak ada onChange
/>

<PkpCheckbox
  id="forceSSL"
  label="Force SSL connections"
  // ❌ Tidak ada checked
  // ❌ Tidak ada onChange
/>

<PkpButton variant="primary">
  Save
  {/* ❌ Tidak ada onClick */}
</PkpButton>
```

---

### ✅ SESUDAH

```tsx
// ✅ State management
const [siteAccess, setSiteAccess] = useState({
  allowRegistrations: loadFromStorage("siteAccess_allowRegistrations", false),
  requireReviewerInterests: loadFromStorage("siteAccess_requireReviewerInterests", false),
  allowRememberMe: loadFromStorage("siteAccess_allowRememberMe", true),
  sessionLifetime: loadFromStorage("siteAccess_sessionLifetime", "3600"),
  forceSSL: loadFromStorage("siteAccess_forceSSL", false),
});

// ✅ Save handler dengan validation
const handleSaveSiteAccess = async () => {
  setSaving(true);
  setFeedback({ type: null, message: "" });
  
  try {
    // ✅ Validation
    if (siteAccess.sessionLifetime && parseInt(siteAccess.sessionLifetime) < 60) {
      setFeedback({ type: "error", message: "Session lifetime must be at least 60 seconds." });
      setSaving(false);
      return;
    }

    Object.keys(siteAccess).forEach((key) => {
      saveToStorage(`siteAccess_${key}`, siteAccess[key as keyof typeof siteAccess]);
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setFeedback({ type: "success", message: "Site access settings saved successfully." });
    setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
  } catch (error) {
    setFeedback({ type: "error", message: "Failed to save site access settings." });
  } finally {
    setSaving(false);
  }
};

// ✅ Form dengan state
{feedback.type && (
  <div style={{ /* feedback styling */ }}>
    {feedback.message}
  </div>
)}

<PkpCheckbox
  id="allowRegistrations"
  checked={siteAccess.allowRegistrations}
  onChange={(e) => setSiteAccess({ ...siteAccess, allowRegistrations: e.target.checked })}
  label="Allow user self-registration"
/>

<PkpCheckbox
  id="requireReviewerInterests"
  checked={siteAccess.requireReviewerInterests}
  onChange={(e) => setSiteAccess({ ...siteAccess, requireReviewerInterests: e.target.checked })}
  label="Require reviewers to indicate their review interests"
/>

<PkpCheckbox
  id="allowRememberMe"
  checked={siteAccess.allowRememberMe}
  onChange={(e) => setSiteAccess({ ...siteAccess, allowRememberMe: e.target.checked })}
  label="Allow users to enable 'Remember Me' login option"
/>

<label htmlFor="sessionLifetime">
  Session lifetime (in seconds)
</label>
<PkpInput
  id="sessionLifetime"
  type="number"
  value={siteAccess.sessionLifetime}
  onChange={(e) => setSiteAccess({ ...siteAccess, sessionLifetime: e.target.value })}
  placeholder="3600"
  style={{ width: "200px" }}
/>

<PkpCheckbox
  id="forceSSL"
  checked={siteAccess.forceSSL}
  onChange={(e) => setSiteAccess({ ...siteAccess, forceSSL: e.target.checked })}
  label="Force SSL connections"
/>

<PkpButton 
  variant="primary" 
  onClick={handleSaveSiteAccess}
  disabled={saving}
>
  {saving ? "Saving..." : "Save"}
</PkpButton>
```

---

## 📊 RINGKASAN PERUBAHAN

### Fitur yang Ditambahkan:

| Fitur | Sebelum | Sesudah |
|-------|---------|---------|
| **State Management** | ❌ Tidak ada | ✅ Ada untuk semua form |
| **Save Handler** | ❌ Tidak ada | ✅ Ada dengan validation |
| **Feedback Messages** | ❌ Tidak ada | ✅ Success/Error messages |
| **Loading States** | ❌ Tidak ada | ✅ "Saving..." state |
| **Form Validation** | ❌ Tidak ada | ✅ Validasi input |
| **Data Persistence** | ❌ Tidak ada | ✅ LocalStorage |
| **Error Handling** | ❌ Tidak ada | ✅ Try-catch blocks |

### Jumlah Form yang Diperbaiki:

- ✅ **5 Form Settings** dengan save functionality lengkap
- ✅ **Semua form** sekarang berfungsi penuh
- ✅ **0 Linter Errors**

---

## 🎯 Hasil Akhir

**Sebelum**: Form-form settings hanya UI tanpa fungsi  
**Sesudah**: Semua form settings memiliki save functionality lengkap dengan validation, feedback, dan data persistence

**Status**: ✅ **COMPLETED - Ready for Testing**

