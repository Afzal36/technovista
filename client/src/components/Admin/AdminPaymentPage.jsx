// Fixed Helper to send invoice email with PDF
const sendInvoiceEmail = async (pdfBlob, paymentAmount, paymentPurpose, setError) => {
  try {
    console.log('📨 Preparing to send invoice email...');
    
    // Always get user email from 'user' object in localStorage
    const userData = localStorage.getItem('user');
    let userEmail = null;
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        userEmail = parsedUserData.email;
        console.log('📧 Found user email in userData:', userEmail);
      } catch (parseError) {
        console.error('❌ Error parsing userData from localStorage:', parseError);
      }
    }
    // Final validation
    if (!userEmail) {
      const errorMsg = 'User email not found in localStorage. Please ensure user is logged in.';
      console.error('❌', errorMsg);
      setError && setError(errorMsg);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      const errorMsg = 'Invalid email format found in localStorage';
      console.error('❌', errorMsg);
      setError && setError(errorMsg);
      return false;
    }

    console.log('📧 Sending invoice to:', userEmail);

    // Create FormData
    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('text', `Thank you for your payment of $${paymentAmount} for "${paymentPurpose}". Please find your invoice attached.`);
    formData.append('pdf', new File([pdfBlob], `invoice_${Date.now()}.pdf`, { 
      type: 'application/pdf' 
    }));

    console.log('📤 Sending request to server...');

    // Send request
  const res = await fetch('https://technovista-nine.vercel.app/api/send-mail/send-email', {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Server response status:', res.status);

    let responseData;
    try {
      responseData = await res.json();
      console.log('📄 Server response:', responseData);
    } catch (jsonError) {
      console.error('❌ Error parsing server response:', jsonError);
      throw new Error('Invalid server response format');
    }

    if (!res.ok) {
      throw new Error(responseData.message || `Server error: ${res.status}`);
    }

    console.log('✅ Invoice email sent successfully!');
    alert('Invoice email sent successfully to: ' + userEmail);
    return true;
    
  } catch (err) {
    console.error('❌ Error sending invoice email:', err);
    const errorMessage = `Failed to send invoice email: ${err.message}`;
    setError && setError(errorMessage);
    alert(errorMessage); // Also show alert for immediate feedback
    return false;
  }
};

import React, { useEffect, useState, useRef } from 'react';
import './AdminPaymentPage.css';

const AdminPaymentPage = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(10);
  const [paymentPurpose, setPaymentPurpose] = useState('Payment for Maintenance Platform Usage');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const invoiceRef = useRef();
  const paypalButtonRef = useRef();

  // Use PayPal Client ID from environment variable for sandbox mode
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  // Load html2pdf script
  useEffect(() => {
    const loadHtml2PdfScript = () => {
      if (!document.querySelector('script[src*="html2pdf"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ html2pdf library loaded successfully');
        };
        script.onerror = () => {
          console.error('❌ Failed to load html2pdf library');
          setError('Failed to load PDF generation library');
        };
        document.head.appendChild(script);
      }
    };
    loadHtml2PdfScript();
  }, []);

  // Function to generate PDF and send email
  const generatePDFAndSendEmail = async (paymentDetails) => {
    try {
      console.log('🔄 Starting PDF generation and email sending process...');
      setEmailSending(true);
      
      // Wait a bit to ensure the invoice is rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const element = invoiceRef.current;
      if (!element) {
        throw new Error('Invoice element not found');
      }

      if (!window.html2pdf) {
        throw new Error('PDF library not loaded. Please refresh and try again.');
      }

      const options = {
        margin: [0.2, 0.5, 0.5, 0.5], // [top, right, bottom, left] - reduced top margin
        filename: `invoice_${paymentDetails?.id?.slice(-8) || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true, 
          backgroundColor: '#FAF7F2' 
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      console.log('🔄 Generating PDF...');
      const pdfBlob = await window.html2pdf().set(options).from(element).outputPdf('blob');
      
      console.log('✅ PDF generated successfully');
      
      // Send the email with PDF attachment
      const emailSent = await sendInvoiceEmail(pdfBlob, paymentAmount, paymentPurpose, setError);
      
      if (emailSent) {
        console.log('✅ Email sent successfully');
      } else {
        console.log('❌ Email sending failed');
      }
      
    } catch (error) {
      console.error('❌ Error in PDF generation or email sending:', error);
      setError(`Failed to generate PDF or send email: ${error.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  useEffect(() => {
    // Don't load PayPal if payment is already successful
    if (paymentSuccess) return;

    // Clear any existing PayPal buttons
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }

    // Load PayPal script
    const loadPayPalScript = () => {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
      
      script.onload = () => {
        if (window.paypal) {
          console.log("✅ PayPal SDK loaded successfully");
          setIsScriptLoaded(true);
          initializePayPalButtons();
        } else {
          setError("PayPal SDK loaded but window.paypal is undefined. Check client ID and sandbox mode.");
          setIsScriptLoaded(false);
        }
      };
      script.onerror = () => {
        console.error("❌ Failed to load PayPal SDK");
        setError("Failed to load PayPal SDK. Check your internet connection and client ID.");
        setIsScriptLoaded(false);
      };

      document.body.appendChild(script);
    };

    const initializePayPalButtons = () => {
      if (window.paypal && paypalButtonRef.current && !paymentSuccess) {
        console.log("🔄 Initializing PayPal buttons");
        
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          },
          
          createOrder: async () => {
            try {
              console.log("🔄 Creating PayPal order with amount:", paymentAmount);
              setLoading(true);
              setError(null);

              const res = await fetch("https://technovista-nine.vercel.app/create-order", {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify({ amount: paymentAmount })
              });

              console.log("📡 Server response status:", res.status);

              if (!res.ok) {
                const errorText = await res.text();
                let errorData;
                try {
                  errorData = JSON.parse(errorText);
                } catch {
                  errorData = { error: errorText };
                }
                throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.error || 'Unknown error'}`);
              }

              const data = await res.json();
              console.log("✅ Order created with ID:", data.id);
              setLoading(false);
              return data.id;
            } catch (error) {
              console.error("❌ Error creating order:", error);
              setError(`Failed to create order: ${error.message}`);
              setLoading(false);
              throw error;
            }
          },

          onApprove: async (data) => {
            try {
              console.log("🔄 Capturing PayPal order:", data.orderID);
              setLoading(true);
              setError(null);

              const res = await fetch(`https://technovista-nine.vercel.app/capture-order/${data.orderID}`, {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
                }
              });

              console.log("📡 Capture response status:", res.status);

              if (!res.ok) {
                const errorText = await res.text();
                let errorData;
                try {
                  errorData = JSON.parse(errorText);
                } catch {
                  errorData = { error: errorText };
                }
                throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.error || 'Unknown error'}`);
              }

              const details = await res.json();
              console.log("✅ Payment captured successfully:", details);
              
              // Set payment success state
              setPaymentDetails(details);
              setPaymentSuccess(true);
              setError(null);
              setLoading(false);
              
              // Clear PayPal button container to prevent re-initialization
              if (paypalButtonRef.current) {
                paypalButtonRef.current.innerHTML = '';
              }
              
              // Generate PDF and send email after payment success
              console.log("🔄 Starting PDF generation and email sending...");
              setTimeout(() => {
                generatePDFAndSendEmail(details);
              }, 1500); // Wait a bit longer to ensure UI is updated
              
            } catch (error) {
              console.error("❌ Error capturing payment:", error);
              setError(`Payment failed: ${error.message}`);
              setLoading(false);
            }
          },

          onError: (err) => {
            console.error("❌ PayPal button error:", err);
            setError("PayPal payment error occurred. Please try again.");
            setLoading(false);
          },

          onCancel: (data) => {
            console.log("🚫 Payment cancelled by user:", data);
            setError("Payment was cancelled by user");
            setLoading(false);
          }
        }).render(paypalButtonRef.current)
        .then(() => {
          console.log("✅ PayPal buttons rendered successfully");
        })
        .catch((error) => {
          console.error("❌ Error rendering PayPal buttons:", error);
          // setError("Failed to render PayPal buttons");
        });
      }
    };

    // Only initialize if not already successful
    if (!paymentSuccess) {
      loadPayPalScript();
    }

    // Cleanup function
    return () => {
      if (!paymentSuccess) {
        const script = document.querySelector('script[src*="paypal.com/sdk"]');
        if (script && document.body.contains(script)) {
          document.body.removeChild(script);
        }
        setIsScriptLoaded(false);
      }
    };
  }, [paymentAmount, paymentSuccess]);

  const downloadPDF = async () => {
    try {
      console.log("🔄 Generating PDF for download...");
      
      if (!window.html2pdf) {
        throw new Error("PDF library not loaded. Please refresh and try again.");
      }
      
      const element = invoiceRef.current;
      if (!element) {
        throw new Error("Invoice element not found");
      }
      
      const options = {
        margin: [0.2, 0.5, 0.5, 0.5], // [top, right, bottom, left] - reduced top margin
        filename: `invoice_${paymentDetails?.id?.slice(-8) || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FAF7F2'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };
      
      // Generate and download PDF
      await window.html2pdf().set(options).from(element).save();
      console.log("✅ PDF downloaded successfully");
      
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  const resendEmail = async () => {
    if (paymentDetails) {
      await generatePDFAndSendEmail(paymentDetails);
    }
  };

  const resetPayment = () => {
    console.log("🔄 Resetting payment state");
    setPaymentSuccess(false);
    setPaymentDetails(null);
    setError(null);
    setLoading(false);
    setEmailSending(false);
    setIsScriptLoaded(false);
    
    // Clear PayPal button container
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }
  };

  // Test payment success (for debugging)
  const testPaymentSuccess = () => {
    console.log("🧪 Testing payment success state");
    const testDetails = {
      id: "TEST123456789", 
      status: "COMPLETED"
    };
    setPaymentDetails(testDetails);
    setPaymentSuccess(true);
    setError(null);
    setLoading(false);
    
    // Also test email sending
    setTimeout(() => {
      generatePDFAndSendEmail(testDetails);
    }, 1000);
  };

  // Get user email for display
  const getUserEmail = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        return parsedUserData.email || 'No email found';
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    return 'No email found';
  };

  return (
    <div className="admin-payment-container">
      <div className="admin-payment-wrapper">
        {/* Admin Header */}
        <div className="admin-header-card">
          <div className="admin-header-content">
            <div className="admin-header-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="admin-header-text">
              <h1 className="admin-title">Maintenance Platform Payment</h1>
              <p className="admin-subtitle">Process platform usage fees and generate invoices</p>
              <div className="sandbox-badge">PayPal Sandbox Mode Active</div>
              <div className="user-email-display">Email: {getUserEmail()}</div>
            </div>
          </div>
          
          {/* Debug Button - Remove in production */}
          <button
            onClick={testPaymentSuccess}
            className="debug-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9c2.23 0 4.26.82 5.82 2.18"/>
            </svg>
            Test Success State
          </button>
        </div>

        {/* Payment Configuration */}
        {!paymentSuccess && (
          <div className="config-card">
            <h2 className="config-title">Payment Configuration</h2>
            <div className="config-grid">
              <div className="form-group">
                <label className="form-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="form-input"
                  min="1"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Payment Purpose
                </label>
                <input
                  type="text"
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="alert alert-error">
            <div className="alert-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <div>
                <span className="alert-title">Error: </span>
                <span className="alert-message">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Display */}
        {(loading || emailSending) && (
          <div className="alert alert-loading">
            <div className="alert-content">
              <div className="loading-spinner"></div>
              <span className="alert-message">
                {emailSending ? 'Sending invoice email...' : 'Processing payment...'}
              </span>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {!paymentSuccess ? (
          <div className="payment-card">
            <div className="payment-header">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <h2 className="payment-title">
                Process Payment - ${paymentAmount.toFixed(2)}
              </h2>
            </div>
            
            {!isScriptLoaded && !error && (
              <div className="paypal-loading">
                <div className="loading-spinner"></div>
                <span>Loading PayPal Sandbox...</span>
              </div>
            )}
            
            <div ref={paypalButtonRef} className="paypal-container"></div>
            
            {!isScriptLoaded && error && (
              <div className="paypal-error">
                <div className="paypal-error-message">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="retry-button"
                >
                  Retry Loading PayPal Sandbox
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Success State with Invoice */
          <div className="success-container">
            {/* Success Message */}
            <div className="success-card">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <h2 className="success-title">Payment Successful!</h2>
              <p className="success-message">Payment has been processed successfully.</p>
              <p className="success-transaction">
                Transaction ID: {paymentDetails?.id || 'N/A'}
              </p>
              {emailSending && (
                <p className="email-status">📧 Sending invoice email...</p>
              )}
            </div>

            {/* Admin Actions */}
            <div className="actions-card">
              <div className="actions-header">
                <h3 className="actions-title">Admin Actions</h3>
                <button
                  onClick={resetPayment}
                  className="secondary-button"
                  disabled={emailSending}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1,4 1,10 7,10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  Process Another Payment
                </button>
              </div>
              <div className="actions-buttons">
                <button
                  onClick={downloadPDF}
                  className="primary-button"
                  disabled={emailSending}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Download PDF Invoice
                </button>
                <button
                  onClick={resendEmail}
                  className="secondary-button"
                  disabled={emailSending}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Resend Email
                </button>
              </div>
            </div>

            {/* Invoice Preview - Updated with Better Design */}
            <div className="invoice-preview-card">
              <h3 className="invoice-preview-title">Invoice Preview</h3>
              
              {/* Updated Invoice Component with Better UI */}
              <div ref={invoiceRef} className="invoice-container">
                {/* Header */}
                <div className="invoice-header">
                  <div className="invoice-header-left">
                    <div className="invoice-logo">
                      <span>IWCWT</span>
                    </div>
                    <div className="invoice-header-text">
                      <div className="invoice-title-main">PAYMENT INVOICE</div>
                      <div className="invoice-subtitle">Transaction Receipt</div>
                    </div>
                  </div>
                  <div className="invoice-header-right">
                    <div className="company-name">IWCWT Ministry</div>
                    <div className="company-email">info@iwcwtministry.org</div>
                    <div className="company-location">India</div>
                  </div>
                </div>

                {/* Customer & Invoice Details */}
                <div className="invoice-details">
                  <div className="customer-details">
                    <div className="detail-label">Customer</div>
                    <div className="customer-name">John Doe</div>
                    <div className="customer-email">{getUserEmail()}</div>
                    <div className="customer-location">US</div>
                  </div>
                  <div className="invoice-meta">
                    <div className="detail-label">Invoice #</div>
                    <div className="invoice-number">{paymentDetails?.id?.slice(-8) || 'TEST1234'}</div>
                    <div className="detail-label invoice-date-label">Date</div>
                    <div className="invoice-date">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Payment Details Table */}
                <div className="invoice-table-container">
                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{paymentPurpose}</td>
                        <td>${paymentAmount.toFixed(2)} USD</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total:</td>
                        <td>${paymentAmount.toFixed(2)} USD</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Transaction Info */}
                <div className="transaction-info">
                  <div className="transaction-details">
                    <div><span>Transaction ID:</span> {paymentDetails?.id || 'TEST123456789'}</div>
                    <div><span>Status:</span> {paymentDetails?.status || 'COMPLETED'}</div>
                    <div><span>Processed:</span> {new Date().toLocaleString()}</div>
                  </div>
                  <div className="payment-method">
                    <div className="method-label">Payment Method</div>
                    <div className="method-value">PayPal</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="invoice-footer">
                  <div className="footer-title">Thank you for your payment!</div>
                  <div className="footer-message">This receipt confirms your payment transaction. Please keep this for your records.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentPage;