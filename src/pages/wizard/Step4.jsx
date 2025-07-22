import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 4 – Testing & Validation
//
// Renders test categories with status indicators and start/reset
// actions.  Also displays a failure note when provided by the
// wizard data.  Running and resetting tests updates the wizard
// state through the service.
export default function Step4() {
  const [tests, setTests] = useState(null);
  const [failureNote, setFailureNote] = useState(null);

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

  const updateTests = () => {
    const updated = orderWizardService.getCurrentOrder();
    setTests({
      'Firewall Tests': updated.firewallTests,
      'Network Tests': updated.networkTests,
      'Wireless Tests': updated.wirelessTests,
      'Security Tests': updated.securityTests,
    });
  };

  const runAll = () => {
    Object.entries(tests).forEach(([category, list]) => {
      const serviceKey = category.toLowerCase().replace(/ /g, '').replace('tests', 'Tests');
      list.forEach((t) => {
        orderWizardService.startTest(serviceKey, t.test);
      });
    });
    updateTests();
  };

  const handleStart = (categoryKey, testName) => {
    const serviceKey = categoryKey.toLowerCase().replace(/ /g, '').replace('tests', 'Tests');
    orderWizardService.startTest(serviceKey, testName);
    updateTests();
  };

  const handleReset = (categoryKey, testName) => {
    const serviceKey = categoryKey.toLowerCase().replace(/ /g, '').replace('tests', 'Tests');
    orderWizardService.resetTest(serviceKey, testName);
    updateTests();
  };

  if (!tests) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      {/* Action bar */}
      <div className="flex justify-end gap-2">
        <button
          onClick={runAll}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm hover:bg-blue-700"
        >
          Run All Tests
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded shadow text-sm">
          Test Report
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded shadow text-sm hover:bg-green-700">
          Approve Tests
        </button>
      </div>
      {/* Test categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(tests).map(([category, list]) => (
          <div
            key={category}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            <div className="space-y-2 text-sm">
              {list.map((test) => (
                <div
                  key={test.test}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>{test.test}</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        statusColors[test.status]
                      }`}
                    >
                      {test.status}
                    </span>
                    {test.status === 'Pending' && (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        onClick={() => handleStart(category, test.test)}
                      >
                        Start
                      </button>
                    )}
                    {test.status === 'Running' && (
                      <button
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                        onClick={() => handleReset(category, test.test)}
                      >
                        Reset
                      </button>
                    )}
                    {test.status === 'Failed' && (
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
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
      {/* Failure note */}
      {failureNote && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h4 className="text-red-700 font-semibold mb-1">Test Failure Detected</h4>
          <p className="text-sm text-red-700">{failureNote.message}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
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