import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { getVendorDetails } from "@/services/studentService";

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      setError('');
      try {
        const details = await getVendorDetails(id);
        setVendor(details);
      } catch (err) {
        console.error("Failed to load vendor details:", err);
        setError("Vendor details not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id]);

  const handleOrder = (item) => {
    // Mock order placement client-side
    const newToken = 'T-' + Math.floor(1000 + Math.random() * 9000);
    setToken(newToken);
    setOrderSuccess(true);
  };

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center" style={{ minHeight: '80vh', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--accent-primary)" />
        <span className="text-secondary text-sm">Loading kitchen details...</span>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container flex flex-col items-center justify-center" style={{ minHeight: '80vh', gap: '16px' }}>
        <div style={{ color: '#ef4444', textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error || "Vendor not found."}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/student')}>Back to Home</Button>
      </div>
    );
  }

  const menu = vendor.menu_items || [];
  const isAvailable = vendor.is_active && vendor.is_verified !== false;

  if (orderSuccess) {
    return (
      <div className="container flex items-center justify-center animate-fade-in" style={{ minHeight: '80vh' }}>
        <Card glass className="p-8 text-center" style={{ padding: '40px', maxWidth: '500px' }}>
          <CheckCircle color="var(--status-success)" size={64} className="mx-auto mb-4" style={{ margin: '0 auto 16px' }} />
          <h2 className="mb-2">Order Confirmed!</h2>
          <p className="text-secondary mb-6">Your order from {vendor.full_name} has been placed successfully.</p>
          
          <div className="mb-8 p-4" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span className="text-secondary text-sm uppercase tracking-wider">Token Number</span>
            <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '2px' }}>{token}</div>
            <p className="text-status-warning mt-2" style={{ fontSize: '0.85rem' }}>Show this token at the pickup location</p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" fullWidth onClick={() => navigate('/student')}>Back to Home</Button>
            <Button variant="primary" fullWidth onClick={() => navigate('/student', { state: { activeTab: 'orders' } })}>View Orders</Button>
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
          src={vendor.profile_image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80'} 
          alt={vendor.full_name} 
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
                <h2>{vendor.full_name}</h2>
                <Badge type={isAvailable ? 'Available' : 'Closed'} style={{ background: isAvailable ? 'var(--status-success)' : 'var(--bg-hover)', color: isAvailable ? '#000' : '#fff', border: 'none' }}>
                  {isAvailable ? 'Available' : 'Closed'}
                </Badge>
              </div>
              
              <div className="flex flex-col gap-2 mb-4">
                <Badge type="Veg" className="w-max">Veg Only</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-status-warning mb-6">
                <Star size={20} fill="currentColor" />
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{vendor.rating || '0.0'}</span>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>(Verified)</span>
              </div>
              
              <div className="flex-col gap-3 text-secondary" style={{ fontSize: '0.95rem' }}>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={18} color="var(--accent-primary)" />
                  <span>Pickup: Campus Delivery Points</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={18} color="var(--accent-primary)" />
                  <span>Contact: {vendor.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} color="var(--status-warning)" />
                  <span>Serving Time: 12:00 PM - 3:00 PM</span>
                </div>
              </div>
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
                        <Badge type={item.food_type}>{item.food_type}</Badge>
                      </div>
                      <p className="text-secondary mb-3" style={{ fontSize: '0.9rem' }}>{item.description}</p>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{item.price}</div>
                    </div>
                    <div className="w-full md:w-auto md:ml-5">
                      <Button 
                        variant={item.is_available ? 'primary' : 'secondary'} 
                        disabled={!item.is_available || !isAvailable}
                        onClick={() => handleOrder(item)}
                        fullWidth
                      >
                        {item.is_available && isAvailable ? 'Pre-book' : 'Sold Out'}
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
