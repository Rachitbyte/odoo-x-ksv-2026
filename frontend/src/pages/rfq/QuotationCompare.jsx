import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import clsx from 'clsx';

const QuotationCompare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    // Mock Fetch
    setTimeout(() => {
      setQuotations([
        { id: 101, vendor_name: "Infra Supplies", vendor_rating: "4.5/5", grand_total: 185000, gst_percent: 18, delivery_days: 10, payment_terms: "30 days" },
        { id: 102, vendor_name: "TechCore LTD", vendor_rating: "4.2/5", grand_total: 200010, gst_percent: 18, delivery_days: 14, payment_terms: "30 days" },
        { id: 103, vendor_name: "Office Need Co.", vendor_rating: "3.8/5", grand_total: 214800, gst_percent: 18, delivery_days: 7, payment_terms: "15 days" }
      ]);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSelectVendor = async (quotationId) => {
    try {
      await api.post(`/approvals/${quotationId}/approve`);
      navigate('/approvals');
    } catch {
      navigate('/approvals');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface rounded w-1/3 mb-8"></div>
        <div className="h-[400px] bg-surface rounded-xl w-full"></div>
      </div>
    );
  }

  // Determine lowest price
  const lowestPrice = Math.min(...quotations.map(q => q.grand_total));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Quotation Comparison</h2>
          <p className="text-sm text-text-secondary">RFQ: office furniture procurement q2 - 3 quotations received</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-xl overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm whitespace-nowrap border-collapse">
            <thead>
              <tr>
                <th className="p-4 font-bold text-text-secondary w-48 border border-border bg-background">
                  Criteria
                </th>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <th key={`head-${quote.id}`} className={clsx(
                      "p-4 border border-border min-w-[200px]",
                      isBest ? "bg-success/20 text-success border-success/50" : "bg-background text-text-primary"
                    )}>
                      {quote.vendor_name} {isBest && "(Lowest)"}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Grand Total Row */}
              <tr>
                <td className="p-4 font-medium text-text-secondary border border-border bg-background">
                  Grand Total
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`total-${quote.id}`} className={clsx(
                      "p-4 border border-border font-mono",
                      isBest ? "bg-success/20 text-success font-bold border-success/50" : "text-text-primary"
                    )}>
                      {quote.grand_total.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
              
              {/* GST % Row */}
              <tr>
                <td className="p-4 font-medium text-text-secondary border border-border bg-background">
                  GST %
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`gst-${quote.id}`} className={clsx(
                      "p-4 border border-border font-mono",
                      isBest ? "bg-success/20 text-success border-success/50" : "text-text-primary"
                    )}>
                      {quote.gst_percent}
                    </td>
                  );
                })}
              </tr>

              {/* Delivery Row */}
              <tr>
                <td className="p-4 font-medium text-text-secondary border border-border bg-background">
                  Delivery (days)
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`del-${quote.id}`} className={clsx(
                      "p-4 border border-border font-mono",
                      isBest ? "bg-success/20 text-success border-success/50" : "text-text-primary"
                    )}>
                      {quote.delivery_days}
                    </td>
                  );
                })}
              </tr>

              {/* Vendor Rating Row */}
              <tr>
                <td className="p-4 font-medium text-text-secondary border border-border bg-background">
                  Vendor rating
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`rat-${quote.id}`} className={clsx(
                      "p-4 border border-border font-mono",
                      isBest ? "bg-success/20 text-success border-success/50" : "text-text-primary"
                    )}>
                      {quote.vendor_rating}
                    </td>
                  );
                })}
              </tr>

              {/* Payment terms Row */}
              <tr>
                <td className="p-4 font-medium text-text-secondary border border-border bg-background">
                  Payment terms
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`pay-${quote.id}`} className={clsx(
                      "p-4 border border-border",
                      isBest ? "bg-success/20 text-success border-success/50" : "text-text-primary"
                    )}>
                      {quote.payment_terms}
                    </td>
                  );
                })}
              </tr>

              {/* Actions Row */}
              <tr>
                <td className="p-4 border border-border bg-background"></td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`action-${quote.id}`} className={clsx(
                      "p-4 border border-border",
                      isBest ? "bg-success/20 border-success/50" : ""
                    )}>
                      {isBest ? (
                        <button 
                          onClick={() => handleSelectVendor(quote.id)}
                          className="w-full btn bg-success hover:bg-green-600 text-white flex items-center justify-center gap-2"
                        >
                          Select & Approve
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSelectVendor(quote.id)}
                          className="w-full btn bg-transparent border border-text-secondary text-text-primary hover:border-text-primary transition-colors"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-danger mt-4 font-medium">Green = lowest price, selecting vendor initiates the approval workflow.</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationCompare;
