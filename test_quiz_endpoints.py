import sys
import os
import json
import base64
import unittest
import cv2
import numpy as np

# Ensure root directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from web_app import app, classes

class QuizEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def test_quiz_static_routes(self):
        """Verify that /quiz and /quiz.html serve the quiz page."""
        res1 = self.client.get("/quiz")
        self.assertEqual(res1.status_code, 200)
        self.assertIn(b"26-Letter Prediction Quiz", res1.data)

        res2 = self.client.get("/quiz.html")
        self.assertEqual(res2.status_code, 200)

        res3 = self.client.get("/quiz.js")
        self.assertEqual(res3.status_code, 200)

        res4 = self.client.get("/quiz.css")
        self.assertEqual(res4.status_code, 200)

    def test_quiz_letters_api(self):
        """Verify that /api/quiz/letters returns all 26 letters."""
        res = self.client.get("/api/quiz/letters")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("letters", data)
        letters = data["letters"]
        self.assertEqual(len(letters), 26)

        # Check that letters A to Z exist
        chars = [l["letter"] for l in letters]
        expected_chars = [chr(c) for c in range(ord('A'), ord('Z') + 1)]
        self.assertEqual(chars, expected_chars)

        # Check each letter has image, description, tips
        for l in letters:
            self.assertTrue(os.path.exists(os.path.join(".", l["image"].lstrip("/"))))
            self.assertTrue(len(l["description"]) > 10)

    def test_quiz_verify_blank_frame(self):
        """Verify /api/quiz/verify with a black frame (no hand detected)."""
        blank_frame = np.zeros((360, 640, 3), dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", blank_frame)
        b64_img = base64.b64encode(buf.tobytes()).decode("utf-8")

        res = self.client.post("/api/quiz/verify", json={
            "image": b64_img,
            "target_letter": "A",
            "threshold": 0.65
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertFalse(data["detected"])
        self.assertEqual(data["hands_count"], 0)
        self.assertFalse(data["matched"])
        self.assertEqual(data["label"], "-")
        self.assertEqual(data["hands_landmarks"], [])

    def test_quiz_verify_with_real_image(self):
        """Verify /api/quiz/verify with a real image from assets/images/letters."""
        img_path = os.path.join("assets", "images", "letters", "c.jpg")
        self.assertTrue(os.path.exists(img_path))
        frame = cv2.imread(img_path)
        _, buf = cv2.imencode(".jpg", frame)
        b64_img = base64.b64encode(buf.tobytes()).decode("utf-8")

        res = self.client.post("/api/quiz/verify", json={
            "image": b64_img,
            "target_letter": "C",
            "threshold": 0.65
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        # Verify structure
        self.assertIn("detected", data)
        self.assertIn("matched", data)
        self.assertIn("label", data)
        self.assertIn("confidence", data)
        self.assertIn("hands_landmarks", data)
        print(f"Quiz Verify Test Result on c.jpg -> detected: {data['detected']}, label: {data.get('label')}, conf: {data.get('confidence')}, matched: {data.get('matched')}")

    def test_phrases_api_and_videos(self):
        """Verify that /api/phrases returns all 10 phrases and video files exist."""
        res = self.client.get("/api/phrases")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("phrases", data)
        phrases = data["phrases"]
        self.assertEqual(len(phrases), 10)

        # Check that all 10 video lessons have completely unique, distinct YouTube videos
        unique_yt = set(p["youtube_id"] for p in phrases)
        self.assertEqual(len(unique_yt), 10, f"Expected 10 unique YouTube videos, got {len(unique_yt)}")

        for p in phrases:
            # Check video file exists
            video_rel = p["video"].lstrip("/")
            self.assertTrue(os.path.exists(video_rel), f"Video missing: {video_rel}")
            # Check thumbnail exists
            thumb_rel = p["thumbnail"].lstrip("/")
            self.assertTrue(os.path.exists(thumb_rel), f"Thumbnail missing: {thumb_rel}")
            # Check translations exist
            self.assertTrue(len(p["english"]) > 0)
            self.assertTrue(len(p["hindi"]) > 0)
            self.assertTrue(len(p["kannada"]) > 0)
            # Check real human instructor and youtube id exist
            self.assertIn("instructor", p)
            self.assertIn("youtube_id", p)
            # Check video route serves 200
            res_vid = self.client.get(p["video"])
            self.assertEqual(res_vid.status_code, 200)

    def test_lessons_page_and_routes(self):
        """Verify /lessons standalone page, css, js, and /phrases redirect."""
        # Standalone lessons page
        res = self.client.get("/lessons")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"10 Basic Everyday Phrases", res.data)
        self.assertIn(b"Real Human Video Lessons", res.data)

        # /phrases redirect to /lessons
        res_redir = self.client.get("/phrases")
        self.assertEqual(res_redir.status_code, 302)
        self.assertIn("/lessons", res_redir.headers.get("Location", ""))

        # Static assets
        res_css = self.client.get("/lessons.css")
        self.assertEqual(res_css.status_code, 200)

        res_js = self.client.get("/lessons.js")
        self.assertEqual(res_js.status_code, 200)


if __name__ == "__main__":
    unittest.main()

