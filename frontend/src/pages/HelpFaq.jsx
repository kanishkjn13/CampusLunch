import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, BookOpen, CreditCard, Shield } from 'lucide-react';

const HelpFaq = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const categories = [
    { id: 'all', name: 'All FAQs', icon: <HelpCircle size={18} /> },
    { id: 'students', name: 'For Students', icon: <BookOpen size={18} /> },
    { id: 'vendors', name: 'For Vendors', icon: <CreditCard size={18} /> },
    { id: 'safety', name: 'Payments & Safety', icon: <Shield size={18} /> }
  ];

  const faqs = [
    {
      category: 'students',
      question: 'How do I place a tiffin order?',
      answer: 'Simply sign in as a student, browse verified home-chef kitchens in your campus area, select a kitchen, and choose between a pre-book single meal or a recurring subscription plan (weekly/monthly). Complete the payment, and you will get a unique pickup token.'
    },
    {
      category: 'students',
      question: 'Can I skip days or pause my subscription?',
      answer: 'Yes! Our flex plans allow you to skip any delivery day. Just go to your active orders on your student dashboard and tap "Skip Meal" before the daily cutoff time (typically 9:00 AM for lunch, and 5:00 PM for dinner).'
    },
    {
      category: 'students',
      question: 'Where is the pickup location on campus?',
      answer: 'Each kitchen operates specific delivery routes to hostels, academic blocks, and campus landmarks. The exact pickup point is listed on the vendor details page and in your digital order token receipt.'
    },
    {
      category: 'vendors',
      question: 'How do I register as a partner kitchen?',
      answer: 'Go to the Sign Up page, select the "Vendor Partner" role toggle, fill in your details, and optionally add your FSSAI license. Once submitted, our campus operations team will contact you to schedule a hygiene check and audit before onboarding.'
    },
    {
      category: 'vendors',
      question: 'What are the charges for joining as a vendor?',
      answer: 'We charge a minimal transaction fee per order to cover payment processing and delivery management infrastructure. Setting up your vendor profile is completely free!'
    },
    {
      category: 'vendors',
      question: 'How and when do I receive payouts?',
      answer: 'Payouts are computed automatically for all successfully delivered orders. Settlements are transferred weekly directly to your registered bank account every Monday.'
    },
    {
      category: 'safety',
      question: 'Are the partner kitchens clean and hygienic?',
      answer: 'Absolutely. We verify FSSAI registration for all partners and conduct regular, unannounced quality audits and feedback checks on all active kitchens to maintain the highest food safety standards.'
    },
    {
      category: 'safety',
      question: 'How do refunds work for skipped meals?',
      answer: 'When you skip a meal in your subscription package, the credit is immediately refunded to your wallet balance or auto-adjusted in your next monthly renewal cycle.'
    }
  ];

  const toggleFaq = (index) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="faq-page-wrapper animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10 section-header">
          <h2>Help & FAQ</h2>
          <div className="section-header-underline"></div>
        </div>

        {/* Search Bar Container */}
        <div className="faq-search-container mb-10">
          <div className="relative search-input-wrapper">
            <Search className="search-icon-inside text-secondary" size={20} />
            <input
              type="text"
              placeholder="Have a question? Search here..."
              className="faq-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="faq-categories flex gap-3 overflow-x-auto mb-8 pb-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`faq-cat-btn flex items-center gap-2 ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat.id); setOpenFaqIndex(null); }}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Accordion FAQ Grid */}
        <div className="faq-list-container">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className={`faq-item-card ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-question-row flex justify-between items-center">
                    <h4>{faq.question}</h4>
                    <button className="faq-toggle-arrow">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  <div className="faq-answer-collapse">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 faq-empty-state">
              <HelpCircle size={48} className="text-muted mx-auto mb-4" />
              <p className="text-secondary">No questions found matching your search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpFaq;
