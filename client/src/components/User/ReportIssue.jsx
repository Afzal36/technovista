import { useState, useRef } from 'react';
import { Upload, Check, X, Camera, Loader } from 'lucide-react';
import './ReportIssue.css';

const ReportIssue = () => {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [urgency, setUrgency] = useState('medium');
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Add your Gemini API key here
  const GEMINI_API_KEY = 'AIzaSyDCabvlNbcX-hN7qzGz4TI2PQCq2a0hwyc';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Please upload an image file');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Function to send data to Gemini API
  const sendToGemini = async (backendResponse) => {
    try {
      const prompt = `
        Based on the following maintenance issue analysis, please generate a JSON object that matches this exact schema:
        
        {
          "phone": "string (Indian phone number format: 10 digits starting with 6-9)",
          "address": "string (generate a realistic Indian address)",
          "label": "string (use the predicted_label from the analysis)",
          "category": "string (determine appropriate category like 'plumber', 'electrician', 'cleaner', 'painter', 'carpenter', etc.)"
        }

        Analysis data:
        ${JSON.stringify(backendResponse, null, 2)}

        Important:
        - Use the predicted_label directly from the analysis
        - Generate a realistic Indian phone number (10 digits, starting with 6-9)
        - Create a believable Indian address
        - Choose the most appropriate category based on the issue type
        - Return ONLY the JSON object, no additional text
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const geminiData = await response.json();
      const generatedText = geminiData.candidates[0].content.parts[0].text;
      
      // Try to parse the JSON from Gemini response
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const structuredData = JSON.parse(jsonMatch[0]);
          console.log('Structured Issue Report:', structuredData);
          return structuredData;
        } else {
          console.error('No JSON found in Gemini response:', generatedText);
        }
      } catch (parseError) {
        console.error('Error parsing Gemini JSON:', parseError);
        console.log('Raw Gemini response:', generatedText);
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create FormData object to handle file upload
    const formData = new FormData();
    // Ensure we have a file before appending
    if (fileInputRef.current && fileInputRef.current.files[0]) {
      formData.append('image', fileInputRef.current.files[0]);
    }
    formData.append('urgency', urgency);
    if (description.trim()) {
      formData.append('description', description);
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Backend Response:', data);

      // Show success animation and reset form if successful
      if (response.ok) {
        // Send to Gemini API for structured data generation
        let structuredData = await sendToGemini(data);
        // Get email from localStorage user item
        let email = '';
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            email = userObj.email || '';
            console.log('Email to send:', email);
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
        if (!structuredData || typeof structuredData !== 'object') {
          structuredData = {};
        }
        // Remove status if present (Gemini may return it)
        if ('status' in structuredData) {
          delete structuredData.status;
        }
        // Flatten payload to ensure all required fields are at the root
        const payload = {
          email,
          phone: structuredData.phone,
          address: structuredData.address,
          label: structuredData.label,
          category: structuredData.category
          // Do NOT send status, let backend use default
        };
        console.log('Payload to send:', payload);
        try {
          const postRes = await fetch('http://localhost:5000/api/issues/minimal-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (!postRes.ok) {
            const postErr = await postRes.text();
            console.error('Error posting minimal report:', postErr);
          } else {
            console.log('Minimal report posted successfully');
          }
        } catch (err) {
          console.error('Network error posting minimal report:', err);
        }
        setShowSuccess(true); // Show success animation
        setTimeout(() => {
          setShowSuccess(false);
          // Reset form
          setImage(null);
          setDescription('');
          setUrgency('medium');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000); // Hide success after 2 seconds
      } else {
        console.error('Server Error:', data);
      }
    } catch (error) {
      console.error('Network Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="report-issue-container">
      <h2 className="report-title">Report Maintenance Issue</h2>
      
      <form onSubmit={handleSubmit} className="report-form">
        {/* Image Upload Section */}
        <div 
          className={`upload-section ${dragActive ? 'drag-active' : ''} ${image ? 'has-image' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept="image/*"
            onChange={handleChange}
          />
          
          {image ? (
            <div className="image-preview-container">
              <img src={image} alt="Issue preview" className="image-preview" />
              <button 
                type="button" 
                className="clear-image-btn"
                onClick={handleClearImage}
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">
                <Upload size={40} />
              </div>
              <p>Drag and drop an image here, or</p>
              <button type="button" className="upload-btn" onClick={onButtonClick}>
                <Camera size={16} />
                Choose Image
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            Description
           
          </label>
           <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
              placeholder="Describe the Issue (optional)"
              rows={4}
            />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !image}
        >
          {loading ? (
            <>
              <Loader className="spin-icon" size={20} />
              Submitting...
            </>
          ) : (
            <>
              <Check size={20} />
              Submit Report
            </>
          )}
        </button>
      </form>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-popup">
            <div className="success-icon">
              <Check size={40} />
            </div>
            <h3>Successfully Submitted!</h3>
            <p>Your maintenance request has been received.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;