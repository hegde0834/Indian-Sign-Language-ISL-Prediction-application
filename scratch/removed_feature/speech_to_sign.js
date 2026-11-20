/**
 * =============================================================================
 * ISL Major Project – High-Clarity 3D Sign Avatar Controller
 * Reverse Speech-to-Sign Engine with 3D Motion Keyframe Dataset
 * =============================================================================
 * - Large, prominent, crystal-clear 3D Articulated Humanoid Avatar
 * - Full 21-Joint Dual-Hand Tracking (Right=Cyan Dominant, Left=Purple Base)
 * - 10 Core Project Phrases with 3D Kinematic Keyframes
 * - Compound Sentence Sequencer (e.g. "Hello how are you" -> [Hello, How are you])
 * - Live Motion Phase & Step Tracker
 * - Trilingual Audio Synthesis (English, Hindi, Kannada)
 * =============================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. 3D MOTION KEYFRAME DATASET (10 ISL Everyday Phrases)
  // ---------------------------------------------------------------------------
  const MOTION_DATASET = [
    {
      id: 1,
      key: 'hello_namaste',
      youtube_id: 'y1dFFm6Q0jk',
      video: '/assets/videos/phrase_1.mp4',
      poster: '/assets/videos/phrase_1_thumb.jpg',
      instructor: 'NCERT Official ISL Demonstrator',
      phrase: 'Hello / Namaste',
      category: 'Greeting',
      translations: {
        en: 'Hello / Welcome',
        hi: 'नमस्ते / नमस्कार',
        kn: 'ನಮಸ್ಕಾರ / ಸುಸ್ವಾಗತ'
      },
      keywords: [
        'hello', 'namaste', 'namaskar', 'hi', 'hey', 'welcome', 'greeting', 'greetings', 'namaskara',
        'नमस्ते', 'नमस्कार', 'प्रणाम', 'ಹಲೋ', 'ನಮಸ್ಕಾರ', 'ಸುಸ್ವಾಗತ', 'ಹಾಯ್'
      ],
      components: {
        handshape: 'Flat Open Palms (B-handshape, fingers together, thumbs aligned)',
        location: 'Center of Chest / Sternum (Midline)',
        movement: 'Symmetrical bilateral lift towards midline, gentle hold',
        expression: 'Warm smile with a 15-degree polite forward head bow'
      },
      steps: [
        'Raise both hands to mid-chest height with open flat palms facing one another.',
        'Bring palms and fingers together smoothly at the sternum in a Namaste posture.',
        'Gently tilt head forward with a warm, respectful facial expression.'
      ],
      cultural_note: 'In Indian Sign Language, Namaste is both an informal greeting and a universal mark of respect when welcoming guests, elders, and community members.',
      keyframes: [
        { name: '1. Raise Palms to Chest', duration: 700, rArm: { sx: -0.65, sy: 0.35, sz: 0.45, el: 1.45 }, lArm: { sx: -0.65, sy: -0.35, sz: -0.45, el: 1.45 }, rHand: 'B-flat', lHand: 'B-flat', head: { pitch: 0.05, brows: 'neutral' } },
        { name: '2. Namaste Prayer Posture', duration: 1400, rArm: { sx: -0.75, sy: 0.55, sz: 0.55, el: 1.85 }, lArm: { sx: -0.75, sy: -0.55, sz: -0.55, el: 1.85 }, rHand: 'prayer', lHand: 'prayer', head: { pitch: 0.28, brows: 'smile' } },
        { name: '3. Polite Respectful Bow', duration: 1100, rArm: { sx: -0.75, sy: 0.55, sz: 0.55, el: 1.85 }, lArm: { sx: -0.75, sy: -0.55, sz: -0.55, el: 1.85 }, rHand: 'prayer', lHand: 'prayer', head: { pitch: 0.35, brows: 'smile' } },
        { name: '4. Graceful Return to Rest', duration: 700, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 2,
      key: 'thank_you',
      youtube_id: 'Cgw3QD4TyZg',
      video: '/assets/videos/phrase_2.mp4',
      poster: '/assets/videos/phrase_2_thumb.jpg',
      instructor: 'Talking Hands India Human Signer',
      phrase: 'Thank You',
      category: 'Courtesy',
      translations: {
        en: 'Thank You',
        hi: 'धन्यवाद / शुक्रिया',
        kn: 'ಧನ್ಯವಾದಗಳು'
      },
      keywords: [
        'thank you', 'thanks', 'thank', 'dhanyavad', 'shukriya', 'gratitude', 'thanku',
        'धन्यवाद', 'शुक्रिया', 'ಧನ್ಯವಾದಗಳು', 'ಧನ್ಯವಾದ', 'ಥ್ಯಾಂಕ್ಸ್'
      ],
      components: {
        handshape: 'Flat Palm, fingers together (Dominant Right Hand)',
        location: 'Chin / Lower Lip to Forward Neutral Space',
        movement: 'Forward and downward sweeping arc toward listener',
        expression: 'Appreciative smile with an affirmative nod'
      },
      steps: [
        'Place fingertips of dominant flat right hand lightly against your chin or lower lip.',
        'Glide hand smoothly forward and slightly downward in a graceful arc toward listener.',
        'Nod head affirmatively with a grateful, polite facial expression.'
      ],
      cultural_note: 'Used universally across Indian deaf communities to express appreciation, relief, and polite closure.',
      keyframes: [
        { name: '1. Touch Fingertips to Chin', duration: 750, rArm: { sx: -0.92, sy: 0.15, sz: 0.32, el: 2.15 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'B-flat', lHand: 'relaxed', head: { pitch: 0.06, brows: 'neutral' } },
        { name: '2. Sweep Forward Arc to Listener', duration: 1300, rArm: { sx: -0.42, sy: 0.18, sz: 0.25, el: 0.85 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'B-flat', lHand: 'relaxed', head: { pitch: 0.22, brows: 'smile' } },
        { name: '3. Affirmative Grateful Nod', duration: 900, rArm: { sx: -0.42, sy: 0.18, sz: 0.25, el: 0.85 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'B-flat', lHand: 'relaxed', head: { pitch: 0.32, brows: 'smile' } },
        { name: '4. Return to Rest', duration: 600, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 3,
      key: 'how_are_you',
      youtube_id: 'sLqdPipf1UM',
      video: '/assets/videos/phrase_3.mp4',
      poster: '/assets/videos/phrase_3_thumb.jpg',
      instructor: 'Nagendra Nayak (ISL Certified)',
      phrase: 'How Are You?',
      category: 'Conversation',
      translations: {
        en: 'How are you?',
        hi: 'आप कैसे हैं?',
        kn: 'ನೀವು ಹೇಗಿದ್ದೀರಾ?'
      },
      keywords: [
        'how are you', 'how are u', 'how r u', 'how do you do', 'aap kaise hain',
        'kaisa hai', 'kya haal hai', 'neevu hegiddeera', 'hegiddira', 'hegidiya',
        'ನೀವು ಹೇಗಿದ್ದೀರಾ', 'ಹೇಗಿದ್ದೀರಾ', 'ನೀವು ಹೇಗಿದ್ದೀರಿ', 'आप कैसे हैं', 'कैसा है', 'क्या हाल है'
      ],
      components: {
        handshape: 'Thumbs-Up Fists transitioning to Dominant Index Point',
        location: 'Mid-Chest to Forward Line of Sight',
        movement: 'Outward bilateral wrist roll + Forward directional point',
        expression: 'Inquisitive raised eyebrows with slight head tilt'
      },
      steps: [
        'Hold both hands as closed fists with thumbs pointing upward at chest height.',
        'Rotate wrists outward so thumbs roll forward and palms face upward.',
        'Point dominant index finger forward toward the person with inquiring raised eyebrows.'
      ],
      cultural_note: 'Facial grammar is critical in ISL questions: raised eyebrows signal an open wellness inquiry.',
      keyframes: [
        { name: '1. Bilateral Thumbs-Up at Chest', duration: 750, rArm: { sx: -0.58, sy: 0.24, sz: 0.34, el: 1.5 }, lArm: { sx: -0.58, sy: -0.24, sz: -0.34, el: 1.5 }, rHand: 'thumbs-up', lHand: 'thumbs-up', head: { pitch: -0.06, brows: 'raised' } },
        { name: '2. Roll Palms Upward', duration: 750, rArm: { sx: -0.45, sy: 0.32, sz: 0.38, el: 1.3 }, lArm: { sx: -0.45, sy: -0.32, sz: -0.38, el: 1.3 }, rHand: 'open-palms', lHand: 'open-palms', head: { pitch: 0.0, brows: 'raised' } },
        { name: '3. Point Forward at Viewer (YOU)', duration: 1400, rArm: { sx: -0.72, sy: 0.06, sz: 0.16, el: 0.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'point', lHand: 'relaxed', head: { pitch: 0.1, roll: 0.08, brows: 'raised' } },
        { name: '4. Inquiring Wellness Hold', duration: 900, rArm: { sx: -0.72, sy: 0.06, sz: 0.16, el: 0.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'point', lHand: 'relaxed', head: { pitch: 0.15, roll: 0.12, brows: 'raised' } },
        { name: '5. Return to Rest', duration: 600, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 4,
      key: 'i_am_fine',
      youtube_id: 'VtbYvVDItvg',
      video: '/assets/videos/phrase_4.mp4',
      poster: '/assets/videos/phrase_4_thumb.jpg',
      instructor: 'Pragya Gupta (ISL 101 Sign Medium)',
      phrase: 'I Am Fine',
      category: 'Conversation',
      translations: {
        en: 'I am fine / Doing well',
        hi: 'मैं ठीक हूँ',
        kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ'
      },
      keywords: [
        'i am fine', 'im fine', 'i am good', 'fine', 'doing well', 'all good',
        'theek hoon', 'sab theek', 'chennagi iddene', 'chennagidene',
        'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', 'ಚೆನ್ನಾಗಿದ್ದೀನಿ', 'मैं ठीक हूँ', 'सब ठीक है', 'ठीक हूँ'
      ],
      components: {
        handshape: 'Dominant Thumbs-Up Fist (A-hand with upright thumb)',
        location: 'Upper Sternum / Chest',
        movement: 'Double gentle rhythmic tap against chest',
        expression: 'Confident smile and steady affirmative head nod'
      },
      steps: [
        'Form a clear thumbs-up gesture with your dominant right hand.',
        'Tap your thumb lightly against your upper chest twice in a calm cadence.',
        'Nod your head affirmatively with a relaxed, confident facial smile.'
      ],
      cultural_note: 'Shows reassurance and positive wellness in Indian deaf conversations.',
      keyframes: [
        { name: '1. First Chest Tap', duration: 650, rArm: { sx: -0.72, sy: 0.34, sz: 0.24, el: 1.85 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'thumbs-up', lHand: 'relaxed', head: { pitch: 0.14, brows: 'smile' } },
        { name: '2. Rebound Space', duration: 400, rArm: { sx: -0.58, sy: 0.3, sz: 0.28, el: 1.6 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'thumbs-up', lHand: 'relaxed', head: { pitch: 0.05, brows: 'smile' } },
        { name: '3. Second Chest Tap', duration: 850, rArm: { sx: -0.74, sy: 0.34, sz: 0.24, el: 1.88 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'thumbs-up', lHand: 'relaxed', head: { pitch: 0.22, brows: 'smile' } },
        { name: '4. Confident Affirmation', duration: 750, rArm: { sx: -0.74, sy: 0.34, sz: 0.24, el: 1.88 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'thumbs-up', lHand: 'relaxed', head: { pitch: 0.26, brows: 'smile' } },
        { name: '5. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 5,
      key: 'what_is_your_name',
      youtube_id: 'gtEjG8cLMro',
      video: '/assets/videos/phrase_5.mp4',
      poster: '/assets/videos/phrase_5_thumb.jpg',
      instructor: 'CADRRE Certified Master Signer',
      phrase: 'What Is Your Name?',
      category: 'Introduction',
      translations: {
        en: 'What is your name?',
        hi: 'आपका नाम क्या है?',
        kn: 'ನಿಮ್ಮ ಹೆಸರೇನು?'
      },
      keywords: [
        'what is your name', 'whats your name', 'what is ur name', 'your name',
        'aapka naam kya hai', 'nimma hesaru enu', 'hesarenu',
        'ನಿಮ್ಮ ಹೆಸರೇನು', 'ನಿಮ್ಮ ಹೆಸರು ಏನು', 'आपका नाम क्या है', 'तुम्हारा नाम क्या है'
      ],
      components: {
        handshape: 'Index Point (YOU) -> H-handshape (NAME) -> Open palms (WHAT)',
        location: 'Forward Line of Sight & Mid-Chest',
        movement: 'Directional point -> Horizontal sweep -> Open hands shrug',
        expression: 'Questioning expression with furrowed brow and head cock'
      },
      steps: [
        'Point dominant index finger forward directly at the person (YOU).',
        'Extend index and middle fingers together (H-handshape) and sweep horizontally across chest (NAME).',
        'Hold hands out with open palms slightly upward, tilting head with questioning lowered brows (WHAT).'
      ],
      cultural_note: 'In the Indian Deaf Community, asking for someone’s name is often followed by asking for their sign name.',
      keyframes: [
        { name: '1. Point Forward (YOU)', duration: 750, rArm: { sx: -0.72, sy: 0.06, sz: 0.16, el: 0.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'point', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } },
        { name: '2. Sweep Across Chest (NAME)', duration: 850, rArm: { sx: -0.65, sy: 0.42, sz: 0.32, el: 1.6 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'H-name', lHand: 'relaxed', head: { pitch: 0.05, brows: 'furrowed' } },
        { name: '3. Open Palms Shrug (WHAT?)', duration: 1200, rArm: { sx: -0.45, sy: 0.35, sz: 0.42, el: 1.2 }, lArm: { sx: -0.45, sy: -0.35, sz: -0.42, el: 1.2 }, rHand: 'open-palms', lHand: 'open-palms', head: { pitch: 0.1, roll: 0.12, brows: 'furrowed' } },
        { name: '4. Inquiring Question Hold', duration: 800, rArm: { sx: -0.45, sy: 0.35, sz: 0.42, el: 1.2 }, lArm: { sx: -0.45, sy: -0.35, sz: -0.42, el: 1.2 }, rHand: 'open-palms', lHand: 'open-palms', head: { pitch: 0.14, roll: 0.15, brows: 'furrowed' } },
        { name: '5. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 6,
      key: 'my_name_is',
      youtube_id: 'OK7ppVdau8M',
      video: '/assets/videos/phrase_6.mp4',
      poster: '/assets/videos/phrase_6_thumb.jpg',
      instructor: 'Bumper Clap (ISL 25 Words Signer)',
      phrase: 'My Name Is...',
      category: 'Introduction',
      translations: {
        en: 'My name is...',
        hi: 'मेरा नाम ... है',
        kn: 'ನನ್ನ ಹೆಸರು...'
      },
      keywords: [
        'my name is', 'my name', 'myself', 'mera naam', 'mera naam hai',
        'nanna hesaru', 'ನನ್ನ ಹೆಸರು', 'मेरा नाम'
      ],
      components: {
        handshape: 'Flat Open Hand (MY) -> H-handshape (NAME)',
        location: 'Center of Chest / Sternum',
        movement: 'Chest tap -> Horizontal sweep -> Forward presentation',
        expression: 'Friendly, proud, engaged direct eye contact'
      },
      steps: [
        'Touch your dominant flat open hand to your chest to sign "MY / ME".',
        'Extend index and middle fingers together and sweep across the chest to sign "NAME".',
        'Hold hands in a welcoming presentation posture ready for name fingerspelling.'
      ],
      cultural_note: 'Hearing learners typically introduce themselves by signing "My Name Is" followed by manual fingerspelling.',
      keyframes: [
        { name: '1. Touch Chest (MY / ME)', duration: 750, rArm: { sx: -0.7, sy: 0.26, sz: 0.26, el: 1.9 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'B-flat', lHand: 'relaxed', head: { pitch: 0.08, brows: 'smile' } },
        { name: '2. Two Fingers Sweep (NAME)', duration: 850, rArm: { sx: -0.65, sy: 0.38, sz: 0.32, el: 1.6 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'H-name', lHand: 'relaxed', head: { pitch: 0.0, brows: 'smile' } },
        { name: '3. Forward Presentation Pose', duration: 1100, rArm: { sx: -0.52, sy: 0.18, sz: 0.32, el: 1.3 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'B-flat', lHand: 'relaxed', head: { pitch: 0.06, brows: 'smile' } },
        { name: '4. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 7,
      key: 'nice_to_meet_you',
      youtube_id: 'Ucp5a38GXMM',
      video: '/assets/videos/phrase_7.mp4',
      poster: '/assets/videos/phrase_7_thumb.jpg',
      instructor: 'CADRRE Certified ISL Educators',
      phrase: 'Nice To Meet You',
      category: 'Courtesy',
      translations: {
        en: 'Nice to meet you',
        hi: 'आपसे मिलकर खुशी हुई',
        kn: 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ'
      },
      keywords: [
        'nice to meet you', 'glad to meet you', 'pleasure meeting you', 'pleasure to meet you',
        'aapse milkar accha laga', 'aapse milkar khushi hui', 'bhetiyagiddu santosho',
        'ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ', 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ', 'आपसे मिलकर खुशी हुई'
      ],
      components: {
        handshape: 'Flat open palms transitioning to bilateral index fingers',
        location: 'Mid-Chest Front Space',
        movement: 'Linear palm glide (NICE) -> Index fingers converge (MEET) -> Point (YOU)',
        expression: 'Warm, sincere smiling face with slight head bow'
      },
      steps: [
        'Hold non-dominant hand palm-up; glide dominant open palm across it from heel to fingers (NICE).',
        'Raise both index fingers pointing upward and bring them together until knuckles touch (MEET).',
        'Point dominant index finger forward toward the person (YOU) with a warm smile.'
      ],
      cultural_note: 'Conveys genuine pleasure in forming a communication link between deaf and hearing worlds.',
      keyframes: [
        { name: '1. Glide Across Palm (NICE)', duration: 800, rArm: { sx: -0.65, sy: 0.24, sz: 0.28, el: 1.5 }, lArm: { sx: -0.55, sy: -0.18, sz: -0.24, el: 1.4 }, rHand: 'B-flat', lHand: 'flat-base', head: { pitch: 0.08, brows: 'smile' } },
        { name: '2. Index Fingers Meet (MEET)', duration: 900, rArm: { sx: -0.62, sy: 0.35, sz: 0.45, el: 1.6 }, lArm: { sx: -0.62, sy: -0.35, sz: -0.45, el: 1.6 }, rHand: 'point', lHand: 'point', head: { pitch: 0.06, brows: 'smile' } },
        { name: '3. Point Forward (YOU)', duration: 1100, rArm: { sx: -0.72, sy: 0.06, sz: 0.16, el: 0.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'point', lHand: 'relaxed', head: { pitch: 0.14, brows: 'smile' } },
        { name: '4. Cordial Smile Hold', duration: 750, rArm: { sx: -0.72, sy: 0.06, sz: 0.16, el: 0.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'point', lHand: 'relaxed', head: { pitch: 0.18, brows: 'smile' } },
        { name: '5. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 8,
      key: 'please_help_me',
      youtube_id: 'CaWC4P765V8',
      video: '/assets/videos/phrase_8.mp4',
      poster: '/assets/videos/phrase_8_thumb.jpg',
      instructor: 'Goa Board of Education ISL Signer',
      phrase: 'Please Help Me',
      category: 'Emergency / Need',
      translations: {
        en: 'Please help me',
        hi: 'कृपया मेरी मदद करें',
        kn: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ'
      },
      keywords: [
        'please help me', 'help me', 'help', 'please help', 'assist me',
        'madat karo', 'kripya madad karein', 'sahaya madi', 'dayavittu sahaya madi',
        'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ', 'ಸಹಾಯ ಮಾಡಿ', 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ', 'मदद करो', 'कृपया मेरी मदद करें'
      ],
      components: {
        handshape: 'Flat base palm (Left) + Thumbs-up fist (Right)',
        location: 'Lower Abdomen moving upward to Upper Sternum',
        movement: 'Directional upward and inward lifting motion',
        expression: 'Earnest, pleading expression with attentive eyes'
      },
      steps: [
        'Place non-dominant left hand flat with palm facing upward as a supportive platform.',
        'Form a fist with dominant right hand (thumb up) and rest it on the open left palm.',
        'Lift both hands upward and move them inward toward your chest (HELP ME).'
      ],
      cultural_note: 'ISL verbs are directional: moving inward means "help me", while moving outward means "I help you".',
      keyframes: [
        { name: '1. Rest Fist on Base Palm', duration: 700, rArm: { sx: -0.56, sy: 0.18, sz: 0.28, el: 1.5 }, lArm: { sx: -0.5, sy: -0.18, sz: -0.28, el: 1.4 }, rHand: 'thumbs-up', lHand: 'flat-base', head: { pitch: 0.06, brows: 'furrowed' } },
        { name: '2. Upward Lifting Motion (HELP)', duration: 1100, rArm: { sx: -0.74, sy: 0.22, sz: 0.32, el: 1.85 }, lArm: { sx: -0.68, sy: -0.22, sz: -0.32, el: 1.75 }, rHand: 'thumbs-up', lHand: 'flat-base', head: { pitch: 0.16, brows: 'raised' } },
        { name: '3. Point Toward Self (ME)', duration: 900, rArm: { sx: -0.66, sy: 0.24, sz: 0.24, el: 1.9 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'point', lHand: 'relaxed', head: { pitch: 0.18, brows: 'smile' } },
        { name: '4. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 9,
      key: 'where_is_washroom',
      youtube_id: 'SwGIw2creRA',
      video: '/assets/videos/phrase_9.mp4',
      poster: '/assets/videos/phrase_9_thumb.jpg',
      instructor: 'Deaf Enabled Foundation (DEF)',
      phrase: 'Washroom / Toilet',
      category: 'Everyday Essential',
      translations: {
        en: 'Where is the washroom / toilet?',
        hi: 'शौचालय कहाँ है?',
        kn: 'ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?'
      },
      keywords: [
        'where is washroom', 'where is the washroom', 'washroom', 'toilet', 'restroom',
        'bathroom', 'where is toilet', 'where is bathroom', 'shauchalay', 'toilet ellide',
        'washroom ellide', 'ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ', 'ಶೌಚಾಲಯ', 'ಬಾತ್ರೂಮ್ ಎಲ್ಲಿದೆ',
        'शौचालय कहाँ है', 'बाथरूम कहाँ है', 'शौचालय'
      ],
      components: {
        handshape: 'W-Handshape (Index, Middle, Ring up) or T-Handshape',
        location: 'Chest Level Signing Space',
        movement: 'Side-to-side gentle wrist oscillation -> Open palm shrug',
        expression: 'Inquiring expression, questioning raised eyebrows'
      },
      steps: [
        'Form the "W" handshape (index, middle, and ring fingers extended) with your dominant hand.',
        'Shake the hand gently side-to-side 2–3 times at chest height.',
        'Open both hands palms-up in a questioning manner with inquiring raised eyebrows (WHERE?).'
      ],
      cultural_note: 'Vital sign for independent navigation in public buildings, colleges, and transit stations across India.',
      keyframes: [
        { name: '1. Form W-Handshape', duration: 600, rArm: { sx: -0.66, sy: 0.24, sz: 0.34, el: 1.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'W-washroom', lHand: 'relaxed', head: { pitch: 0.0, brows: 'raised' } },
        { name: '2. Oscillate Side-to-Side', duration: 1100, rArm: { sx: -0.66, sy: 0.24, sz: 0.34, el: 1.65 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'W-washroom', lHand: 'relaxed', head: { pitch: 0.05, roll: 0.09, brows: 'raised' } },
        { name: '3. Open Palms Question (WHERE?)', duration: 1100, rArm: { sx: -0.45, sy: 0.34, sz: 0.38, el: 1.2 }, lArm: { sx: -0.45, sy: -0.34, sz: -0.38, el: 1.2 }, rHand: 'open-palms', lHand: 'open-palms', head: { pitch: 0.1, roll: 0.12, brows: 'raised' } },
        { name: '4. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    },
    {
      id: 10,
      key: 'good_morning_bye',
      youtube_id: 'L37McuHckSI',
      video: '/assets/videos/phrase_10.mp4',
      poster: '/assets/videos/phrase_10_thumb.jpg',
      instructor: 'ISLRTC (Govt. of India Official)',
      phrase: 'Good Morning / Bye',
      category: 'Daily Greeting',
      translations: {
        en: 'Good Morning / Goodbye',
        hi: 'शुभ प्रभात / अलविदा',
        kn: 'ಶುಭೋದಯ / ಹೋಗಿ ಬರುತ್ತೇನೆ'
      },
      keywords: [
        'good morning', 'good bye', 'goodbye', 'bye', 'bye bye', 'morning', 'farewell',
        'subhodaya', 'shubh prabhat', 'alvida', 'tata',
        'ಶುಭೋದಯ', 'ಬೈ ಬೈ', 'ಬೈ', 'ಹೋಗಿ ಬರುತ್ತೇನೆ', 'शुभ प्रभात', 'अलविदा', 'बाय'
      ],
      components: {
        handshape: 'Flat hand (GOOD) -> Rising Sun -> Open 5-Hand waving',
        location: 'Chin to Mid-Chest to Head Height',
        movement: 'Forward extension -> Upward arc -> Horizontal waving',
        expression: 'Cheerful bright morning expression or warm farewell smile'
      },
      steps: [
        'Touch dominant hand fingers to chin and extend forward smoothly (GOOD).',
        'Hold hand rising upward like the sun rising in the sky (MORNING).',
        'Raise dominant open hand beside head and wave palm smoothly side-to-side (BYE).'
      ],
      cultural_note: 'Departures in deaf culture are warm and lingering, accompanied by reassuring waves.',
      keyframes: [
        { name: '1. Touch Chin (GOOD)', duration: 800, rArm: { sx: -0.76, sy: 0.18, sz: 0.3, el: 1.7 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'B-flat', lHand: 'relaxed', head: { pitch: 0.08, brows: 'smile' } },
        { name: '2. Rise Upward (MORNING)', duration: 900, rArm: { sx: -1.12, sy: 0.16, sz: 0.48, el: 1.3 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'open-palms', lHand: 'relaxed', head: { pitch: -0.06, brows: 'smile' } },
        { name: '3. Smooth Wave Beside Head (BYE)', duration: 1300, rArm: { sx: -1.22, sy: 0.14, sz: 0.55, el: 1.2 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'open-wave', lHand: 'relaxed', head: { pitch: 0.05, brows: 'smile' } },
        { name: '4. Farewell Hold', duration: 750, rArm: { sx: -1.22, sy: 0.14, sz: 0.55, el: 1.2 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'open-wave', lHand: 'relaxed', head: { pitch: 0.1, brows: 'smile' } },
        { name: '5. Return to Rest', duration: 550, rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 }, lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 }, rHand: 'relaxed', lHand: 'relaxed', head: { pitch: 0.0, brows: 'neutral' } }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // 2. APPLICATION STATE
  // ---------------------------------------------------------------------------
  const state = {
    phrases: MOTION_DATASET,
    currentPhrase: MOTION_DATASET[0],
    viewMode: 'human', // 'human' (Real Certified Human Signer) or 'avatar' (Realistic 3D Human Avatar)
    speedMultiplier: 1.0,
    isListening: false,
    recognition: null,
    selectedLang: 'en-IN',
    isAnimating: false,
    activeSequence: [],
    sequenceIndex: 0,
    currentStepIndex: 0
  };

  // ---------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // ---------------------------------------------------------------------------
  const dom = {
    micBtn: document.getElementById('s2sMicBtn'),
    micIcon: document.getElementById('micIcon'),
    micStatusText: document.getElementById('micStatusText'),
    langSelect: document.getElementById('s2sLangSelect'),
    textInput: document.getElementById('s2sTextInput'),
    btnTranslate: document.getElementById('btnTranslate'),
    btnClearText: document.getElementById('btnClearText'),
    transcriptIndicator: document.getElementById('transcriptIndicator'),
    feedbackIcon: document.getElementById('feedbackIcon'),
    matchMsg: document.getElementById('matchMsg'),
    quickChipsContainer: document.getElementById('quickChipsContainer'),
    currentPhraseTitle: document.getElementById('currentPhraseTitle'),
    currentCategoryPill: document.getElementById('currentCategoryPill'),
    speedBtns: document.querySelectorAll('.speed-btn, .speed-pill'),
    btnReplaySign: document.getElementById('btnReplaySign'),
    btnResetCamera: document.getElementById('btnResetCamera'),
    avatarCanvas: document.getElementById('avatarCanvas'),
    humanPlayerWrap: document.getElementById('humanPlayerWrap'),
    humanVideoIframe: document.getElementById('humanVideoIframe'),
    realHumanVideo: document.getElementById('realHumanVideo'),
    humanInstructorBadge: document.getElementById('humanInstructorBadge'),
    humanInstructorName: document.getElementById('humanInstructorName'),
    btnModeHuman: document.getElementById('btnModeHuman'),
    btnModeAvatar: document.getElementById('btnModeAvatar'),
    hudOrbitHint: document.getElementById('hudOrbitHint'),
    hudActionTag: document.getElementById('hudActionTag'),
    hudPhraseText: document.getElementById('hudPhraseText'),
    hudSequenceTracker: document.getElementById('hudSequenceTracker'),
    seqChipsRow: document.getElementById('seqChipsRow'),
    trackerCurrentStepText: document.getElementById('trackerCurrentStepText'),
    stepCounterText: document.getElementById('stepCounterText'),
    stepProgressFill: document.getElementById('stepProgressFill'),
    stepBadgesRow: document.getElementById('stepBadgesRow'),
    tagEnglish: document.getElementById('tagEnglish'),
    tagHindi: document.getElementById('tagHindi'),
    tagKannada: document.getElementById('tagKannada'),
    btnAudioEn: document.getElementById('btnAudioEn'),
    btnAudioHi: document.getElementById('btnAudioHi'),
    btnAudioKn: document.getElementById('btnAudioKn'),
    compHandshape: document.getElementById('compHandshape'),
    compLocation: document.getElementById('compLocation'),
    compMovement: document.getElementById('compMovement'),
    compExpression: document.getElementById('compExpression'),
    guideStepsList: document.getElementById('guideStepsList'),
    culturalNoteText: document.getElementById('culturalNoteText')
  };

  // ---------------------------------------------------------------------------
  // 4. NATURAL LANGUAGE / COMPOUND PHRASE PARSER ("Hello how are you")
  // ---------------------------------------------------------------------------
  function parseInputToPhrases(inputText) {
    if (!inputText || !inputText.trim()) return [];
    const text = inputText.toLowerCase().replace(/[?,.!/\\-]/g, ' ').replace(/\s+/g, ' ').trim();

    const candidates = [];
    MOTION_DATASET.forEach(phrase => {
      phrase.keywords.forEach(kw => {
        const kwLower = kw.toLowerCase();
        let pos = text.indexOf(kwLower);
        while (pos !== -1) {
          candidates.push({
            pos: pos,
            len: kwLower.length,
            phrase: phrase
          });
          pos = text.indexOf(kwLower, pos + 1);
        }
      });
    });

    // Sort by position in sentence, then longest match
    candidates.sort((a, b) => a.pos - b.pos || b.len - a.len);

    const matchedPhrases = [];
    const usedRanges = [];
    candidates.forEach(cand => {
      const overlaps = usedRanges.some(r => !(cand.pos + cand.len <= r.start || cand.pos >= r.end));
      if (!overlaps) {
        usedRanges.push({ start: cand.pos, end: cand.pos + cand.len });
        matchedPhrases.push(cand.phrase);
      }
    });

    if (matchedPhrases.length === 0) {
      return [MOTION_DATASET[0]];
    }
    return matchedPhrases;
  }


  // ---------------------------------------------------------------------------
  // 4B. PRESENTATION MODE CONTROLLER (Real Human Signer vs 3D Human Avatar)
  // ---------------------------------------------------------------------------
  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'human') {
      if (dom.btnModeHuman) dom.btnModeHuman.classList.add('active');
      if (dom.btnModeAvatar) dom.btnModeAvatar.classList.remove('active');
      if (dom.humanPlayerWrap) dom.humanPlayerWrap.style.display = 'flex';
      if (dom.avatarCanvas) dom.avatarCanvas.style.display = 'none';
      if (dom.btnResetCamera) dom.btnResetCamera.style.display = 'none';
      if (dom.hudOrbitHint) dom.hudOrbitHint.style.display = 'none';

      // Play authentic human demonstration
      playHumanVideoForCurrent();
    } else {
      if (dom.btnModeAvatar) dom.btnModeAvatar.classList.add('active');
      if (dom.btnModeHuman) dom.btnModeHuman.classList.remove('active');
      if (dom.humanPlayerWrap) dom.humanPlayerWrap.style.display = 'none';
      if (dom.avatarCanvas) dom.avatarCanvas.style.display = 'block';
      if (dom.btnResetCamera) dom.btnResetCamera.style.display = 'inline-flex';
      if (dom.hudOrbitHint) dom.hudOrbitHint.style.display = 'inline-flex';

      // Pause human video and trigger realistic 3D human avatar
      if (dom.realHumanVideo) dom.realHumanVideo.pause();
      if (state.currentPhrase) {
        playPhraseAnimation(state.currentPhrase);
      }
    }
  }

  function playHumanVideoForCurrent(onComplete) {
    if (!state.currentPhrase) return;
    const p = state.currentPhrase;
    if (dom.humanInstructorName) {
      dom.humanInstructorName.textContent = p.instructor || 'Certified ISL Demonstrator';
    }

    // 1. If humanVideoIframe exists, embed authentic certified human video
    if (dom.humanVideoIframe && p.youtube_id) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${p.youtube_id}?rel=0&modestbranding=1&autoplay=1`;
      if (dom.humanVideoIframe.src !== embedUrl) {
        dom.humanVideoIframe.src = embedUrl;
      }
    }

    // 2. Fallback / local video if present
    if (dom.realHumanVideo) {
      const videoSrc = p.video || `/assets/videos/phrase_${p.id}.mp4`;
      if (!dom.realHumanVideo.src.endsWith(videoSrc.replace(/^\//, ''))) {
        dom.realHumanVideo.src = videoSrc;
        if (p.poster) dom.realHumanVideo.poster = p.poster;
        dom.realHumanVideo.load();
      }
      dom.realHumanVideo.playbackRate = state.speedMultiplier;
      dom.realHumanVideo.currentTime = 0;
      dom.realHumanVideo.play().catch(() => {});
    }

    if (onComplete) {
      setTimeout(onComplete, 3500 / state.speedMultiplier);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. TRANSLATE TO SIGN TRIGGER & AUTO-NAVIGATE TO 3D ANIMATION
  // ---------------------------------------------------------------------------
  function scrollTo3DStage() {
    const stage = document.getElementById('stageViewport') || document.querySelector('.s2s-theater-section');
    if (stage) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      stage.classList.add('stage-highlight-pulse');
      setTimeout(() => stage.classList.remove('stage-highlight-pulse'), 1400);
    }
  }

  function handleTranslateClick() {
    const raw = dom.textInput ? dom.textInput.value.trim() : '';
    if (!raw) {
      if (dom.matchMsg) {
        dom.matchMsg.innerHTML = '⚠️ Please speak into the mic or type a phrase (e.g. <em>"Hello how are you"</em>) first!';
      }
      return;
    }

    const sequence = parseInputToPhrases(raw);
    if (sequence.length === 0) return;

    if (dom.feedbackIcon) dom.feedbackIcon.textContent = '✨';
    if (dom.matchMsg) {
      const phraseNames = sequence.map(p => `<strong>${p.phrase}</strong>`).join(' ➔ ');
      dom.matchMsg.innerHTML = `✅ Translating <strong>"${raw}"</strong> to 3D Sign Sequence: ${phraseNames} (Showing 3D Animation below ↓)`;
    }

    // Smoothly scroll down to 3D stage and play animation
    scrollTo3DStage();
    playPhraseSequence(sequence);
  }

  // ---------------------------------------------------------------------------
  // 6. SEQUENCE PLAYBACK CONTROLLER
  // ---------------------------------------------------------------------------
  function playPhraseSequence(sequence) {
    if (!sequence || sequence.length === 0) return;
    state.activeSequence = sequence;
    state.sequenceIndex = 0;

    // Show sequence tracker if multiple phrases
    if (sequence.length > 1) {
      if (dom.hudSequenceTracker) dom.hudSequenceTracker.hidden = false;
      if (dom.seqChipsRow) {
        dom.seqChipsRow.innerHTML = sequence.map((p, idx) => `
          <span class="seq-chip ${idx === 0 ? 'active' : ''}" id="seqChip_${idx}">
            ${idx + 1}. ${p.phrase}
          </span>
        `).join('');
      }
    } else {
      if (dom.hudSequenceTracker) dom.hudSequenceTracker.hidden = true;
    }

    playNextInSequence();
  }

  function playNextInSequence() {
    if (state.sequenceIndex >= state.activeSequence.length) {
      state.isAnimating = false;
      if (dom.hudActionTag) {
        dom.hudActionTag.textContent = '● SIGN COMPLETE';
        dom.hudActionTag.style.color = '#10b981';
      }
      return;
    }

    const current = state.activeSequence[state.sequenceIndex];
    state.currentPhrase = current;

    // Update sequence chips
    if (dom.seqChipsRow) {
      const chips = dom.seqChipsRow.querySelectorAll('.seq-chip');
      chips.forEach((c, i) => {
        if (i === state.sequenceIndex) c.classList.add('active');
        else c.classList.remove('active');
      });
    }

    // Update Linguistic UI
    updateLinguisticUI(current);
    updateActiveChip(current.key);

    if (dom.hudActionTag) {
      dom.hudActionTag.textContent = `● SIGNING (${state.sequenceIndex + 1}/${state.activeSequence.length})`;
      dom.hudActionTag.style.color = '#00f0ff';
    }

    populateStepBadges(current);

    if (state.viewMode === 'human') {
      // Play Real Human Video
      playHumanVideoForCurrent(() => {
        state.sequenceIndex++;
        if (state.sequenceIndex < state.activeSequence.length) {
          setTimeout(playNextInSequence, 350 / state.speedMultiplier);
        } else {
          state.isAnimating = false;
          if (dom.hudActionTag) {
            dom.hudActionTag.textContent = '● SIGN COMPLETE';
            dom.hudActionTag.style.color = '#10b981';
          }
        }
      });
    } else {
      // Play 3D Human Avatar Animation
      playPhraseAnimation(current, () => {
        state.sequenceIndex++;
        if (state.sequenceIndex < state.activeSequence.length) {
          setTimeout(playNextInSequence, 400 / state.speedMultiplier);
        } else {
          state.isAnimating = false;
          if (dom.hudActionTag) {
            dom.hudActionTag.textContent = '● SIGN COMPLETE';
            dom.hudActionTag.style.color = '#10b981';
          }
        }
      });
    }
  }

  function populateStepBadges(phrase) {
    if (!dom.stepBadgesRow || !phrase.keyframes) return;
    dom.stepBadgesRow.innerHTML = phrase.keyframes.map((kf, idx) => `
      <span class="step-badge-pill ${idx === 0 ? 'active' : ''}" id="stepBadge_${idx}">
        ${kf.name}
      </span>
    `).join('');
  }

  function updateStepProgress(stepIndex, totalSteps, stepName) {
    state.currentStepIndex = stepIndex;
    if (dom.trackerCurrentStepText) {
      dom.trackerCurrentStepText.textContent = stepName;
    }
    if (dom.stepCounterText) {
      dom.stepCounterText.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
    }
    if (dom.stepProgressFill) {
      const pct = Math.round(((stepIndex + 1) / totalSteps) * 100);
      dom.stepProgressFill.style.width = `${pct}%`;
    }
    if (dom.stepBadgesRow) {
      const badges = dom.stepBadgesRow.querySelectorAll('.step-badge-pill');
      badges.forEach((b, idx) => {
        if (idx === stepIndex) b.classList.add('active');
        else b.classList.remove('active');
      });
    }
  }

  function updateLinguisticUI(phrase) {
    if (dom.currentPhraseTitle) dom.currentPhraseTitle.textContent = phrase.phrase;
    if (dom.currentCategoryPill) dom.currentCategoryPill.textContent = phrase.category;
    if (dom.hudPhraseText) dom.hudPhraseText.textContent = phrase.phrase;
    if (dom.humanInstructorName && phrase.instructor) dom.humanInstructorName.textContent = phrase.instructor;

    if (phrase.translations) {
      if (dom.tagEnglish) dom.tagEnglish.textContent = phrase.translations.en || phrase.phrase;
      if (dom.tagHindi) dom.tagHindi.textContent = phrase.translations.hi || '';
      if (dom.tagKannada) dom.tagKannada.textContent = phrase.translations.kn || '';
    }

    if (phrase.components) {
      if (dom.compHandshape) dom.compHandshape.textContent = phrase.components.handshape || 'Standard';
      if (dom.compLocation) dom.compLocation.textContent = phrase.components.location || 'Center Chest';
      if (dom.compMovement) dom.compMovement.textContent = phrase.components.movement || 'Symmetric Dynamic';
      if (dom.compExpression) dom.compExpression.textContent = phrase.components.expression || 'Engaged';
    }

    if (dom.guideStepsList && phrase.steps) {
      dom.guideStepsList.innerHTML = phrase.steps.map(s => `<li>${s}</li>`).join('');
    }

    if (dom.culturalNoteText) {
      dom.culturalNoteText.textContent = phrase.cultural_note || '';
    }
  }

  function updateActiveChip(key) {
    if (!dom.quickChipsContainer) return;
    const chips = dom.quickChipsContainer.querySelectorAll('.quick-chip');
    chips.forEach(chip => {
      if (chip.getAttribute('data-key') === key) {
        chip.classList.add('active');
        chip.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. HIGH-CLARITY LARGE 3D AVATAR RENDERING ENGINE
  // ---------------------------------------------------------------------------
  const avatarEngine = {
    canvas: null,
    ctx: null,
    width: 960,
    height: 520,
    currentPose: {
      rArm: { sx: 0.1, sy: 0.0, sz: -0.2, el: 0.35 },
      lArm: { sx: 0.1, sy: 0.0, sz: 0.2, el: 0.35 },
      rHand: 'relaxed',
      lHand: 'relaxed',
      head: { pitch: 0.0, yaw: 0.0, roll: 0.0, brows: 'neutral' }
    },
    targetPose: null,
    fromPose: null,
    animStartTime: 0,
    animDuration: 600,
    idleTime: 0,
    camRotX: 0,
    camRotY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,

    init: function () {
      this.canvas = dom.avatarCanvas;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.setupCanvasSize();
      this.setupMouseControls();

      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
      console.log('[ISL 3D] Large High-Clarity Articulated Avatar Active.');
    },

    setupCanvasSize: function () {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width > 400 ? rect.width : 960;
      this.height = rect.height > 300 ? rect.height : 520;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      window.addEventListener('resize', () => {
        if (!this.canvas || !this.canvas.parentElement) return;
        const r = this.canvas.parentElement.getBoundingClientRect();
        this.width = r.width;
        this.height = r.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      });
    },

    setupMouseControls: function () {
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.camRotY += dx * 0.005;
        this.camRotX = Math.max(-0.35, Math.min(0.35, this.camRotX + dy * 0.005));
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.lastMouseX = e.touches[0].clientX;
          this.lastMouseY = e.touches[0].clientY;
        }
      });

      window.addEventListener('touchmove', (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        this.camRotY += dx * 0.006;
        this.camRotX = Math.max(-0.35, Math.min(0.35, this.camRotX + dy * 0.006));
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    },

    resetCamera: function () {
      this.camRotX = 0;
      this.camRotY = 0;
    },

    transitionToPose: function (target, durationMs) {
      this.fromPose = JSON.parse(JSON.stringify(this.currentPose));
      this.targetPose = target;
      this.animStartTime = performance.now();
      this.animDuration = durationMs;
    },

    animate: function (timestamp) {
      requestAnimationFrame(this.animate);
      this.idleTime += 0.025;

      if (this.targetPose) {
        const elapsed = (timestamp - this.animStartTime) * state.speedMultiplier;
        const progress = Math.min(1.0, elapsed / this.animDuration);
        // Smooth Cubic Easing
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.interpolatePose(this.fromPose, this.targetPose, ease);

        if (progress >= 1.0) {
          this.targetPose = null;
        }
      }

      this.render();
    },

    interpolatePose: function (from, to, t) {
      const lerp = (a, b) => a + (b - a) * t;

      if (from.rArm && to.rArm) {
        this.currentPose.rArm.sx = lerp(from.rArm.sx, to.rArm.sx);
        this.currentPose.rArm.sy = lerp(from.rArm.sy, to.rArm.sy);
        this.currentPose.rArm.sz = lerp(from.rArm.sz, to.rArm.sz);
        this.currentPose.rArm.el = lerp(from.rArm.el, to.rArm.el);
      }
      if (from.lArm && to.lArm) {
        this.currentPose.lArm.sx = lerp(from.lArm.sx, to.lArm.sx);
        this.currentPose.lArm.sy = lerp(from.lArm.sy, to.lArm.sy);
        this.currentPose.lArm.sz = lerp(from.lArm.sz, to.lArm.sz);
        this.currentPose.lArm.el = lerp(from.lArm.el, to.lArm.el);
      }
      if (from.head && to.head) {
        this.currentPose.head.pitch = lerp(from.head.pitch, to.head.pitch);
        this.currentPose.head.yaw = lerp(from.head.yaw || 0, to.head.yaw || 0);
        this.currentPose.head.roll = lerp(from.head.roll || 0, to.head.roll || 0);
        this.currentPose.head.brows = to.head.brows || 'neutral';
      }
      this.currentPose.rHand = to.rHand || from.rHand;
      this.currentPose.lHand = to.lHand || from.lHand;
    },

    // -------------------------------------------------------------------------
    // LARGE HIGH-DEFINITION 3D RENDERING
    // -------------------------------------------------------------------------
    render: function () {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      // Studio Ambient Glow
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2 - 40, 80, w / 2, h / 2, w * 0.7);
      bgGrad.addColorStop(0, '#0e1c3b');
      bgGrad.addColorStop(0.55, '#070f20');
      bgGrad.addColorStop(1, '#02050c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Studio Floor Stage Rings
      ctx.save();
      ctx.translate(w / 2, h * 0.9);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, 360, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 260, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // PROJECTION CONSTANTS (Avatar fills stage comfortably)
      const cx = w / 2;
      const cy = h / 2 + 125;
      const scale = Math.min(w, h) * 1.34;
      const dist = 1.78;

      const project = (x, y, z) => {
        const cosY = Math.cos(this.camRotY);
        const sinY = Math.sin(this.camRotY);
        const cosX = Math.cos(this.camRotX);
        const sinX = Math.sin(this.camRotX);

        let x1 = x * cosY + z * sinY;
        let y1 = y;
        let z1 = -x * sinY + z * cosY;

        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        const fov = 1.0 / (dist + z2);
        return {
          px: cx + x2 * scale * fov,
          py: cy - y2 * scale * fov,
          pz: z2,
          fov: fov
        };
      };

      const breathe = Math.sin(this.idleTime * 1.6) * 0.012;

      // 1. Torso Center Anchor Points
      const torsoTop = project(0, 0.28 + breathe, 0);
      const torsoBot = project(0, -0.42 + breathe, 0);

      // Draw Professional Dark Navy Interpreter Shirt
      ctx.save();
      const shirtGrad = ctx.createLinearGradient(torsoTop.px, torsoTop.py, torsoBot.px, torsoBot.py);
      shirtGrad.addColorStop(0, '#1c293d');
      shirtGrad.addColorStop(0.6, '#131e2e');
      shirtGrad.addColorStop(1, '#0b111a');

      ctx.fillStyle = shirtGrad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;

      const tWidthTop = 155 * torsoTop.fov;
      const tWidthBot = 110 * torsoBot.fov;

      ctx.beginPath();
      ctx.moveTo(torsoTop.px - tWidthTop, torsoTop.py);
      ctx.lineTo(torsoTop.px + tWidthTop, torsoTop.py);
      ctx.lineTo(torsoBot.px + tWidthBot, torsoBot.py);
      ctx.lineTo(torsoBot.px - tWidthBot, torsoBot.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shirt Collar & Placket (Professional Interpreter Attire)
      ctx.fillStyle = '#263750';
      ctx.beginPath();
      ctx.moveTo(torsoTop.px - 36 * torsoTop.fov, torsoTop.py);
      ctx.lineTo(torsoTop.px, torsoTop.py + 44 * torsoTop.fov);
      ctx.lineTo(torsoTop.px + 36 * torsoTop.fov, torsoTop.py);
      ctx.closePath();
      ctx.fill();

      // Collar Fold Lines
      ctx.strokeStyle = '#384d6c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(torsoTop.px - 36 * torsoTop.fov, torsoTop.py);
      ctx.lineTo(torsoTop.px, torsoTop.py + 44 * torsoTop.fov);
      ctx.lineTo(torsoTop.px + 36 * torsoTop.fov, torsoTop.py);
      ctx.stroke();

      // Shirt Buttons
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(torsoTop.px, torsoTop.py + 62 * torsoTop.fov, 3.5 * torsoTop.fov, 0, Math.PI * 2);
      ctx.arc(torsoTop.px, torsoTop.py + 86 * torsoTop.fov, 3.5 * torsoTop.fov, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Head & Neck (Realistic Human Features)
      const headPitch = this.currentPose.head.pitch || 0;
      const headRoll = this.currentPose.head.roll || 0;
      const neckP = project(0, 0.42 + breathe, 0.02);
      const headP = project(0 + headRoll * 0.12, 0.68 + breathe - headPitch * 0.12, 0.05 + headPitch * 0.18);

      // Realistic Human Neck (Natural Warm Skin Tone)
      const neckGrad = ctx.createLinearGradient(neckP.px - 20 * neckP.fov, neckP.py, neckP.px + 20 * neckP.fov, neckP.py);
      neckGrad.addColorStop(0, '#e5b08e');
      neckGrad.addColorStop(0.5, '#f7d3ba');
      neckGrad.addColorStop(1, '#d89b78');

      ctx.strokeStyle = neckGrad;
      ctx.lineWidth = 36 * neckP.fov;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(neckP.px, neckP.py);
      ctx.lineTo(headP.px, headP.py);
      ctx.stroke();

      // Human Ears (Left & Right)
      const earRadius = 14 * headP.fov;
      const headRadius = 60 * headP.fov;
      ctx.fillStyle = '#e8b290';
      ctx.beginPath();
      ctx.ellipse(headP.px - headRadius * 0.98, headP.py + 4 * headP.fov, earRadius * 0.55, earRadius, 0, 0, Math.PI * 2);
      ctx.ellipse(headP.px + headRadius * 0.98, headP.py + 4 * headP.fov, earRadius * 0.55, earRadius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Human Head & Face (Natural Skin Tone)
      const skinGrad = ctx.createRadialGradient(
        headP.px - 10 * headP.fov, headP.py - 14 * headP.fov, 8 * headP.fov,
        headP.px, headP.py, headRadius
      );
      skinGrad.addColorStop(0, '#ffe5d4');
      skinGrad.addColorStop(0.4, '#fcd2b6');
      skinGrad.addColorStop(0.85, '#e4ab89');
      skinGrad.addColorStop(1, '#c88663');

      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.arc(headP.px, headP.py, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Soft Jaw & Chin Contour
      ctx.strokeStyle = 'rgba(180, 100, 65, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Natural Styled Human Hair (Dark Brown / Black Hair with Volume)
      ctx.save();
      const hairGrad = ctx.createLinearGradient(headP.px, headP.py - headRadius - 10, headP.px, headP.py);
      hairGrad.addColorStop(0, '#1c130b');
      hairGrad.addColorStop(0.6, '#2a1c11');
      hairGrad.addColorStop(1, '#3b2819');
      ctx.fillStyle = hairGrad;

      ctx.beginPath();
      ctx.arc(headP.px, headP.py - 10 * headP.fov, headRadius * 1.05, Math.PI * 0.92, Math.PI * 2.08);
      ctx.bezierCurveTo(
        headP.px + headRadius * 0.7, headP.py - headRadius * 0.35,
        headP.px - headRadius * 0.3, headP.py - headRadius * 0.5,
        headP.px - headRadius * 0.98, headP.py - headRadius * 0.15
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Human Eyebrows (Expressive & Natural)
      const brows = this.currentPose.head.brows;
      const eyeY = headP.py - 2 * headP.fov;
      ctx.strokeStyle = '#22160d';
      ctx.lineWidth = 4 * headP.fov;
      ctx.lineCap = 'round';

      ctx.beginPath();
      if (brows === 'raised') {
        // Raised eyebrows for inquiry (e.g. "How Are You?")
        ctx.arc(headP.px - 18 * headP.fov, eyeY - 17 * headP.fov, 13 * headP.fov, Math.PI * 1.15, Math.PI * 1.85);
        ctx.arc(headP.px + 18 * headP.fov, eyeY - 17 * headP.fov, 13 * headP.fov, Math.PI * 1.15, Math.PI * 1.85);
      } else if (brows === 'furrowed') {
        ctx.moveTo(headP.px - 28 * headP.fov, eyeY - 15 * headP.fov);
        ctx.lineTo(headP.px - 8 * headP.fov, eyeY - 8 * headP.fov);
        ctx.moveTo(headP.px + 8 * headP.fov, eyeY - 8 * headP.fov);
        ctx.lineTo(headP.px + 28 * headP.fov, eyeY - 15 * headP.fov);
      } else {
        // Natural arched polite eyebrows
        ctx.arc(headP.px - 18 * headP.fov, eyeY - 12 * headP.fov, 13 * headP.fov, Math.PI * 1.18, Math.PI * 1.82);
        ctx.arc(headP.px + 18 * headP.fov, eyeY - 12 * headP.fov, 13 * headP.fov, Math.PI * 1.18, Math.PI * 1.82);
      }
      ctx.stroke();

      // Realistic Human Eyes (Sclera + Iris + Pupil + Catchlight)
      const drawHumanEye = (eyeX, eyeYPos) => {
        // 1. White Sclera
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(100, 60, 40, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeYPos, 10 * headP.fov, 6.5 * headP.fov, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Clip to eye socket
        ctx.clip();

        // 2. Deep Warm Brown Iris
        const irisGrad = ctx.createRadialGradient(eyeX, eyeYPos, 1.5 * headP.fov, eyeX, eyeYPos, 5.5 * headP.fov);
        irisGrad.addColorStop(0, '#5a3821');
        irisGrad.addColorStop(0.7, '#382213');
        irisGrad.addColorStop(1, '#1e1108');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(eyeX, eyeYPos, 5.5 * headP.fov, 0, Math.PI * 2);
        ctx.fill();

        // 3. Black Pupil
        ctx.fillStyle = '#0a0604';
        ctx.beginPath();
        ctx.arc(eyeX, eyeYPos, 2.6 * headP.fov, 0, Math.PI * 2);
        ctx.fill();

        // 4. White Light Reflection Catchlight (Life-like Gaze)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX - 1.6 * headP.fov, eyeYPos - 1.8 * headP.fov, 1.3 * headP.fov, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Upper Eyelash Line
        ctx.strokeStyle = '#22140c';
        ctx.lineWidth = 2.5 * headP.fov;
        ctx.beginPath();
        ctx.arc(eyeX, eyeYPos - 2 * headP.fov, 10 * headP.fov, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      };

      drawHumanEye(headP.px - 18 * headP.fov, eyeY);
      drawHumanEye(headP.px + 18 * headP.fov, eyeY);

      // Human Nose (Soft Natural Shading)
      const noseY = headP.py + 10 * headP.fov;
      ctx.strokeStyle = '#d6926f';
      ctx.lineWidth = 2.2 * headP.fov;
      ctx.beginPath();
      ctx.moveTo(headP.px - 1.5 * headP.fov, eyeY + 4 * headP.fov);
      ctx.lineTo(headP.px - 3.5 * headP.fov, noseY);
      ctx.lineTo(headP.px + 3.5 * headP.fov, noseY);
      ctx.stroke();

      // Nostril Accents
      ctx.fillStyle = '#b76d49';
      ctx.beginPath();
      ctx.arc(headP.px - 5 * headP.fov, noseY + 0.5 * headP.fov, 1.6 * headP.fov, 0, Math.PI * 2);
      ctx.arc(headP.px + 5 * headP.fov, noseY + 0.5 * headP.fov, 1.6 * headP.fov, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Human Mouth & Lips (Warm Rosy Tone, Polite Smile)
      const mouthY = headP.py + 26 * headP.fov;
      ctx.save();
      // Upper Lip
      ctx.fillStyle = '#bf685e';
      ctx.beginPath();
      ctx.moveTo(headP.px - 14 * headP.fov, mouthY);
      ctx.quadraticCurveTo(headP.px, mouthY - 3.5 * headP.fov, headP.px + 14 * headP.fov, mouthY);
      ctx.quadraticCurveTo(headP.px, mouthY + 1.5 * headP.fov, headP.px - 14 * headP.fov, mouthY);
      ctx.fill();

      // Lower Lip (Full & Healthy)
      ctx.fillStyle = '#d3796f';
      ctx.beginPath();
      ctx.moveTo(headP.px - 13 * headP.fov, mouthY);
      ctx.quadraticCurveTo(headP.px, mouthY + 7 * headP.fov, headP.px + 13 * headP.fov, mouthY);
      ctx.fill();

      // Lip Crease Line
      ctx.strokeStyle = '#993f35';
      ctx.lineWidth = 1.6 * headP.fov;
      ctx.beginPath();
      ctx.moveTo(headP.px - 14 * headP.fov, mouthY);
      ctx.quadraticCurveTo(headP.px, mouthY + 1 * headP.fov, headP.px + 14 * headP.fov, mouthY);
      ctx.stroke();
      ctx.restore();

      // 3. Draw Realistic Human Arms & Hands
      this.drawLargeArm(ctx, project, true, this.currentPose.rArm, this.currentPose.rHand, breathe);
      this.drawLargeArm(ctx, project, false, this.currentPose.lArm, this.currentPose.lHand, breathe);
    },

    // -------------------------------------------------------------------------
    // REALISTIC HUMAN ARMS (Shirt Sleeve + Natural Forearm)
    // -------------------------------------------------------------------------
    drawLargeArm: function (ctx, project, isRight, armState, handShape, breathe) {
      const side = isRight ? 1 : -1;

      // Shoulder Socket
      const shoulderX = side * 0.40;
      const shoulderY = 0.24 + breathe;
      const shoulderZ = 0.0;
      const pShoulder = project(shoulderX, shoulderY, shoulderZ);

      // Arm Lengths
      const armLen = 0.38;
      const foreLen = 0.36;

      // 3D Elbow Position
      const elX = shoulderX + Math.sin(armState.sz) * armLen * 0.6 + side * 0.12;
      const elY = shoulderY - Math.cos(armState.sx) * armLen;
      const elZ = shoulderZ + Math.sin(armState.sx) * armLen * 0.9;
      const pElbow = project(elX, elY, elZ);

      // 3D Wrist Position
      const wrX = elX + (armState.sy) * 0.65 - side * (armState.el * 0.15);
      const wrY = elY + Math.sin(armState.el) * foreLen;
      const wrZ = elZ + Math.cos(armState.el) * foreLen * 0.85;
      const pWrist = project(wrX, wrY, wrZ);

      // Draw Upper Arm (Navy Blue Shirt Sleeve)
      ctx.strokeStyle = '#1a273b';
      ctx.lineWidth = 36 * pShoulder.fov;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pShoulder.px, pShoulder.py);
      ctx.lineTo(pElbow.px, pElbow.py);
      ctx.stroke();

      // Sleeve Seam / Hem at Elbow
      ctx.strokeStyle = '#273a55';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Forearm (Natural Human Skin Tone)
      const armSkinGrad = ctx.createLinearGradient(pElbow.px, pElbow.py, pWrist.px, pWrist.py);
      armSkinGrad.addColorStop(0, '#f2cbaf');
      armSkinGrad.addColorStop(1, '#e2a988');

      ctx.strokeStyle = armSkinGrad;
      ctx.lineWidth = 26 * pElbow.fov;
      ctx.beginPath();
      ctx.moveTo(pElbow.px, pElbow.py);
      ctx.lineTo(pWrist.px, pWrist.py);
      ctx.stroke();

      // Draw REALISTIC HUMAN HAND with 5 Articulated Fingers
      this.drawLargeHand(ctx, project, wrX, wrY, wrZ, side, handShape, isRight);
    },

    // -------------------------------------------------------------------------
    // REALISTIC HUMAN HAND (Fleshy Palm + 5 Articulated Fingers + Fingernails)
    // -------------------------------------------------------------------------
    drawLargeHand: function (ctx, project, wx, wy, wz, side, shape, isRight) {
      const pWrist = project(wx, wy, wz);
      const fov = pWrist.fov;

      ctx.save();

      // 1. Natural Human Fleshy Palm (Skin-tone Disc & Thenar Mound)
      const palmSkin = ctx.createRadialGradient(
        pWrist.px - 4 * fov, pWrist.py - 4 * fov, 3 * fov,
        pWrist.px, pWrist.py, 24 * fov
      );
      palmSkin.addColorStop(0, '#ffe4d1');
      palmSkin.addColorStop(0.5, '#f5cba8');
      palmSkin.addColorStop(1, '#db9670');

      ctx.fillStyle = palmSkin;
      ctx.strokeStyle = 'rgba(180, 100, 65, 0.45)';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pWrist.px, pWrist.py, 22 * fov, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Palm Natural Crease Line
      ctx.strokeStyle = 'rgba(160, 85, 55, 0.35)';
      ctx.lineWidth = 1.8 * fov;
      ctx.beginPath();
      ctx.arc(pWrist.px + 2 * fov * side, pWrist.py, 12 * fov, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();

      // 2. Articulate 5 Separate Human Fingers (Thumb, Index, Middle, Ring, Pinky)
      const fingerAngles = [-0.68, -0.26, 0.0, 0.26, 0.56];
      const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
      const baseLengths = [30, 52, 58, 50, 40]; // Anatomically proportioned finger lengths

      fingerNames.forEach((fname, idx) => {
        let isExtended = true;
        let angleOffset = fingerAngles[idx] * side;
        let totalLen = baseLengths[idx] * fov * 1.8;

        if (shape === 'thumbs-up') {
          if (fname !== 'thumb') isExtended = false;
        } else if (shape === 'point') {
          if (fname !== 'index') isExtended = false;
        } else if (shape === 'H-name') {
          if (fname !== 'index' && fname !== 'middle') isExtended = false;
        } else if (shape === 'W-washroom') {
          if (fname === 'thumb' || fname === 'pinky') isExtended = false;
        } else if (shape === 'prayer') {
          isExtended = true;
          angleOffset *= 0.32; // tightly pressed in prayer
        }

        if (!isExtended) {
          totalLen = 13 * fov; // Naturally curled into palm
        }

        const seg1 = totalLen * 0.48;
        const seg2 = totalLen * 0.52;

        // Joint 1 (Knuckle MCP)
        const j1X = pWrist.px + Math.sin(angleOffset) * seg1;
        const j1Y = pWrist.py - Math.cos(angleOffset) * seg1;

        // Joint 2 (Fingertip)
        const tipX = j1X + Math.sin(angleOffset) * seg2;
        const tipY = j1Y - Math.cos(angleOffset) * seg2;

        // Draw Finger Flesh (Segment 1 & 2)
        ctx.strokeStyle = '#f5cba8';
        ctx.lineWidth = (isExtended ? 9 : 7) * fov;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pWrist.px, pWrist.py);
        ctx.lineTo(j1X, j1Y);
        ctx.stroke();

        ctx.strokeStyle = '#f7d3b8';
        ctx.lineWidth = (isExtended ? 7.5 : 6) * fov;
        ctx.beginPath();
        ctx.moveTo(j1X, j1Y);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Knuckle Soft Shade
        ctx.fillStyle = '#dc9872';
        ctx.beginPath();
        ctx.arc(j1X, j1Y, 3.2 * fov, 0, Math.PI * 2);
        ctx.fill();

        // Rounded Fingertip Pad
        ctx.fillStyle = isExtended ? '#fde0cb' : '#e6a47e';
        ctx.beginPath();
        ctx.arc(tipX, tipY, (isExtended ? 4.2 : 3.2) * fov, 0, Math.PI * 2);
        ctx.fill();

        // Realistic Fingernail Sheen (Top of tip)
        if (isExtended) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.beginPath();
          ctx.arc(tipX, tipY - 1 * fov, 2.2 * fov, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();
    }
  };

    // ---------------------------------------------------------------------------
  // 8. PLAY KEYFRAME ANIMATION SEQUENCE
  // ---------------------------------------------------------------------------
  function playPhraseAnimation(phrase, onComplete) {
    if (!phrase || !phrase.keyframes || phrase.keyframes.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    state.isAnimating = true;
    let kfIndex = 0;

    function nextKeyframe() {
      if (kfIndex >= phrase.keyframes.length) {
        if (onComplete) onComplete();
        return;
      }

      const kf = phrase.keyframes[kfIndex];
      const duration = (kf.duration || 800) / state.speedMultiplier;

      // Update Step Tracker HUD
      updateStepProgress(kfIndex, phrase.keyframes.length, kf.name);

      // Trigger Avatar Pose Transition
      avatarEngine.transitionToPose(kf, duration);

      kfIndex++;
      setTimeout(nextKeyframe, duration);
    }

    nextKeyframe();
  }

  // ---------------------------------------------------------------------------
  // 9. SPEECH RECOGNITION (Web Speech API)
  // ---------------------------------------------------------------------------
  function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (dom.micStatusText) dom.micStatusText.textContent = 'Voice Unsupported';
      if (dom.matchMsg) {
        dom.matchMsg.innerHTML = '💡 Note: Speech recognition not supported in this browser. Type in the text box and click <strong>Translate to Sign</strong>!';
      }
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = state.selectedLang;

      recognition.onstart = function () {
        state.isListening = true;
        if (dom.micBtn) dom.micBtn.classList.add('listening');
        if (dom.micIcon) dom.micIcon.textContent = '🛑';
        if (dom.micStatusText) dom.micStatusText.textContent = 'Listening';
        if (dom.transcriptIndicator) {
          dom.transcriptIndicator.textContent = `Listening...`;
          dom.transcriptIndicator.style.color = '#00f0ff';
        }
      };

      recognition.onresult = function (event) {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const displayText = final || interim;
        if (dom.textInput && displayText) {
          dom.textInput.value = displayText;
        }

        if (final) {
          stopListening();
          handleTranslateClick();
        }
      };

      recognition.onerror = function (event) {
        stopListening();
      };

      recognition.onend = function () {
        stopListening();
      };

      state.recognition = recognition;
    } catch (e) {
      console.warn('[ISL Speech] SpeechRec error:', e);
    }
  }

  function startListening() {
    if (!state.recognition) initSpeechRecognition();
    if (state.recognition) {
      try {
        state.recognition.lang = state.selectedLang;
        state.recognition.start();
      } catch (e) {}
    }
  }

  function stopListening() {
    state.isListening = false;
    if (dom.micBtn) dom.micBtn.classList.remove('listening');
    if (dom.micIcon) dom.micIcon.textContent = '🎙️';
    if (dom.micStatusText) dom.micStatusText.textContent = 'Speak';
    if (dom.transcriptIndicator) {
      dom.transcriptIndicator.textContent = 'Ready';
      dom.transcriptIndicator.style.color = '#10b981';
    }
    if (state.recognition) {
      try { state.recognition.stop(); } catch (e) {}
    }
  }

  // ---------------------------------------------------------------------------
  // 10. TRILINGUAL AUDIO PRONUNCIATION
  // ---------------------------------------------------------------------------
  function speakText(text, langCode) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const clean = text.replace(/^[A-Za-z]+:\s*/, '').replace(/\//g, ', ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = langCode;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
  }

  // ---------------------------------------------------------------------------
  // 11. EVENT LISTENERS SETUP
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Microphone button
    if (dom.micBtn) {
      dom.micBtn.addEventListener('click', () => {
        if (state.isListening) stopListening();
        else startListening();
      });
    }

    // Language dropdown
    if (dom.langSelect) {
      dom.langSelect.addEventListener('change', (e) => {
        state.selectedLang = e.target.value;
        if (state.isListening) {
          stopListening();
          startListening();
        }
      });
    }

    // Translate to Sign button
    if (dom.btnTranslate) {
      dom.btnTranslate.addEventListener('click', handleTranslateClick);
    }

    // Clear text button
    if (dom.btnClearText) {
      dom.btnClearText.addEventListener('click', () => {
        if (dom.textInput) dom.textInput.value = '';
        if (dom.matchMsg) {
          dom.matchMsg.innerHTML = 'Enter any phrase (e.g. <em>"Hello how are you"</em>) and click <strong>Translate to Sign</strong>!';
        }
      });
    }

    // Enter key triggers translation
    if (dom.textInput) {
      dom.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleTranslateClick();
        }
      });
    }

    // Quick Chips delegation
    if (dom.quickChipsContainer) {
      dom.quickChipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-chip');
        if (!chip) return;
        const key = chip.getAttribute('data-key');
        const found = MOTION_DATASET.find(p => p.key === key);
        if (found) {
          if (dom.textInput) dom.textInput.value = found.phrase;
          scrollTo3DStage();
          playPhraseSequence([found]);
          if (dom.matchMsg) {
            dom.matchMsg.innerHTML = `⚡ Selected quick phrase: <strong>${found.phrase}</strong> &rarr; Playing 3D animation below ↓`;
          }
        }
      });
    }

    // Presentation Mode Toggle (Real Human Signer vs 3D Human Avatar)
    if (dom.btnModeHuman) {
      dom.btnModeHuman.addEventListener('click', () => setViewMode('human'));
    }
    if (dom.btnModeAvatar) {
      dom.btnModeAvatar.addEventListener('click', () => setViewMode('avatar'));
    }

    // Speed Controls
    dom.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.speedMultiplier = parseFloat(btn.getAttribute('data-speed')) || 1.0;
        if (dom.realHumanVideo) {
          dom.realHumanVideo.playbackRate = state.speedMultiplier;
        }
      });
    });

    // Replay button
    if (dom.btnReplaySign) {
      dom.btnReplaySign.addEventListener('click', () => {
        if (state.currentPhrase) {
          if (state.viewMode === 'human') {
            playHumanVideoForCurrent();
          } else {
            playPhraseSequence([state.currentPhrase]);
          }
        }
      });
    }

    // Reset Camera button
    if (dom.btnResetCamera) {
      dom.btnResetCamera.addEventListener('click', () => {
        avatarEngine.resetCamera();
      });
    }

    // Trilingual Audio buttons
    if (dom.btnAudioEn) {
      dom.btnAudioEn.addEventListener('click', () => {
        if (state.currentPhrase && state.currentPhrase.translations) {
          speakText(state.currentPhrase.translations.en, 'en-IN');
        }
      });
    }
    if (dom.btnAudioHi) {
      dom.btnAudioHi.addEventListener('click', () => {
        if (state.currentPhrase && state.currentPhrase.translations) {
          speakText(state.currentPhrase.translations.hi, 'hi-IN');
        }
      });
    }
    if (dom.btnAudioKn) {
      dom.btnAudioKn.addEventListener('click', () => {
        if (state.currentPhrase && state.currentPhrase.translations) {
          speakText(state.currentPhrase.translations.kn, 'kn-IN');
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 12. INITIALIZATION ON DOM READY
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    avatarEngine.init();
    initSpeechRecognition();

    // Default load "How Are You?" or "Hello / Namaste"
    const defaultPhrase = MOTION_DATASET.find(p => p.key === 'how_are_you') || MOTION_DATASET[0];
    state.currentPhrase = defaultPhrase;
    updateLinguisticUI(defaultPhrase);
    populateStepBadges(defaultPhrase);
    updateActiveChip(defaultPhrase.key);

    // Initialize in Real Human Signer mode by default
    setViewMode('human');

    // Initial sign playback on load
    setTimeout(() => {
      playPhraseSequence([defaultPhrase]);
    }, 450);
  });

})();
