import React, { useEffect, useState, useRef } from 'react';

const AdminPaymentPage = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(10);
  const [paymentPurpose, setPaymentPurpose] = useState('Child Welfare & Education Donation');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const invoiceRef = useRef();
  const paypalButtonRef = useRef();

  // Use PayPal Client ID from environment variable for sandbox mode
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "AQBqkwAcPkjd8-7xR2UMsUtpUbXmfQViPs-ltoRj-T84ROkVtQJqy4Fojp4HR3rgm2nt4OGXQlD-6Hw_";

  // Load html2pdf script
  useEffect(() => {
    const loadHtml2PdfScript = () => {
      if (!document.querySelector('script[src*="html2pdf"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.async = true;
        document.head.appendChild(script);
      }
    };
    loadHtml2PdfScript();
  }, []);

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

              const res = await fetch("http://localhost:5000/create-order", {
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

              const res = await fetch(`http://localhost:5000/capture-order/${data.orderID}`, {
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
          setError("Failed to render PayPal buttons");
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
      console.log("🔄 Generating PDF...");
      
      // Check if html2pdf is available
      if (!window.html2pdf) {
        throw new Error("PDF library not loaded. Please refresh and try again.");
      }
      
      const element = invoiceRef.current;
      if (!element) {
        throw new Error("Invoice element not found");
      }

      const options = {
        margin: 0.5,
        filename: `invoice_${paymentDetails?.id?.slice(-8) || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };
      
      await window.html2pdf().set(options).from(element).save();
      console.log("✅ PDF generated successfully");
      
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  const resetPayment = () => {
    console.log("🔄 Resetting payment state");
    setPaymentSuccess(false);
    setPaymentDetails(null);
    setError(null);
    setLoading(false);
    setIsScriptLoaded(false);
    
    // Clear PayPal button container
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }
  };

  // Test payment success (for debugging)
  const testPaymentSuccess = () => {
    console.log("🧪 Testing payment success state");
    setPaymentDetails({
      id: "TEST123456789", 
      status: "COMPLETED"
    });
    setPaymentSuccess(true);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Payment Management</h1>
              <p className="text-gray-600">Process payments and generate invoices</p>
              <div className="text-xs text-blue-600 mt-1">PayPal Sandbox Mode Active</div>
          
          {/* Debug Button - Remove in production */}
          <button
            onClick={testPaymentSuccess}
            className="mt-2 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
          >
            🧪 Test Success State
          </button>
        </div>

        {/* Payment Configuration */}
        {!paymentSuccess && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Purpose
                </label>
                <input
                  type="text"
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-2">❌</span>
              <div>
                <span className="text-red-700 font-medium">Error: </span>
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-blue-700">Processing payment...</span>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {!paymentSuccess ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Process Payment - ${paymentAmount.toFixed(2)}
            </h2>
            
            {!isScriptLoaded && !error && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600">Loading PayPal Sandbox...</span>
              </div>
            )}
            
            <div ref={paypalButtonRef} id="paypal-button-container" className="min-h-[200px]"></div>
            
            {!isScriptLoaded && error && (
              <div className="text-center py-4">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry Loading PayPal Sandbox
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Success State with Invoice */
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-green-800 mb-2">✅ Payment Successful!</h2>
              <p className="text-green-700">Payment has been processed successfully.</p>
              <p className="text-green-600 text-sm mt-2">
                Transaction ID: {paymentDetails?.id || 'N/A'}
              </p>
            </div>

            {/* Admin Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Admin Actions</h3>
                <button
                  onClick={resetPayment}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Process Another Payment
                </button>
              </div>
              <button
                onClick={downloadPDF}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                📄 Download PDF Invoice
              </button>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Invoice Preview</h3>
              
              {/* Invoice Component */}
              <div ref={invoiceRef} className="max-w-2xl mx-auto bg-gray-50 text-gray-800 rounded-2xl shadow-lg border border-gray-200 font-sans overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6 border-b-4 border-blue-800">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg bg-white p-1 mr-5 shadow flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">IWCWT</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-2xl tracking-wide">PAYMENT INVOICE</div>
                      <div className="text-blue-100 text-base font-medium">Transaction Receipt</div>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <div className="font-semibold text-lg">IWCWT Ministry</div>
                    <div className="text-sm">info@iwcwtministry.org</div>
                    <div className="text-sm">India</div>
                  </div>
                </div>

                {/* Customer & Invoice Details */}
                <div className="flex justify-between px-8 pt-6 bg-white">
                  <div>
                    <div className="text-gray-500 font-medium text-sm">Customer</div>
                    <div className="font-semibold text-base mt-1">John Doe</div>
                    <div className="text-sm">sb-kqsfq43674007@personal.example.com</div>
                    <div className="text-sm">US</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 font-medium text-sm">Invoice #</div>
                    <div className="font-semibold text-base mt-1">{paymentDetails?.id?.slice(-8) || 'TEST1234'}</div>
                    <div className="text-gray-500 font-medium text-sm mt-3">Date</div>
                    <div className="font-semibold text-base mt-1">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Payment Details Table */}
                <div className="bg-white px-8">
                  <table className="w-full mt-6 mb-2 text-base">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="text-left py-3 px-2 font-semibold text-blue-700 border-b border-blue-100">Description</th>
                        <th className="text-right py-3 px-2 font-semibold text-blue-700 border-b border-blue-100">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="odd:bg-gray-50 even:bg-white">
                        <td className="py-3 px-2 border-b border-gray-100">{paymentPurpose}</td>
                        <td className="text-right py-3 px-2 border-b border-gray-100">${paymentAmount.toFixed(2)} USD</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="py-3 px-2 text-right font-bold bg-blue-50 border-t border-blue-100">Total:</td>
                        <td className="text-right py-3 px-2 font-bold bg-blue-50 border-t border-blue-100">${paymentAmount.toFixed(2)} USD</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Transaction Info */}
                <div className="flex justify-between items-center bg-white px-8 pt-2 pb-1 text-sm">
                  <div>
                    <div><span className="font-semibold">Transaction ID:</span> {paymentDetails?.id || 'TEST123456789'}</div>
                    <div><span className="font-semibold">Status:</span> {paymentDetails?.status || 'COMPLETED'}</div>
                    <div><span className="font-semibold">Processed:</span> {new Date().toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 font-medium">Payment Method</div>
                    <div className="font-semibold text-blue-700">PayPal</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-blue-50 px-8 py-5 rounded-b-2xl mt-2 text-gray-700 text-center">
                  <div className="font-semibold text-lg text-blue-700 mb-1">Thank you for your payment!</div>
                  <div className="italic text-sm">This receipt confirms your payment transaction. Please keep this for your records.</div>
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