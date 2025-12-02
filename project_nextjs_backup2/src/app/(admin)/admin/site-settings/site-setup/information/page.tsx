import { getSiteInformation, updateSiteInformationAction } from "../../actions";

export const dynamic = 'force-dynamic';

export default async function SiteSetupInformationPage() {
  const initial = await getSiteInformation();

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
          Information
        </h2>
      </header>

      <form action={updateSiteInformationAction} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '0 1.5rem 2rem 1.5rem'
      }}>
        {/* About */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="about"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            About
          </label>
          <textarea
            id="about"
            name="about"
            rows={6}
            defaultValue={initial.about || ""}
            placeholder="Enter information about this installation"
            style={{
              maxWidth: '42rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            A brief description of this installation that will appear on the homepage.
          </p>
        </div>

        {/* Contact Information */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: '#002C40',
            margin: 0
          }}>
            Contact Information
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <label
                htmlFor="contactName"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: '#002C40'
                }}
              >
                Contact name <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                defaultValue={initial.contactName || ""}
                required
                style={{
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
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <label
                htmlFor="contactEmail"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: '#002C40'
                }}
              >
                Contact email <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={initial.contactEmail || ""}
                required
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.75rem",
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>

        {/* Privacy Statement */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="privacyStatement"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Privacy statement
          </label>
          <textarea
            id="privacyStatement"
            name="privacyStatement"
            rows={8}
            defaultValue={initial.privacyStatement || ""}
            placeholder="Enter privacy statement"
            style={{
              maxWidth: '42rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            A statement describing the privacy policy for this installation.
          </p>
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
