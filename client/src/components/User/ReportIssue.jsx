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
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Please upload an image file');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
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
    formData.append('category', category);
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
        setImage(null);
        setCategory('');
        setDescription('');
        setUrgency('medium');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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

        {/* Category Selection */}
        <div className="form-group">
          <label className="form-label">
            Issue Category
            <div className="select-wrapper">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-icon" size={20} />
            </div>
          </label>
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
    </div>
  );
};

export default ReportIssue;
