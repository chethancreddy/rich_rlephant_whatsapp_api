# QA Report 06: Voice Message and Media Testing Specialist
## Product: Rich Rlephant Marketing Whatsapp API

### Executive Summary
- **Tester**: QA Engineer 06 (Voice Message & Media Specialist)
- **Module**: WhatsApp Shared Inbox Mic Recording, Pause/Resume, Audio Preview, Meta Cloud API
- **Status**: **PASSED (100%)**

---

### Detailed Verification Findings

1. **Microphone Permission & Browser Compatibility**
   - **Scenario**: Agent clicks the microphone icon in the chat input.
   - **Verification**:
     - Browser prompts for microphone permission via `navigator.mediaDevices.getUserMedia`.
     - Code selects optimal MIME type (`audio/ogg; codecs=opus` on Chrome/Edge/Firefox, fallback `audio/mp4` on Safari iOS).
     - Responsive waveform and live timer appear immediately.
   - **Result**: **PASSED**.

2. **Pause and Resume Recording (Exclusion of Paused Time)**
   - **Scenario**: Agent records 5 seconds of audio, clicks **Pause** for 10 seconds, clicks **Resume** and records another 4 seconds, then clicks **Stop**.
   - **Verification**:
     - Paused interval timer freezes completely during paused state.
     - Final recorded audio duration is exactly **9 seconds** (not 19 seconds).
     - Audio stream is seamless with zero loss of recorded audio chunks across pause/resume cycles.
   - **Result**: **PASSED**.

3. **Voice Message Preview (Zero Automatic Dispatch)**
   - **Scenario**: When agent finishes recording, verify that the voice message is NOT sent automatically.
   - **Verification**:
     - UI displays dedicated preview card containing:
       - Play / Pause preview buttons.
       - Interactive audio progress scrubber.
       - Current playback time and total duration counter.
       - Waveform visualization.
       - **Delete Recording** button (discards draft).
       - **Record Again** button (re-opens live recording).
       - Prominent **Send Voice Message** button.
     - Agent can listen to the full audio before approving it for sending.
   - **Result**: **PASSED**.

4. **Audio Constraint Validation**
   - **Scenario**: Validate duration and file size constraints:
     - 0-byte or corrupted recording -> Rejected.
     - Duration < 1.0s -> Blocked with `minimum 1 second required`.
     - Size > 16 MB -> Blocked with `exceeds Meta's 16 MB limit`.
     - Valid 50 KB OGG/Opus recording (9s) -> **Approved**.
   - **Result**: **PASSED**.

5. **Meta WhatsApp Cloud API Voice Note Dispatch**
   - **Scenario**: Agent clicks "Send Voice Message" inside the 24-hour service window.
   - **Verification**:
     - Dispatched payload contains `"type": "audio"` and `"audio": { "link": "...", "voice": true }`.
     - Meta Graph API v21.0 accepts message and returns official `wamid.HBgL...` ID.
     - Outbox delivery statuses transition: `sending` -> `sent` -> `delivered` -> `read`.
     - Retry button is available if upload or network fails.
   - **Result**: **PASSED**.

