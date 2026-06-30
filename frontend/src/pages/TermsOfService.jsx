import React from 'react';

const TermsOfService = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'Outfit, sans-serif', color: '#334155', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0b1c30', marginBottom: '8px' }}>Terms of Service</h1>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>Last Updated: June 2026</p>
      
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>1. General Rules</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          By accessing CampusLunch, you agree to comply with our academic guidelines, order schedules, and payment processes.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>2. Ordering and Delivery</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          Tiffins must be ordered before the cutoff slots. Deliveries are made to specified hostels. Once processed, orders cannot be cancelled and refunds are only eligible for verified service faults.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>3. Vendor Responsibilities</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          Kitchen partners are responsible for food quality, portion consistency, and compliance with campus hygiene metrics.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>4. Payments</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          All online checkouts must be paid in full using eligible UPI apps. Transactions are final upon validation.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
