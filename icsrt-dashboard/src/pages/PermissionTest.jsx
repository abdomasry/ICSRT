import React from 'react';
import { useAuth } from '../context/AuthContext';

const PermissionTest = () => {
  const { user, hasPermission } = useAuth();

  const testSections = [
    'dashboard', 'admins', 'users', 'papers', 'services', 
    'events', 'testimonials', 'faq', 'contacts', 'registrations',
    'service-orders', 'newsletter-subscribers', 'about', 'mission', 'vision'
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Permission Test Page</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current User Info:</h3>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Permission Test Results:</h3>
        <div className="grid grid-cols-2 gap-4">
          {testSections.map(section => {
            const hasView = hasPermission(section, 'view');
            const hasCreate = hasPermission(section, 'create');
            const hasEdit = hasPermission(section, 'edit');
            const hasDelete = hasPermission(section, 'delete');
            
            return (
              <div key={section} className="border rounded p-3">
                <h4 className="font-semibold capitalize mb-2">{section}</h4>
                <div className="text-sm space-y-1">
                  <div className={`flex items-center ${hasView ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    View: {hasView ? 'Yes' : 'No'}
                  </div>
                  <div className={`flex items-center ${hasCreate ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    Create: {hasCreate ? 'Yes' : 'No'}
                  </div>
                  <div className={`flex items-center ${hasEdit ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    Edit: {hasEdit ? 'Yes' : 'No'}
                  </div>
                  <div className={`flex items-center ${hasDelete ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    Delete: {hasDelete ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PermissionTest;
