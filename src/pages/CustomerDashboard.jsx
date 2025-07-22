import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerDetailsService from '../services/customerDetailsService';
import dolphinService from '../services/dolphinService';

/*
 * CustomerDashboard with collapsible sidebar and fake pages.
 *
 * Mirrors the navigation of the provisioning wizard: a sidebar
 * grouped into sections (Global, Manage, Analyze, Maintain).  When
 * the overview is selected the customer summary is displayed; all
 * other links show placeholder pages.  Selecting a non‑overview
 * page automatically collapses the sidebar and shows just the
 * initial letters of each link.  A manual toggle allows the user
 * to collapse or expand the sidebar at any time.
 */
export default function CustomerDashboard() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [activeKey, setActiveKey] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [pageData, setPageData] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const detail = await customerDetailsService.getCustomerDetail(id);
      if (mounted) setData(detail);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Nav configuration
  const navSections = [
    { title: 'Global', items: [{ key: 'overview', label: 'Overview' }] },
    {
      title: 'Manage',
      items: [
        { key: 'guests', label: 'Guests' },
        { key: 'networkServices', label: 'Network Services' },
      ],
    },
    {
      title: 'Analyze',
      items: [
        { key: 'alerts', label: 'Alerts' },
        { key: 'auditTrail', label: 'Audit Trail' },
        { key: 'reports', label: 'Reports' },
      ],
    },
    {
      title: 'Maintain',
      items: [
        { key: 'firmware', label: 'Firmware' },
        { key: 'organization', label: 'Organization' },
      ],
    },
  ];

  function handleNavClick(key) {
    setActiveKey(key);
    if (key !== 'overview') {
      dolphinService.getSection(key).then((items) => setPageData(items));
    }
  }

  function FakePage({ sectionKey }) {
    const label = navSections
      .flatMap((sec) => sec.items)
      .find((item) => item.key === sectionKey)?.label;
    return (
      <div className="p-6 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">{label}</h2>
        {pageData && pageData.length > 0 ? (
          <div className="space-y-2">
            {sectionKey === 'guests' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((g, idx) => (
                    <tr key={idx} className={idx % 2 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1">{g.name}</td>
                      <td className="px-2 py-1">{g.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {sectionKey === 'networkServices' && (
              <ul className="list-disc list-inside text-sm space-y-1">
                {pageData.map((s, idx) => (
                  <li key={idx}>
                    {s.service} – {s.status}
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === 'alerts' && (
              <ul className="space-y-1 text-sm">
                {pageData.map((a, idx) => (
                  <li key={idx} className="border-b pb-1">
                    <span className="font-medium">{a.type}</span>: {a.message} —{' '}
                    <span className="text-xs text-gray-500">{a.time}</span>
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === 'auditTrail' && (
              <ul className="space-y-1 text-sm">
                {pageData.map((e, idx) => (
                  <li key={idx} className="border-b pb-1">
                    <span className="font-medium">{e.user}</span> {e.action} –{' '}
                    <span className="text-xs text-gray-500">{e.time}</span>
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === 'reports' && (
              <ul className="list-disc list-inside text-sm space-y-1">
                {pageData.map((r, idx) => (
                  <li key={idx}>
                    {r.report} – <span className="text-xs text-gray-500">{r.date}</span>
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === 'firmware' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="px-2 py-1">Device</th>
                    <th className="px-2 py-1">Version</th>
                    <th className="px-2 py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((f, idx) => (
                    <tr key={idx} className={idx % 2 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1">{f.device}</td>
                      <td className="px-2 py-1">{f.version}</td>
                      <td className="px-2 py-1">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {sectionKey === 'organization' && (
              <ul className="space-y-1 text-sm">
                {pageData.map((m, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{m.name}</span> – {m.role}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-gray-600">
            No data available for this section.
          </p>
        )}
      </div>
    );
  }

  /**
   * Inline Dolphin Shield logo used in the sidebar.  See Wizard.jsx
   * for details.
   */
  function DolphinLogo() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="h-8 w-8"
        aria-label="Dolphin Shield logo"
      >
        <path
          d="M32 2 L58 12 V34 C58 46 48 58 32 62 C16 58 6 46 6 34 V12 Z"
          fill="currentColor"
        />
        <path
          d="M20 32 Q32 20 44 32 Q38 32 32 26 Q26 32 20 32 Z"
          fill="white"
        />
      </svg>
    );
  }

  // Overview summary component
  function Overview() {
    return (
      <div className="space-y-6">
        {/* Customer title */}
        <h2 className="text-2xl font-semibold mb-2">{data.name}</h2>
        {/* KPI row */}
        {data.kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {data.kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex flex-col items-center p-3 bg-white shadow rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      kpi.indicator === 'green'
                        ? 'bg-green-500'
                        : kpi.indicator === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  ></span>
                  <span className="text-xl font-bold">{kpi.value}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>
        )}
        {/* Account Info and SLA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.accountInfo && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm uppercase text-blue-600">
                Account Information
              </h3>
              <div className="space-y-1 text-sm">
                {Object.entries(data.accountInfo).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-medium capitalize">{key.toLowerCase()}:</span>{' '}
                    {value}
                  </p>
                ))}
              </div>
            </div>
          )}
          {data.sla && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm uppercase text-blue-600">
                Service Level Agreement
              </h3>
              <div className="space-y-1 text-sm">
                {Object.entries(data.sla).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-medium capitalize">{key.toLowerCase()}:</span>{' '}
                    {value}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Infrastructure sections */}
        {data.infrastructure && (
          <div className="space-y-6">
            {data.infrastructure.map((section, idx) => (
              <div key={idx} className="bg-white shadow rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-sm uppercase text-blue-600">
                  {section.sectionTitle}
                </h3>
                <div className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.name}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-gray-500">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 md:mt-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                        {item.meta.map((m, metaIdx) => (
                          <span key={metaIdx} className="flex items-center gap-1">
                            <span className="font-medium">{m.label}:</span> {m.value}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'Online'
                              ? 'bg-green-100 text-green-600'
                              : item.status === 'High CPU'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Back button */}
        <button
          onClick={() => nav('/crm')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to CRM
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
        Loading customer details...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-blue-800 text-white flex flex-col transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-blue-700 flex items-center gap-3">
          <div className="text-white">
            <DolphinLogo />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">Dolphin Shield</h1>
              <p className="text-xs uppercase text-blue-200 whitespace-nowrap">
                Customer: {data.name}
              </p>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="mt-4">
              {!collapsed && (
                <p className="px-4 py-1 text-xs tracking-wide text-blue-300 uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-150 ${
                    activeKey === item.key
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-700'
                  } ${collapsed && 'justify-center'}`}
                >
                  {collapsed ? item.label.charAt(0) : item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-4 border-t border-blue-700 hover:bg-blue-700 flex justify-center"
        >
          {collapsed ? '>' : '<'}
        </button>
      </aside>
      {/* Main content */}
      <div className="flex-1 bg-gray-100 p-6">
        {activeKey === 'overview' ? (
          <Overview />
        ) : (
          <FakePage sectionKey={activeKey} />
        )}
      </div>
    </div>
  );
}