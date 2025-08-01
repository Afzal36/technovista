import { useState, useRef } from 'react';
import { Upload, ChevronDown, Check, X, Camera, Loader } from 'lucide-react';
import './ReportIssue.css';

const ReportIssue = () => {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [urgency, setUrgency] = useState('medium');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'plumbing', label: 'Plumbing', icon: '🚰' },
    { id: 'electrical', label: 'Electrical', icon: '⚡' },
    { id: 'civil', label: 'Civil/Structural', icon: '🏗️' },
    { id: 'hvac', label: 'HVAC', icon: '❄️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'other', label: 'Other', icon: '🔧' }
  ];

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
        setPrediction(null); // Clear previous prediction
        setError(null); // Clear previous errors
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload an image file');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Test CORS endpoint first
  const testCORS = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/test-cors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('CORS test successful:', data);
        return true;
      } else {
        console.error('CORS test failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('CORS test error:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    // First test CORS
    console.log('Testing CORS connection...');
    const corsTest = await testCORS();
    if (!corsTest) {
      setError('CORS test failed. Please check if the backend server is running.');
      setLoading(false);
      return;
    }

    // Create FormData object to handle file upload
    const formData = new FormData();
    
    // Ensure we have a file before appending
    if (fileInputRef.current && fileInputRef.current.files[0]) {
      formData.append('image', fileInputRef.current.files[0]);
      console.log('Image file added to form data');
    } else {
      setError('No image file selected');
      setLoading(false);
      return;
    }
    
    // Add other form data
    formData.append('category', category);
    formData.append('urgency', urgency);
    if (description.trim()) {
      formData.append('description', description);
    }

    console.log('Sending prediction request...');
    
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData - let browser set it
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend Response:', data);

      // Set prediction results
      setPrediction(data);

      // Show success and reset form if successful
      if (data.predicted_label) {
        setTimeout(() => {
          setImage(null);
          setCategory('');
          setDescription('');
          setUrgency('medium');
          setPrediction(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 5000); // Clear after 5 seconds to show results
      }

    } catch (error) {
      console.error('Request Error:', error);
      setError(`Network Error: ${error.message}`);
      
      // Provide troubleshooting info
      if (error.message.includes('CORS')) {
        setError('CORS Error: Please make sure the Flask server is running with CORS enabled on http://127.0.0.1:5000');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Connection Error: Cannot reach the server. Please check if Flask server is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
              placeholder="Please describe the issue in detail... (optional)"
              rows={4}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !image || !category}
        >
          {loading ? (
            <>
              <Loader className="spin-icon" size={20} />
              Analyzing Image...
            </>
          ) : (
            <>
              <Check size={20} />
              Submit Report
            </>
          )}
        </button>

        {/* Debug Info */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
          <p>Server: http://127.0.0.1:5000</p>
          <p>Status: {error ? '❌ Error' : prediction ? '✅ Success' : '⏳ Ready'}</p>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;