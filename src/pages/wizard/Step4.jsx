import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 4 – Testing & Validation
//
// Presents test categories (firewall, network, wireless, security) and
// allows starting, resetting or retrying tests.  Test statuses are
// persisted through the service.  A failure note prompts the user
// to restart a specific test.

export default function Step4() {
  const [tests, setTests] = useState(null);
  const [failureNote, setFailureNote] = useState(null);

  // Colour classes for statuses
  const statusColors = {
    Passed: 'bg-green-100 text-green-800',
    Running: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-blue-100 text-blue-800',
    Failed: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setTests({
          'Firewall Tests': data.firewallTests,
          'Network Tests': data.networkTests,
          'Wireless Tests': data.wirelessTests,
          'Security Tests': data.securityTests,
        });
        setFailureNote(data.testFailureNote);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Start a test and refresh local state
  const handleStart = (categoryKey, testName) => {
    const serviceKey = categoryKey.toLowerCase().replace(/ /g, '').replace('tests', 'Tests');
    orderWizardService.startTest(serviceKey, testName);
    const updated = orderWizardService.getCurrentOrder();
    setTests({
      'Firewall Tests': updated.firewallTests,
      'Network Tests': updated.networkTests,
      'Wireless Tests': updated.wirelessTests,
      'Security Tests': updated.securityTests,
    });
  };

  // Reset a test back to Pending
  const handleReset = (categoryKey, testName) => {
    const serviceKey = categoryKey.toLowerCase().replace(/ /g, '').replace('tests', 'Tests');
    orderWizardService.resetTest(serviceKey, testName);
    const updated = orderWizardService.getCurrentOrder();
    setTests({
      'Firewall Tests': updated.firewallTests,
      'Network Tests': updated.networkTests,
      'Wireless Tests': updated.wirelessTests,
      'Security Tests': updated.securityTests,
    });
  };

  if (!tests) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(tests).map(([category, list]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            <div className="space-y-2 text-sm">
              {list.map((test) => (
                <div key={test.test} className="flex items-center justify-between p-2 border rounded">
                  <span>{test.test}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[test.status]}`}>
                      {test.status}
                    </span>
                    {test.status === 'Pending' && (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                        onClick={() => handleStart(category, test.test)}
                      >
                        Start
                      </button>
                    )}
                    {test.status === 'Running' && (
                      <button
                        className="px-3 py-1 bg-yellow-600 text-white rounded"
                        onClick={() => handleReset(category, test.test)}
                      >
                        Reset
                      </button>
                    )}
                    {test.status === 'Failed' && (
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleReset(category, test.test)}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {failureNote && (
        <div className="mt-6 bg-red-50 p-4 border border-red-200 rounded">
          <h4 className="text-red-700 font-semibold">Test Failure Detected</h4>
          <p className="text-sm text-red-700">{failureNote.message}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              // Default action: restart the failed IPS Signatures test
              handleReset('Security Tests', 'IPS Signatures');
              handleStart('Security Tests', 'IPS Signatures');
            }}
          >
            {failureNote.action}
          </button>
        </div>
      )}
    </div>
  );
}