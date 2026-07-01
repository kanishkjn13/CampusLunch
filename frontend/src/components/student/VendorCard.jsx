import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const VendorCard = ({ vendor }) => {
  return (
    <Link to={`/vendor/${vendor.id}`}>
      <Card className="h-full flex-col overflow-hidden" style={{ padding: 0 }}>
        <div style={{ position: 'relative', height: '180px', width: '100%' }}>
          <img 
            src={vendor.foodImage} 
            alt={vendor.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))' }}></div>
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
            {vendor.type.map((t, idx) => (
              <Badge key={idx} type={t} className="glass" style={{ border: 'none', padding: '4px 8px' }}>{t}</Badge>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '12px', left: '16px' }}>
             <h3 style={{ fontSize: '1.3rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{vendor.name}</h3>
          </div>
          <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
             <Badge type={vendor.status} style={{ background: vendor.status === 'Available' ? 'var(--status-success)' : 'var(--bg-hover)', color: vendor.status === 'Available' ? '#000' : '#fff', border: 'none' }}>{vendor.status}</Badge>
          </div>
        </div>
        
        <div style={{ padding: '16px' }}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1 text-status-warning bg-secondary" style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
              <Star size={14} fill="currentColor" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{vendor.rating}</span>
            </div>
            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{vendor.reviews} ratings</span>
          </div>
          
          <div className="flex-col gap-2 text-secondary" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{vendor.pickupLocation} ({vendor.vendorLocation})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{vendor.servingTime}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</span>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{vendor.price}<span className="text-secondary" style={{fontSize: '0.85rem', fontWeight: 400}}>/meal</span></div>
            </div>
            {vendor.subscriptionAvailable && (
              <div className="text-right">
                <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly</span>
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>₹{vendor.monthlyPrice}</div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default VendorCard;
