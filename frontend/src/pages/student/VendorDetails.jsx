import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { VENDORS, MENU_ITEMS } from '../../data/mockData';

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [token, setToken] = useState('');
  
  const vendor = VENDORS.find(v => v.id === id);
  const menu = MENU_ITEMS[id] || [];

  if (!vendor) return <div className="container mt-6">Vendor not found</div>;

  const handleOrder = (item) => {
    // Mock order placement
    const newToken = 'T-' + Math.floor(1000 + Math.random() * 9000);
    setToken(newToken);
    setOrderSuccess(true);
  };

  if (orderSuccess) {
    return (
      <div className="container flex items-center justify-center animate-fade-in" style={{ minHeight: '80vh' }}>
        <Card glass className="p-8 text-center" style={{ padding: '40px', maxWidth: '500px' }}>
          <CheckCircle color="var(--status-success)" size={64} className="mx-auto mb-4" style={{ margin: '0 auto 16px' }} />
          <h2 className="mb-2">Order Confirmed!</h2>
          <p className="text-secondary mb-6">Your order from {vendor.name} has been placed successfully.</p>
          
          <div className="mb-8 p-4" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span className="text-secondary text-sm uppercase tracking-wider">Token Number</span>
            <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '2px' }}>{token}</div>
            <p className="text-status-warning mt-2" style={{ fontSize: '0.85rem' }}>Show this token at the pickup location</p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" fullWidth onClick={() => navigate('/student')}>Back to Home</Button>
            <Button variant="primary" fullWidth onClick={() => navigate('/student/orders')}>View Orders</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {/* Immersive Full-Width Banner */}
      <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden' }}>
        <img 
          src={vendor.photo} 
          alt={vendor.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'linear-gradient(to bottom, rgba(18,18,18,0.2), rgba(18,18,18,0.95))' 
        }}></div>
        
        {/* Back Button overlay */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center justify-center"
          style={{ 
            position: 'absolute', 
            top: '24px', 
            left: '24px', 
            zIndex: 10, 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'rgba(30, 30, 30, 0.8)', 
            color: '#fff', 
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-color)',
            transition: 'var(--transition-fast)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Main content overlapping the banner */}
      <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10, paddingBottom: '60px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Vendor Details Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="flex justify-between items-start mb-4">
                <h2>{vendor.name}</h2>
                <Badge type={vendor.status} style={{ background: vendor.status === 'Available' ? 'var(--status-success)' : 'var(--bg-hover)', color: vendor.status === 'Available' ? '#000' : '#fff', border: 'none' }}>{vendor.status}</Badge>
              </div>
              
              <div className="flex flex-col gap-2 mb-4">
                {vendor.type.map((t, idx) => (
                  <Badge key={idx} type={t} className="w-max">{t}</Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-status-warning mb-6">
                <Star size={20} fill="currentColor" />
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{vendor.rating}</span>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>({vendor.reviews} reviews)</span>
              </div>
              
              <div className="flex-col gap-3 text-secondary" style={{ fontSize: '0.95rem' }}>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={18} color="var(--accent-primary)" />
                  <span>Pickup: {vendor.pickupLocation}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={18} color="var(--accent-primary)" />
                  <span>Kitchen: {vendor.vendorLocation}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} color="var(--status-warning)" />
                  <span>Serving: {vendor.servingTime}</span>
                </div>
              </div>
              
              {vendor.subscriptionAvailable && (
                <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <h3 className="mb-2" style={{ fontSize: '1.2rem' }}>Monthly Subscription</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-secondary">30 Meals</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-green)' }}>₹{vendor.monthlyPrice}</span>
                  </div>
                  <Button variant="outline" fullWidth>Subscribe Now</Button>
                </div>
              )}
            </Card>
          </div>

          {/* Today's Menu */}
          <div className="md:col-span-2">
            <h2 className="mb-6">Today's Menu</h2>
            {menu.length > 0 ? (
              <div className="flex-col gap-4">
                {menu.map(item => (
                  <Card key={item.id} glass className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div style={{ flex: 1, width: '100%' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                        <Badge type={item.type}>{item.type}</Badge>
                      </div>
                      <p className="text-secondary mb-3" style={{ fontSize: '0.9rem' }}>{item.description}</p>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{item.price}</div>
                    </div>
                    <div className="w-full md:w-auto md:ml-5">
                      <Button 
                        variant={item.isAvailable ? 'primary' : 'secondary'} 
                        disabled={!item.isAvailable || vendor.status === 'Closed'}
                        onClick={() => handleOrder(item)}
                        fullWidth
                      >
                        {item.isAvailable && vendor.status !== 'Closed' ? 'Pre-book' : 'Sold Out'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-secondary">
                No menu items available for today.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
