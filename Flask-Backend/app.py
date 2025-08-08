from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from transformers import CLIPProcessor, CLIPModel
from huggingface_hub import login
from PIL import Image
import torch
import os
import numpy as np
import time
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# Simplified and more effective CORS configuration
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
     supports_credentials=False
)

# Remove the before_request handler as it can conflict with flask-cors
# The after_request handler is also removed to avoid conflicts

UPLOAD_FOLDER = "static/uploads"
MODEL_CACHE_DIR = "./models/clip-vit-base-patch32"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

# Hugging Face Token Configuration
HF_TOKEN = os.getenv('HUGGINGFACE_HUB_TOKEN')


def authenticate_huggingface():
    """Authenticate with Hugging Face using token"""
    if HF_TOKEN:
        try:
            login(token=HF_TOKEN)
            print("✅ Successfully authenticated with Hugging Face")
            return True
        except Exception as e:
            print(f"❌ Failed to authenticate with Hugging Face: {str(e)}")
            return False
    else:
        print("⚠️ No Hugging Face token found. Set HUGGINGFACE_HUB_TOKEN environment variable")
        return False

def load_model_with_auth():
    """Load CLIP model with Hugging Face authentication"""
    try:
        print("🔑 Authenticating with Hugging Face...")
        auth_success = authenticate_huggingface()
        
        if not auth_success:
            print("⚠️ Proceeding without authentication (may hit rate limits)")
        
        print("📥 Loading CLIP model...")
        
        # Try to load from local cache first
        if os.path.exists(MODEL_CACHE_DIR) and os.listdir(MODEL_CACHE_DIR):
            try:
                print("Loading model from local cache...")
                model = CLIPModel.from_pretrained(MODEL_CACHE_DIR, local_files_only=True)
                processor = CLIPProcessor.from_pretrained(MODEL_CACHE_DIR, local_files_only=True)
                print("✅ Model loaded successfully from cache!")
                return model, processor
            except Exception as e:
                print(f"Failed to load from cache: {str(e)}")
                print("Downloading fresh model...")
        
        # Download from Hugging Face
        model = CLIPModel.from_pretrained(
            "openai/clip-vit-base-patch32",
            token=HF_TOKEN if HF_TOKEN else None,
            cache_dir=MODEL_CACHE_DIR
        )
        processor = CLIPProcessor.from_pretrained(
            "openai/clip-vit-base-patch32",
            token=HF_TOKEN if HF_TOKEN else None,
            cache_dir=MODEL_CACHE_DIR
        )
        
        # Save to local directory for future use
        try:
            model.save_pretrained(MODEL_CACHE_DIR)
            processor.save_pretrained(MODEL_CACHE_DIR)
            print("💾 Model saved to local cache")
        except Exception as e:
            print(f"Warning: Could not save to cache: {str(e)}")
        
        print("✅ Model loaded successfully!")
        return model, processor
        
    except Exception as e:
        print(f"❌ Failed to load model: {str(e)}")
        raise

# Load CLIP model and processor
print("🚀 Initializing CLIP model...")
try:
    model, processor = load_model_with_auth()
except Exception as e:
    print(f"💥 Critical error: Could not load model. {str(e)}")
    print("\n📋 Troubleshooting steps:")
    print("1. Make sure you have a Hugging Face account")
    print("2. Get your token from: https://huggingface.co/settings/tokens")
    print("3. Set environment variable: export HUGGINGFACE_HUB_TOKEN='your_token_here'")
    print("4. Or update the HF_TOKEN variable in this script")
    model, processor = None, None

# Main categories for infrastructure issues (DON'T CHANGE)
main_labels = [
    "A broken electrical wire or fuse box",
    "A leaking pipe or plumbing issue", 
    "Cracks in walls or structural damage",
    "Dirty washroom or unclean area (sanitation issue)",
    "Lights not working or dark room"
]

# Realistic infrastructure context keywords (UPDATED)
infrastructure_keywords = [
    "building repair work",
    "maintenance issue in university or hostel",
    "infrastructure damage in housing society",
    "facility issue in apartment or office",
    "campus maintenance fault",
    "broken infrastructure needing repair",
    "technical issue in large community",
    "structural fault or utility damage",
    "damaged facility in residential area",
    "faulty wiring or pipe leakage in building"
]

# Non-infrastructure categories (DON'T CHANGE)
non_infrastructure_labels = [
    "a person or human face",
    "an animal or pet",
    "food or cooking",
    "sports or games", 
    "nature or landscape",
    "vehicle or transportation",
    "celebrity or famous person",
    "random object or unrelated item"
]

@app.route("/predict", methods=["POST"])
def predict():
    print("🔍 Prediction endpoint hit")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    
    # Check if model is loaded
    if model is None or processor is None:
        return jsonify({
            "error": "Model not loaded. Please check Hugging Face token and restart the server.",
            "troubleshooting": {
                "step1": "Get token from https://huggingface.co/settings/tokens",
                "step2": "Set environment variable: HUGGINGFACE_HUB_TOKEN",
                "step3": "Restart the server"
            }
        }), 500

    print(f"Files in request: {request.files.keys()}")
    
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    if image_file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    print(f"Processing image: {image_file.filename}")
    
    image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image_file.save(image_path)

    try:
        image = Image.open(image_path)
        print(f"Image loaded successfully: {image.size}")

        # Step 1: Check if image is infrastructure-related
        all_test_labels = infrastructure_keywords + ["unrelated content", "not infrastructure"]
        inputs = processor(text=all_test_labels, images=image, return_tensors="pt", padding=True)
        outputs = model(**inputs)
        logits = outputs.logits_per_image
        probs = logits.softmax(dim=1)
        
        # Get probability for infrastructure vs non-infrastructure
        infra_prob = torch.max(probs[0][:len(infrastructure_keywords)]).item()
        non_infra_prob = torch.max(probs[0][len(infrastructure_keywords):]).item()
        
        print(f"Infrastructure probability: {infra_prob:.3f}")
        print(f"Non-infrastructure probability: {non_infra_prob:.3f}")

        # Step 2: If likely non-infrastructure, classify as unrelated
        if non_infra_prob > infra_prob or infra_prob < 0.4:
            # Double-check with non-infrastructure categories
            inputs2 = processor(text=non_infrastructure_labels, images=image, return_tensors="pt", padding=True)
            outputs2 = model(**inputs2)
            logits2 = outputs2.logits_per_image
            probs2 = logits2.softmax(dim=1)
            max_prob2 = torch.max(probs2[0]).item()
            
            if max_prob2 > 0.3:  # Strong match to non-infra content
                response_data = {
                    "predictions": {label: 0.0 for label in main_labels},
                    "predicted_label": "Unrelated or invalid image",
                    "confidence": f"{max_prob2*100:.1f}%",
                    "detected_as": non_infrastructure_labels[torch.argmax(probs2[0]).item()]
                }
                print(f"Returning non-infrastructure result: {response_data}")
                return jsonify(response_data)

        # Step 3: If infrastructure-related, classify specific issue
        inputs3 = processor(text=main_labels, images=image, return_tensors="pt", padding=True)
        outputs3 = model(**inputs3)
        logits3 = outputs3.logits_per_image
        probs3 = logits3.softmax(dim=1)

        max_prob3, max_idx3 = torch.max(probs3[0], dim=0)
        predicted_label = main_labels[max_idx3]

        predictions = {label: float(f"{prob*100:.2f}") for label, prob in zip(main_labels, probs3[0])}

        # Step 4: Apply confidence threshold for infrastructure classification
        threshold = 0.35
        if max_prob3.item() < threshold:
            response_data = {
                "predictions": predictions,
                "predicted_label": "Unrelated or invalid image",
                "confidence": f"{max_prob3.item()*100:.1f}%",
                "reason": "Low confidence in infrastructure classification"
            }
            print(f"Returning low confidence result: {response_data}")
            return jsonify(response_data)

        response_data = {
            "predictions": predictions,
            "predicted_label": predicted_label,
            "confidence": f"{max_prob3.item()*100:.1f}%"
        }
        print(f"Returning successful prediction: {response_data}")
        return jsonify(response_data)

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify model status"""
    if model is None or processor is None:
        return jsonify({
            "status": "unhealthy", 
            "message": "Model not loaded",
            "troubleshooting": "Check Hugging Face token configuration"
        }), 500
    return jsonify({
        "status": "healthy", 
        "message": "Model loaded successfully",
        "model_info": "openai/clip-vit-base-patch32"
    })

@app.route("/token-status", methods=["GET"])
def token_status():
    """Check Hugging Face token status"""
    if HF_TOKEN:
        return jsonify({
            "token_configured": True,
            "token_preview": f"{HF_TOKEN[:8]}..." if len(HF_TOKEN) > 8 else "Token too short"
        })
    else:
        return jsonify({
            "token_configured": False,
            "message": "No Hugging Face token found",
            "instructions": "Set HUGGINGFACE_HUB_TOKEN environment variable"
        })

@app.route("/test-cors", methods=["GET", "POST"])
def test_cors():
    """Test endpoint to verify CORS configuration"""
    print(f"CORS test endpoint hit - Method: {request.method}")
    print(f"Origin: {request.headers.get('Origin', 'No origin')}")
    
    return jsonify({
        "message": "CORS is working!",
        "method": request.method,
        "origin": request.headers.get('Origin', 'No origin header'),
        "user_agent": request.headers.get('User-Agent', 'No user agent'),
        "timestamp": time.time()
    })

# Add a root endpoint
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "Infrastructure Image Classifier API",
        "status": "running",
        "endpoints": [
            "POST /predict - Image classification",
            "GET /health - Health check",
            "GET /token-status - Token status",
            "GET /test-cors - CORS test"
        ]
    })

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🏗️  INFRASTRUCTURE IMAGE CLASSIFIER")
    print("="*50)
    
    if model is not None and processor is not None:
        print("✅ Server starting with model loaded successfully!")
        print("🌐 Available endpoints:")
        print("   POST /predict - Image classification")
        print("   GET  /health - Health check")
        print("   GET  /token-status - Token configuration status")
        print("   GET  /test-cors - CORS test endpoint")
        print("="*50)
        print("🔧 Simplified CORS Configuration:")
        print("   - Specific origins allowed")
        print("   - Essential methods only")
        print("   - Clean header handling")
        print("="*50)
        
        # Start server with debug mode for development
        port = int(os.environ.get("PORT", 5000))  # Get PORT from env, default 5000
        app.run(debug=False, host='0.0.0.0', port=port)
    else:
        print("❌ Server cannot start - model failed to load")
        print("\n📋 Setup Instructions:")
        print("1. Get your Hugging Face token:")
        print("   https://huggingface.co/settings/tokens")
        print("2. Set environment variable:")
        print("   export HUGGINGFACE_HUB_TOKEN='hf_your_token_here'")
        print("3. Restart the application")
        print("="*50)