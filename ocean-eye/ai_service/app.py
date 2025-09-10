import os
import requests
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration, CLIPProcessor, CLIPModel
from PIL import Image
import cv2
import numpy as np
import exifread
from flask import Flask, request, jsonify

# --- AI Model and Function Definitions ---

# --- Configuration ---
print("✅ AI Service: Setting up configuration...")
CLASSIFICATION_MODEL_NAME = "openai/clip-vit-large-patch14"
CAPTIONING_MODEL_NAME = "Salesforce/blip-image-captioning-large"
HAZARD_LABELS = [
    "a photo of a tsunami wave", "a photo of a cyclone or hurricane", "a photo of a storm surge",
    "a photo of high waves or swell surges", "a photo of a dangerous rip current", "a photo of the sea suddenly withdrawing",
    "a photo of an abnormally high tide", "a photo of an oil spill", "a photo of plastic waste in the ocean",
    "a photo of coastal erosion",
]
NORMAL_LABELS = ["a photo of a calm sea", "a photo of a normal beach"]
ALL_LABELS = HAZARD_LABELS + NORMAL_LABELS
RED_THRESHOLD = 0.70
YELLOW_THRESHOLD = 0.40
print("✅ AI Service: Configuration is set.")

# --- Load AI Models ---
print("\n✅ AI Service: Loading AI models... This may take a while.")
device = "cuda" if torch.cuda.is_available() else "cpu"
clip_model = CLIPModel.from_pretrained(CLASSIFICATION_MODEL_NAME).to(device)
clip_processor = CLIPProcessor.from_pretrained(CLASSIFICATION_MODEL_NAME)
blip_processor = BlipProcessor.from_pretrained(CAPTIONING_MODEL_NAME)
blip_model = BlipForConditionalGeneration.from_pretrained(CAPTIONING_MODEL_NAME).to(device)
print(f"✅ AI Service: All models successfully loaded onto device: {device.upper()}")

# --- Analysis and Scoring Functions (Your original Python code) ---
def generate_description(image, processor, model):
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=50)
    return processor.decode(out[0], skip_special_tokens=True)

def detect_hazards(image, labels, processor, model):
    inputs = processor(text=labels, images=image, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1).cpu().numpy()[0]
    return {label: prob for label, prob in zip(labels, probs)}

def calculate_danger_zone(hazard_scores):
    max_hazard_score = 0
    for label, score in hazard_scores.items():
        if label in HAZARD_LABELS and score > max_hazard_score:
            max_hazard_score = score
    
    if max_hazard_score > RED_THRESHOLD: return f"🔴 Red Zone (High Danger)", f"{max_hazard_score:.2%}"
    elif max_hazard_score > YELLOW_THRESHOLD: return f"🟡 Yellow Zone (Moderate Danger)", f"{max_hazard_score:.2%}"
    else: return f"🟢 Green Zone (Low Danger)", f"{max_hazard_score:.2%}"

def analyze_video(video_path, labels, frames_to_process=10):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return "Error: Could not open video file.", None
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = max(1, total_frames // frames_to_process)
    all_hazard_probs, descriptions = [], set()
    for frame_num in range(0, total_frames, frame_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        if ret:
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            all_hazard_probs.append(list(detect_hazards(pil_image, labels, clip_processor, clip_model).values()))
            if len(descriptions) < 3: descriptions.add(generate_description(pil_image, blip_processor, blip_model))
    cap.release()
    if not all_hazard_probs: return "Could not process any frames.", None
    avg_probs = np.mean(all_hazard_probs, axis=0)
    final_scores = {label: prob for label, prob in zip(labels, avg_probs)}
    return ". ".join(list(descriptions)).capitalize(), final_scores

# --- Flask Web Server ---
app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_media_endpoint():
    data = request.get_json()
    if not data or 'media_url' not in data:
        return jsonify({"error": "media_url not provided"}), 400

    media_url = data['media_url']
    media_type = data.get('media_type', 'image')
    file_path = "temp_media_file" # Temporary local filename

    try:
        response = requests.get(media_url, stream=True)
        response.raise_for_status()
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        results = {}
        if 'image' in media_type:
            image = Image.open(file_path).convert("RGB")
            description = generate_description(image, blip_processor, blip_model)
            hazard_scores = detect_hazards(image, ALL_LABELS, clip_processor, clip_model)
            danger_zone, score = calculate_danger_zone(hazard_scores)
            sorted_scores = sorted(hazard_scores.items(), key=lambda item: item[1], reverse=True)
            top_scores = {label: f"{prob:.2%}" for label, prob in sorted_scores[:5]}
            results = {"description": description, "danger_zone": danger_zone, "top_hazard_score": score, "hazard_analysis": top_scores}
        elif 'video' in media_type:
            description, hazard_scores = analyze_video(file_path, ALL_LABELS)
            if not hazard_scores:
                 return jsonify({"error": "Could not process video"}), 500
            danger_zone, score = calculate_danger_zone(hazard_scores)
            sorted_scores = sorted(hazard_scores.items(), key=lambda item: item[1], reverse=True)
            top_scores = {label: f"{prob:.2%}" for label, prob in sorted_scores[:5]}
            results = {"description": description, "danger_zone": danger_zone, "top_hazard_score": score, "hazard_analysis": top_scores}
        else:
            return jsonify({"error": "Unsupported media type"}), 400
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with the Node.js server
    app.run(host='0.0.0.0', port=5001)
