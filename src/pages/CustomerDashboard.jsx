
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerDetailsService from '../services/customerDetailsService';
import Tile from '../components/ui/Tile';
import SectionTabs from '../components/ui/SectionTabs';
import DeviceCard from '../components/ui/DeviceCard';

export default function CustomerDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    customerDetailsService
      .getById(id)
      .then(setDetails)
      .catch(() => setDetails(undefined));
  }, [id]);

  if (details === undefined) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-2">Customer not found</h1>
        <button
          onClick={() => navigate('/crm')}
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (!details) return <div className="p-8">Loading…</div>;

  const { kpis, accountInfo, sla, infrastructure } = details;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">{details.name}</h1>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Tile key={kpi.label} label={kpi.label} value={kpi.value} indicator={kpi.indicator} />
        ))}
      </div>

      {/* Account / SLA */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded shadow-sm">
          <div className="bg-gray-100 px-4 py-2 font-semibold">Account Information</div>
          <div className="p-4 space-y-2 text-sm">
            {Object.entries(accountInfo).map(([label, value]) => (
              <div key={label} className="flex">
                <span className="w-40 font-medium uppercase">{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded shadow-sm">
          <div className="bg-gray-100 px-4 py-2 font-semibold">Service Level Agreement</div>
          <div className="p-4 space-y-2 text-sm">
            {Object.entries(sla).map(([label, value]) => (
              <div key={label} className="flex">
                <span className="w-40 font-medium uppercase">{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTabs
        tabs={['Infrastructure', 'Performance', 'Security', 'Licenses', 'Support']}
        initial="Infrastructure"
      >
        {/* Infrastructure tab content */}
        <div className="grid md:grid-cols-2 gap-4">
          {infrastructure.map((section) => (
            <div key={section.sectionTitle} className="space-y-3">
              <h3 className="font-semibold">{section.sectionTitle}</h3>
              {section.items.map((item) => (
                <DeviceCard key={item.name} item={item} />
              ))}
            </div>
          ))}
        </div>
      </SectionTabs>
    </div>
  );
}
