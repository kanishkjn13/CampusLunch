import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'Outfit, sans-serif', color: '#334155', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0b1c30', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>Last Updated: June 2026</p>
      
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>1. Information We Collect</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          We collect account information (email, password), profile details (name, phone number, hostel room address), and transaction records to facilitate the delivery of healthy home-cooked tiffins.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>2. How We Use Your Data</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          Your data is used to process food orders, coordinate deliveries with kitchen partners, verify secure UPI transactions, and improve the quality of our services. We do not sell or lease your personal information to third parties.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>3. Data Security</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          All customer data is processed over secure connections. Payment details are encrypted and transmitted directly through Unified Payments Interface (UPI) banking applications.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>4. Cookies</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
          We use functional cookies to remember your active login session state, selected tiffin filter preferences, and shopping cart items.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
