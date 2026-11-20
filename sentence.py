"""Letters -> words -> sentences, with word suggestion and auto-correction."""
import difflib

import config


class SentenceBuilder:
    def __init__(self, words_path=config.WORDS_PATH):
        with open(words_path) as f:
            seen, self.dictionary = set(), []
            for w in f.read().split():
                w = w.upper()
                if w not in seen:
                    seen.add(w)
                    self.dictionary.append(w)
        self.word_set = set(self.dictionary)
        self.sentence = []   # finished words
        self.current = ""    # letters being signed

    # ---- gesture handling ----
    def add_sign(self, label):
        if label == "SPACE":
            self.finish_word()
        elif label == "DEL":
            self.backspace()
        elif label == "CLEAR":
            self.clear()
        elif len(label) == 1:
            self.current += label
        else:  # whole-word sign
            self.finish_word()
            self.sentence.append(config.WORD_DISPLAY.get(label, label))

    def finish_word(self):
        if self.current:
            self.sentence.append(self.autocorrect(self.current))
            self.current = ""

    def backspace(self):
        if self.current:
            self.current = self.current[:-1]
        elif self.sentence:
            self.sentence.pop()

    def clear(self):
        self.sentence, self.current = [], ""

    # ---- NLP helpers ----
    def autocorrect(self, word):
        if word in self.word_set or len(word) <= 1:
            return word
        match = difflib.get_close_matches(word, self.dictionary, n=1, cutoff=0.7)
        return match[0] if match else word

    def suggestions(self, n=None):
        """ALL dictionary words starting with the letters signed so far (n=None -> no limit)."""
        if not self.current:
            return []
        out = [w for w in self.dictionary if w.startswith(self.current)]
        if not out:  # nothing starts with it -> closest fuzzy matches
            out = difflib.get_close_matches(self.current, self.dictionary, n=10, cutoff=0.6)
        return out if n is None else out[:n]

    def accept_suggestion(self, index):
        """index is the absolute position in suggestions()."""
        s = self.suggestions()
        if 0 <= index < len(s):
            self.current = ""
            self.sentence.append(s[index])

    @property
    def text(self):
        return " ".join(self.sentence + ([self.current] if self.current else []))