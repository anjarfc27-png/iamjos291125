import os from "os";
import Link from "next/link";

export default function NodeJSInfoPage() {
  const nodeVersion = process.version;
  const osInfo = `${os.type()} ${os.release()}`;
  const platform = os.platform();
  const arch = os.arch();
  const totalMemory = `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`;
  const freeMemory = `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`;
  const cpuCount = os.cpus().length;
  const cpuModel = os.cpus()[0]?.model || 'Unknown';
  const uptime = `${Math.round(os.uptime() / 3600)} hours`;
  const hostname = os.hostname();
  const homeDir = os.homedir();
  const tmpDir = os.tmpdir();

  // Node.js Environment Variables (filter sensitive ones)
  const nodeEnvVars = Object.entries(process.env)
    .filter(([key]) => !key.includes('PASSWORD') && !key.includes('SECRET') && !key.includes('KEY'))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar - Light Gray */}
      <div className="bg-gray-200 px-6 py-4" style={{
        backgroundColor: '#e5e5e5',
        padding: '1rem 1.5rem'
      }}>
        {/* Breadcrumb */}
        <div className="mb-2" style={{ marginBottom: '0.5rem' }}>
          <Link 
            href="/admin" 
            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '1rem'
            }}
            className="hover:no-underline"
          >
            Site Administration
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '1rem'
          }}>»</span>
          <Link 
            href="/admin/system/system-information" 
            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '1rem'
            }}
            className="hover:no-underline"
          >
            System Information
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '1rem'
          }}>»</span>
          <span style={{ 
            color: '#111827',
            fontSize: '1rem'
          }}>
            Extended Node.js Information
          </span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900" style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          Extended Node.js Information
        </h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6" style={{
        padding: '2rem 1.5rem'
      }}>
        <div className="space-y-6">
          {/* Node.js Version Information */}
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900" style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Node.js Version Information
            </h2>
            <dl className="grid gap-4 text-sm">
              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3">
                <dt className="font-semibold text-gray-900">Node.js Version</dt>
                <dd className="text-gray-600">{nodeVersion}</dd>
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3">
                <dt className="font-semibold text-gray-900">NPM Version</dt>
                <dd className="text-gray-600">{process.env.npm_version || 'N/A'}</dd>
              </div>
            </dl>
          </section>

          {/* Server Information */}
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900" style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Server Information
            </h2>
            <dl className="grid gap-3 text-sm">
              <Row label="Operating System" value={osInfo} />
              <Row label="Platform" value={platform} />
              <Row label="Architecture" value={arch} />
              <Row label="Hostname" value={hostname} />
              <Row label="CPU Model" value={cpuModel} />
              <Row label="CPU Cores" value={cpuCount.toString()} />
              <Row label="Total Memory" value={totalMemory} />
              <Row label="Free Memory" value={freeMemory} />
              <Row label="Uptime" value={uptime} />
              <Row label="Home Directory" value={homeDir} />
              <Row label="Temp Directory" value={tmpDir} />
            </dl>
          </section>

          {/* Environment Variables */}
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900" style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Environment Variables
            </h2>
            <div className="rounded-md border border-gray-200 bg-white p-4" style={{
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              padding: '1rem'
            }}>
              <table className="w-full text-sm" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-semibold text-gray-900" style={{
                      padding: '0.5rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600'
                    }}>
                      Variable
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900" style={{
                      padding: '0.5rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600'
                    }}>
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {nodeEnvVars.slice(0, 50).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-2 font-semibold text-gray-900" style={{
                        padding: '0.5rem 1rem'
                      }}>
                        {key}
                      </td>
                      <td className="px-4 py-2 text-gray-600 break-all" style={{
                        padding: '0.5rem 1rem',
                        wordBreak: 'break-all'
                      }}>
                        {value || '(empty)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {nodeEnvVars.length > 50 && (
                <p className="mt-4 text-sm text-gray-600" style={{
                  marginTop: '1rem',
                  fontSize: '0.875rem'
                }}>
                  Showing first 50 of {nodeEnvVars.length} environment variables
                </p>
              )}
            </div>
          </section>

          {/* Back Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <Link
              href="/admin/system/system-information"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                color: '#006798',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Back to System Information
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3">
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}

