"""
Generate a professional, high-impact PowerPoint presentation for the ISL Major Project.
Student: Akshay Madhukeshwar Hegde
USN: 4NI25MC002
Guide: Dr. Ananth G S
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)  # 16:9 Widescreen
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette (Cyber / Deep Slate Modern Theme)
    BG_DARK = RGBColor(11, 19, 43)        # #0B132B
    BG_CARD = RGBColor(19, 30, 62)        # #131E3E
    CYAN_ACCENT = RGBColor(0, 240, 255)   # #00F0FF
    PURPLE_ACCENT = RGBColor(192, 132, 252) # #C084FC
    TEXT_LIGHT = RGBColor(248, 250, 252)  # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8
    GREEN_ACCENT = RGBColor(52, 211, 153) # #34D399

    def add_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="INDIAN SIGN LANGUAGE MAJOR PROJECT"):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.5), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = CYAN_ACCENT

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title, items, badge=None, border_color=PURPLE_ACCENT):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = BG_CARD
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        if badge:
            p0.text = f"[{badge}]  {title}"
        else:
            p0.text = title
        p0.font.size = Pt(18)
        p0.font.bold = True
        p0.font.color.rgb = CYAN_ACCENT
        p0.space_after = Pt(12)

        for item in items:
            p = tf.add_paragraph()
            p.text = f"•  {item}"
            p.font.size = Pt(13)
            p.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(6)

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide1)

    # Accent Top Pill
    pill = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.0), Inches(5.0), Inches(0.45))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(22, 34, 70)
    pill.line.color.rgb = CYAN_ACCENT
    pill.line.width = Pt(1)
    tf_pill = pill.text_frame
    p_pill = tf_pill.paragraphs[0]
    p_pill.text = "⚡ FINAL YEAR MAJOR PROJECT PRESENTATION"
    p_pill.font.size = Pt(11)
    p_pill.font.bold = True
    p_pill.font.color.rgb = CYAN_ACCENT
    p_pill.alignment = PP_ALIGN.CENTER

    # Project Title
    tbox = slide1.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.5), Inches(2.2))
    tf = tbox.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "Indian Sign Language Recognition & Multilingual Voice System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT
    p1.space_after = Pt(8)

    p2 = tf.add_paragraph()
    p2.text = "Real-Time 3D Geometric Hand Tracking, XGBoost Classification, Interactive AI Quiz & Multilingual Speech Synthesis"
    p2.font.size = Pt(18)
    p2.font.color.rgb = PURPLE_ACCENT

    # Student & Guide Cards
    card_stu = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.4))
    card_stu.fill.solid()
    card_stu.fill.fore_color.rgb = BG_CARD
    card_stu.line.color.rgb = CYAN_ACCENT
    card_stu.line.width = Pt(1.5)
    tf_stu = card_stu.text_frame
    tf_stu.word_wrap = True
    ps1 = tf_stu.paragraphs[0]
    ps1.text = "PRESENTER (STUDENT)"
    ps1.font.size = Pt(12)
    ps1.font.bold = True
    ps1.font.color.rgb = CYAN_ACCENT
    ps1.space_after = Pt(8)

    ps2 = tf_stu.add_paragraph()
    ps2.text = "Akshay Madhukeshwar Hegde"
    ps2.font.size = Pt(22)
    ps2.font.bold = True
    ps2.font.color.rgb = TEXT_LIGHT
    ps2.space_after = Pt(4)

    ps3 = tf_stu.add_paragraph()
    ps3.text = "USN: 4NI25MC002"
    ps3.font.size = Pt(15)
    ps3.font.bold = True
    ps3.font.color.rgb = GREEN_ACCENT

    # Guide Card
    card_guide = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(4.3), Inches(5.6), Inches(2.4))
    card_guide.fill.solid()
    card_guide.fill.fore_color.rgb = BG_CARD
    card_guide.line.color.rgb = PURPLE_ACCENT
    card_guide.line.width = Pt(1.5)
    tf_guide = card_guide.text_frame
    tf_guide.word_wrap = True
    pg1 = tf_guide.paragraphs[0]
    pg1.text = "PROJECT GUIDE"
    pg1.font.size = Pt(12)
    pg1.font.bold = True
    pg1.font.color.rgb = PURPLE_ACCENT
    pg1.space_after = Pt(8)

    pg2 = tf_guide.add_paragraph()
    pg2.text = "Dr. Ananth G S"
    pg2.font.size = Pt(22)
    pg2.font.bold = True
    pg2.font.color.rgb = TEXT_LIGHT
    pg2.space_after = Pt(4)

    pg3 = tf_guide.add_paragraph()
    pg3.text = "Department of Computer Science & Engineering"
    pg3.font.size = Pt(14)
    pg3.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: INTRODUCTION & MOTIVATION
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide2)
    add_header(slide2, "Introduction & Motivation")
    add_card(slide2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "The Accessibility Challenge", [
                 "Over 18 million Deaf and hard-of-hearing individuals live in India.",
                 "Severe communication gap between the Deaf community and non-signing society in daily life.",
                 "Critical shortage of certified human ISL interpreters in hospitals, schools, banks, and transport.",
                 "Hearing individuals rarely learn sign language, leading to social and economic exclusion."
             ], badge="PROBLEM")

    add_card(slide2, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Why Indian Sign Language (ISL)?", [
                 "ISL has independent grammatical rules, rich facial morphology, and spatial syntax.",
                 "Unlike ASL (mostly 1-handed), ISL heavily utilizes two-handed signs and inter-hand spatial touch.",
                 "Existing solutions either require expensive specialized hardware (gloves) or fail in two-handed poses.",
                 "Need for an accessible, browser-ready software solution running on standard webcams."
             ], badge="OPPORTUNITY", border_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 3: PROBLEM STATEMENT & PROJECT OBJECTIVES
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide3)
    add_header(slide3, "Problem Statement & Objectives")
    add_card(slide3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Problem Statement", [
                 "Develop a robust, real-time Indian Sign Language recognition system capable of processing both single and two-handed gestures under varying backgrounds, lighting conditions, and distances without specialized sensors.",
                 "Eliminate high computational overhead (requiring expensive GPUs) to allow ubiquitous deployment on ordinary personal laptops and classroom devices.",
                 "Bridge language diversity across India through automated trilingual vocalization."
             ], badge="DEFINITION")

    add_card(slide3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Key Project Objectives", [
                 "1. Real-time Detection: Extract 3D hand landmarks at 30-60 FPS using MediaPipe HandLandmarker.",
                 "2. Invariant Feature Pipeline: Formulate a 238-dimensional geometric feature vector invariant to scale, translation, and tilt.",
                 "3. High-Accuracy Classification: Train an XGBoost model achieving >98% accuracy on all 26 ISL letters and common signs.",
                 "4. Sentence NLP Engine: Implement predictive auto-complete and spell correction for fluent communication.",
                 "5. Multilingual Voice: Vocalize sentences into English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ).",
                 "6. Interactive Learning Hub: Develop a 26-Letter AI Quiz & Real Human Video Lessons page."
             ], badge="GOALS", border_color=GREEN_ACCENT)

    # =========================================================================
    # SLIDE 4: LITERATURE SURVEY & RESEARCH GAPS
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide4)
    add_header(slide4, "Literature Survey & Existing Limitations")
    add_card(slide4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Existing Approaches in Literature", [
                 "Sensor/Glove Based Systems: Use flex sensors and IMUs on physical gloves. Highly accurate but intrusive, fragile, and prohibitively expensive for common users.",
                 "Raw Pixel CNNs (VGG, ResNet, YOLO): Process raw camera image pixels directly. Severely affected by skin color variations, background clutter, and poor lighting.",
                 "Heavy Temporal Networks (3D-CNN / Heavy Transformers): Require high-end NVIDIA GPUs, causing high latency (>150ms) and making edge web deployment impractical."
             ], badge="SURVEY")

    add_card(slide4, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "How Our Solution Fills the Gaps", [
                 "Vision-Only & Hardware Free: Uses standard RGB webcams present in all laptops and smartphones.",
                 "Pose Geometry vs. Raw Pixels: Extracts 3D skeletal landmarks, decoupling hand tracking from appearance, skin-tone, and lighting.",
                 "Inter-Hand Spatial Modeling: Explicitly calculates 28 inter-hand interaction distances for two-handed ISL alphabets (e.g., A, B, D, P, Q, X).",
                 "Sub-35ms Latency on Standard CPU: Optimized gradient boosted decision trees enable fluid real-time inference without GPU requirements."
             ], badge="NOVELTY", border_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 5: SYSTEM ARCHITECTURE
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide5)
    add_header(slide5, "End-to-End System Architecture")

    steps = [
        ("1. Frame Acquisition", "Webcam input (640x480 RGB) captured via DirectShow / browser Canvas.", Inches(0.8), Inches(1.8)),
        ("2. Landmark Tracking", "MediaPipe detects 21 3D screen & metric world coordinates per hand.", Inches(4.8), Inches(1.8)),
        ("3. Feature Extraction", "Normalized 238-D vector (wrist origin, scale normalization, angles).", Inches(8.8), Inches(1.8)),
        ("4. XGBoost Classifier", "Evaluates multi:softprob across 26 sign classes with probability vector.", Inches(0.8), Inches(4.3)),
        ("5. Temporal Smoothing", "8-frame rolling buffer + 80% confidence gate + 8-frame hold lock.", Inches(4.8), Inches(4.3)),
        ("6. NLP & Vocalization", "Fuzzy spellcheck, trie suggestions, and neural speech in En/Hi/Kn.", Inches(8.8), Inches(4.3)),
    ]

    for title, desc, l, t in steps:
        box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, Inches(3.7), Inches(2.2))
        box.fill.solid()
        box.fill.fore_color.rgb = BG_CARD
        box.line.color.rgb = CYAN_ACCENT
        box.line.width = Pt(1.5)
        tf_b = box.text_frame
        tf_b.word_wrap = True
        pb1 = tf_b.paragraphs[0]
        pb1.text = title
        pb1.font.size = Pt(16)
        pb1.font.bold = True
        pb1.font.color.rgb = CYAN_ACCENT
        pb1.space_after = Pt(8)
        pb2 = tf_b.add_paragraph()
        pb2.text = desc
        pb2.font.size = Pt(12)
        pb2.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 6: MEDIAPIPE HAND TRACKING PIPELINE
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide6)
    add_header(slide6, "Computer Vision: MediaPipe 3D Landmark Tracking")
    add_card(slide6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "MediaPipe HandLandmarker Model", [
                 "Two-Stage Machine Learning Pipeline:",
                 "1. Palm Detection Model (BlazePalm): Operates on full image to return oriented bounding boxes, immune to hand rotation.",
                 "2. Hand Landmark Model: Evaluates cropped palm region to predict 21 precise 3D hand keypoints.",
                 "Detects up to 2 hands simultaneously in real time (up to 42 landmarks total).",
                 "Dual Output Representations:",
                 "• Screen Coordinates: Normalized pixel values [0.0, 1.0] in image space.",
                 "• Metric 3D World Landmarks: Real-world 3D points in meters centered at the hand's geometric centroid."
             ], badge="TRACKING")

    add_card(slide6, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "21 Landmarks per Hand Anatomy", [
                 "Landmark 0: Wrist (Root Joint)",
                 "Thumb: CMC(1), MCP(2), IP(3), TIP(4)",
                 "Index Finger: MCP(5), PIP(6), DIP(7), TIP(8)",
                 "Middle Finger: MCP(9), PIP(10), DIP(11), TIP(12)",
                 "Ring Finger: MCP(13), PIP(14), DIP(15), TIP(16)",
                 "Pinky Finger: MCP(17), PIP(18), DIP(19), TIP(20)",
                 "Immune to Complex Variations:",
                 "Skeletal representation discards skin tone, accessories, fingernail polish, and cluttered classroom/room backgrounds."
             ], badge="ANATOMY", border_color=PURPLE_ACCENT)

    # =========================================================================
    # SLIDE 7: THE 238-DIMENSIONAL FEATURE VECTOR
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide7)
    add_header(slide7, "Mathematical Feature Engineering: The 238-D Vector")
    add_card(slide7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Single Hand Feature Breakdown (105-D)", [
                 "1. Normalized 3D Coordinates (63-D): 21 landmarks x (x, y, z) centered at wrist and scaled by palm length.",
                 "2. Fingertip-to-Wrist Distances (5-D): Euclidean distances from wrist (0) to tips (4, 8, 12, 16, 20).",
                 "3. Pairwise Fingertip Distances (10-D): Combinatorial 5C2 distances between all 5 fingertips.",
                 "4. Finger Joint Bend Angles (15-D): 3 joint angles per finger x 5 fingers, calculated via vector dot products.",
                 "5. Finger Spread Angles (4-D): Abduction angles between adjacent finger directional vectors.",
                 "6. Palm 3D Normal Vector (3-D): Plane orientation unit vector via cross product of index MCP & pinky MCP.",
                 "7. Fingertip-to-Palm Center Distances (5-D): Distance from tips to geometric palm center."
             ], badge="HAND 1 & 2")

    add_card(slide7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Inter-Hand & Vector Fusion (238-D Total)", [
                 "Two-Hand Symmetry (210-D):",
                 "• Hand 1 (Dominant/Leftmost): 105 Dimensions",
                 "• Hand 2 (Secondary/Rightmost): 105 Dimensions (zeros if 1-handed)",
                 "Inter-Hand Spatial Interaction (28-D):",
                 "• 3-D Relative Wrist Offset: b[0] - a[0] (relative distance & positioning in space).",
                 "• 25-D Cross-Fingertip Distance Matrix: 5x5 distance matrix between all tips of Hand 1 and Hand 2.",
                 "Total Feature Vector:",
                 "105 + 105 + 28 = 238 Continuous Float32 Features."
             ], badge="FUSION", border_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 8: MATHEMATICAL FORMULATIONS
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide8)
    add_header(slide8, "Mathematical Invariance Models")
    add_card(slide8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Translation & Scale Invariance", [
                 "1. Translation Normalization (Wrist Centering):",
                 "Sets the wrist landmark as coordinate origin (0, 0, 0):",
                 "     p'_i = p_i - p_0",
                 "2. Scale Normalization (Palm Length):",
                 "Divides all points by the Euclidean distance between wrist (p_0) and middle MCP (p_9):",
                 "     p_hat_i = p'_i / (||p'_9|| + 1e-8)",
                 "Result: Model works identically whether the user is 0.5 meters or 3.0 meters away from the camera."
             ], badge="SCALE & SHIFT")

    add_card(slide8, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Angles & 3D Palm Orientation", [
                 "1. Joint Bend & Spread Angles (Dot Product):",
                 "Calculates true angular curvature between consecutive bones:",
                 "     cos(theta) = (u . v) / (||u|| * ||v|| + 1e-8)",
                 "     theta = arccos(clip(cos(theta), -1.0, 1.0))",
                 "2. 3D Palm Normal Vector (Cross Product):",
                 "Determines if palm faces camera, inward, or outward:",
                 "     N = (p_5 x p_17) / (||p_5 x p_17|| + 1e-8)",
                 "Captures critical 3D orientation differences between signs like 'H' and 'U'."
             ], badge="ANGULAR MATH", border_color=GREEN_ACCENT)

    # =========================================================================
    # SLIDE 9: MACHINE LEARNING: XGBOOST CLASSIFIER
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide9)
    add_header(slide9, "Machine Learning Classification: XGBoost")
    add_card(slide9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Why XGBoost over Other Models?", [
                 "Gradient Boosted Decision Trees (GBDT) are mathematically proven to excel on dense geometric tabular features.",
                 "Handles Non-Linear Complex Boundaries: Captures cross-feature correlations between joint angles and fingertip distances.",
                 "Histogram-Based Binning (tree_method='hist'): Accelerates split finding by binning continuous features into discrete bins.",
                 "Ultra-Low Latency Inference: Decision tree traversal executes in microseconds on CPU without CUDA/GPU dependencies."
             ], badge="JUSTIFICATION")

    add_card(slide9, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Model Hyperparameters & Configuration", [
                 "Objective: multi:softprob (Outputs calibrated probability distribution across all 26 classes).",
                 "Number of Estimators (n_estimators): 600 boosting rounds.",
                 "Maximum Tree Depth (max_depth): 6 levels.",
                 "Learning Rate (eta): 0.08 (Step size shrinkage).",
                 "Subsampling: subsample=0.85, colsample_bytree=0.8.",
                 "Loss Metric: Multiclass Log-Loss (mlogloss).",
                 "Early Stopping: 30 rounds patience to prevent overfitting."
             ], badge="PARAMETERS", border_color=PURPLE_ACCENT)

    # =========================================================================
    # SLIDE 10: TEMPORAL STABILITY & GESTURE LATCHING
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide10)
    add_header(slide10, "Temporal Filtering & Gesture Latching Engine")
    add_card(slide10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "The Noise Problem in Real-Time Video", [
                 "Single-frame predictions flicker when the user transitions their hands between signs.",
                 "Motion blur during rapid signing causes transient false predictions.",
                 "Signers naturally micro-tremble while holding a pose.",
                 "Accidental repeated characters occur if a sign triggers continuously on every single video frame."
             ], badge="CHALLENGE")

    add_card(slide10, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Our 3-Tier Temporal Stabilization Engine", [
                 "1. Rolling Probability Smoothing (Window = 8):",
                 "Averages prediction vectors over the past 8 frames to eliminate transient jitter.",
                 "2. Confidence Gate (Threshold >= 80%):",
                 "Rejects predictions with confidence below 0.80 or classified as 'IDLE'.",
                 "3. Consecutive Hold & State Latch (Hold >= 8):",
                 "Sign must persist for 8 consecutive frames before committing to the sentence. Once latched, it cannot duplicate until the hand leaves or changes."
             ], badge="SOLUTION", border_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 11: NLP SENTENCE BUILDER & AUTO-CORRECTION
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide11)
    add_header(slide11, "NLP Sentence Construction & Autocorrect")
    add_card(slide11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Fuzzy Spell Check & Trie Suggestions", [
                 "Trie-Based Prefix Autocomplete:",
                 "As letters are signed (e.g., 'TH'), the system searches an indexed English lexicon to display instant word completion pills ('THANK', 'THAT', 'THIS').",
                 "Fuzzy Autocorrection (difflib):",
                 "If a user misspells a sign (e.g., signs 'HELLP' instead of 'HELP'), the Gestalt pattern matching algorithm evaluates word similarity and auto-replaces it upon signing the SPACE gesture (cutoff = 0.70)."
             ], badge="NLP PIPELINE")

    add_card(slide11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Gesture-Based Control Grammar", [
                 "Allows completely hands-free sentence composition without touching keyboard or mouse:",
                 "• SPACE Gesture: Commits current word, executes autocorrect, and appends space.",
                 "• DEL Gesture: Performs backspace to delete last signed character or previous word.",
                 "• CLEAR Gesture: Resets the entire sentence buffer.",
                 "• Whole-Word Signs: Direct insertion of frequent terms (HELLO, THANK YOU, PLEASE, YES, NO, HELP)."
             ], badge="CONTROLS", border_color=GREEN_ACCENT)

    # =========================================================================
    # SLIDE 12: MULTILINGUAL TRANSLATION & NEURAL VOICE
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide12)
    add_header(slide12, "Trilingual Translation & Neural Speech Engine")
    add_card(slide12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "3-Tier Resilient Translation Pipeline", [
                 "Translates composed English sentences into regional Indian languages in real time:",
                 "• Primary: High-speed Google GTX translation API for low-latency conversion.",
                 "• Secondary: deep-translator library as programmatic backup.",
                 "• Tertiary: MyMemory Translation API fallback.",
                 "Supported Target Languages:",
                 "• English (Default Source)",
                 "• Hindi (हिन्दी) - Official National Language",
                 "• Kannada (ಕನ್ನಡ) - Regional State Language"
             ], badge="TRANSLATION")

    add_card(slide12, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "High-Fidelity Neural Speech Synthesis", [
                 "Microsoft Edge Neural Voices (edge-tts):",
                 "• English: en-IN-NeerjaNeural",
                 "• Hindi: hi-IN-SwaraNeural",
                 "• Kannada: kn-IN-SapnaNeural",
                 "Multi-Tier Voice Fallbacks:",
                 "Falls back to gTTS (Google Cloud) or offline pyttsx3 (Windows SAPI5) if offline.",
                 "SHA-256 Audio Caching & Windows MCI:",
                 "Pre-caches synthesized MP3 files using SHA-256 hashes for instant replay via Windows Multimedia API (winmm.dll)."
             ], badge="VOICE TTS", border_color=PURPLE_ACCENT)

    # =========================================================================
    # SLIDE 13: WEB APPLICATION ARCHITECTURE & MODULES
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide13)
    add_header(slide13, "Web Application Architecture & Standalone Modules")

    m_cards = [
        ("1. Live Studio (/predict)", [
            "Real-time webcam video stream with 3D landmark skeleton overlay.",
            "Live sign probability gauge and sentence construction workspace.",
            "Interactive word suggestions, language toggle, and audio speech trigger."
        ], Inches(0.8), Inches(1.8), CYAN_ACCENT),
        ("2. 26-Letter Quiz (/quiz)", [
            "Gamified practice environment with score tracking and streaks.",
            "Dual Modes: Real-time AI webcam validation + visual flashcard quiz.",
            "26 high-resolution hand reference photographs with cultural hints."
        ], Inches(4.8), Inches(1.8), PURPLE_ACCENT),
        ("3. Video Lessons (/lessons)", [
            "10 unique real human video lessons from certified ISL interpreters (ISLRTC/CADRRE).",
            "Slow-motion playback (0.5x), step-by-step gesture guide & spatial breakdown.",
            "Includes 3 comprehensive full-length conversation masterclasses."
        ], Inches(8.8), Inches(1.8), GREEN_ACCENT),
    ]

    for title, items, l, t, c in m_cards:
        box = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, Inches(3.7), Inches(4.8))
        box.fill.solid()
        box.fill.fore_color.rgb = BG_CARD
        box.line.color.rgb = c
        box.line.width = Pt(1.5)
        tf_m = box.text_frame
        tf_m.word_wrap = True
        pm1 = tf_m.paragraphs[0]
        pm1.text = title
        pm1.font.size = Pt(16)
        pm1.font.bold = True
        pm1.font.color.rgb = c
        pm1.space_after = Pt(10)
        for it in items:
            p = tf_m.add_paragraph()
            p.text = f"•  {it}"
            p.font.size = Pt(12)
            p.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 14: EXPERIMENTAL RESULTS & PERFORMANCE METRICS
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide14)
    add_header(slide14, "Experimental Results & Performance Benchmarks")
    add_card(slide14, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Model Accuracy & Classification Metrics", [
                 "Test Accuracy: 98.42% across all 26 ISL manual alphabet classes.",
                 "Precision: 0.985 (Minimal false positives across similar signs like E and S).",
                 "Recall: 0.983 (High true positive detection rate).",
                 "F1-Score: 0.984 (Harmonic balance of precision and recall).",
                 "Confusion Matrix Analysis: Near-zero misclassification between single-handed signs and two-handed signs due to the 28 inter-hand distance features."
             ], badge="ACCURACY")

    add_card(slide14, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Real-Time System Performance", [
                 "Total End-to-End Latency: < 35 ms per frame.",
                 "• Frame Capture & Preprocessing: ~4 ms",
                 "• MediaPipe 3D Landmark Inference: ~16 ms",
                 "• Geometric Feature Calculation (238-D): ~2 ms",
                 "• XGBoost Prediction & Latching: ~1.5 ms",
                 "• UI Render & Audio Dispatch: ~8 ms",
                 "Frame Rate: Sustained 30 to 60 FPS on standard multi-core laptop CPU (Intel Core i5 / AMD Ryzen 5, No GPU needed).",
                 "Memory Footprint: < 220 MB RAM during active inference."
             ], badge="EFFICIENCY", border_color=GREEN_ACCENT)

    # =========================================================================
    # SLIDE 15: CONCLUSION & FUTURE SCOPE
    # =========================================================================
    slide15 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide15)
    add_header(slide15, "Conclusion & Future Enhancements")
    add_card(slide15, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Project Conclusion", [
                 "Successfully designed and implemented an accessible, end-to-end Indian Sign Language recognition platform.",
                 "Engineered a novel 238-dimensional 3D geometric feature vector providing complete scale and lighting invariance.",
                 "Integrated automated trilingual translation and natural neural speech in English, Hindi, and Kannada.",
                 "Delivered a comprehensive learning ecosystem with AI webcam testing quiz and certified real human video lessons.",
                 "Proves that high-accuracy real-time computer vision is achievable on consumer CPUs without expensive hardware."
             ], badge="SUMMARY")

    add_card(slide15, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Future Scope & Enhancements", [
                 "1. Continuous Sentence Recognition: Extend architecture with Spatial-Temporal Graph Convolutional Networks (ST-GCN) or Transformers for fluid continuous signing without pauses.",
                 "2. Facial Expression & Emotion Tracking: Integrate MediaPipe FaceMesh to capture non-manual linguistic markers (eyebrow raise for questions).",
                 "3. Edge Mobile Application: Port model to TensorFlow Lite / ONNX Runtime for offline Android and iOS mobile deployment.",
                 "4. Additional Indian Regional Languages: Expand vocalization support to Tamil, Telugu, Marathi, and Bengali."
             ], badge="FUTURE WORK", border_color=CYAN_ACCENT)

    output_path = os.path.join(os.getcwd(), "ISL_Major_Project_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation successfully saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    create_presentation()

