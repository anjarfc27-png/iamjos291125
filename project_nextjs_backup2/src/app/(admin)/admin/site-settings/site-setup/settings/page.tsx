import { getSiteSettings, updateSiteSettingsAction, getEnabledJournals } from "../../actions";

export const dynamic = 'force-dynamic';

export default async function SiteSetupSettingsPage() {
  const settings = await getSiteSettings();
  const journals = await getEnabledJournals();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        padding: "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: '#002C40',
          margin: 0
        }}>
          Settings
        </h2>
      </header>

      <form action={async (formData) => {
        "use server";
        await updateSiteSettingsAction(formData);
      }} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '0 1.5rem 2rem 1.5rem'
      }}>
        {/* Site Title */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="title"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Site title <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={settings.title || ""}
            required
            style={{
              maxWidth: '36rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            The title of this installation as it should appear in web browser titles.
          </p>
        </div>

        {/* Redirect Option */}
        {journals.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label
              htmlFor="redirect"
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: '#002C40'
              }}
            >
              Redirect
            </label>
            <select
              id="redirect"
              name="redirect"
              defaultValue={settings.redirect || ""}
              style={{
                maxWidth: '20rem',
                fontSize: "0.875rem",
                padding: "0.5rem 0.75rem",
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'inherit',
                backgroundColor: '#fff'
              }}
            >
              <option value="">No redirect</option>
              {journals.map((journal) => (
                <option key={journal.id} value={journal.id}>
                  {journal.name}
                </option>
              ))}
            </select>
            <p style={{
              fontSize: "0.875rem",
              color: '#666',
              margin: 0
            }}>
              Automatically redirect visitors to the selected journal when they visit the site homepage.
            </p>
          </div>
        )}

        {/* Minimum Password Length */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="minPasswordLength"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Minimum password length <span style={{ color: '#d32f2f' }}>*</span>
          </label>
          <input
            id="minPasswordLength"
            name="minPasswordLength"
            type="number"
            min={6}
            max={64}
            defaultValue={settings.minPasswordLength}
            required
            style={{
              maxWidth: '12rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="submit"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
