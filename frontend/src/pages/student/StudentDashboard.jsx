import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '../../components/common/Input';
import VendorCard from '../../components/student/VendorCard';
import { VENDORS } from '../../data/mockData';

const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredVendors = VENDORS.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || vendor.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="container animate-fade-in py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="mb-2" style={{ fontSize: '2rem' }}>Good Morning!</h1>
          <p className="text-secondary">Find your perfect tiffin for today.</p>
        </div>
      </div>

      <div className="mb-6 sticky-filter-bar">
        <div className="relative mb-4">
          <Search className="text-secondary" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} size={20} />
          <input
            type="text"
            className="input-field"
            placeholder="Search for tiffins, vendors, or locations..."
            style={{ paddingLeft: '48px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto" style={{ paddingBottom: '8px' }}>
          {['All', 'Veg', 'Non-Veg', 'Jain', 'Vegan'].map(type => (
            <button
              key={type}
              className="badge"
              style={{ 
                padding: '8px 20px', 
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                background: filterType === type ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <h2 className="mb-6" style={{ fontSize: '1.5rem' }}>Available Vendors</h2>
      
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 glass border-color">
          <p className="text-secondary text-lg">No vendors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
