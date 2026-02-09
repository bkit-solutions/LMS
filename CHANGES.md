# CHANGES.md - Recent Updates to BKIT LMS

**Date**: February 6, 2026  
**Updated By**: Durgesh Vaigandla  
**Focus**: ML-Based Exam Monitoring/Proctoring Integration

---

## 🎯 Major Features Added

### 1. **Proctoring Toggle System** ✅
- **Backend**: Added `proctored` boolean field to TestEntity model
  - Default value: `false` (non-proctored by default)
  - Database column: `proctored BOOLEAN DEFAULT false`
  - Files modified:
    - `LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/model/TestEntity.java`
    - `LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/dto/TestDtos.java`
    - `LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/dto/AttemptDtos.java`
    - `LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/service/TestService.java`
    - `LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/controller/TestController.java`

- **Frontend**: Added proctoring toggle UI in test creation/edit forms
  - Blue toggle switch with clear indication
  - Default: OFF (non-proctored)
  - Files modified:
    - `LMS-Frontend/src/types/index.ts` (Test, CreateTestRequest, UpdateTestRequest, Attempt interfaces)
    - `LMS-Frontend/src/components/admin/tests/CreateTestForm.tsx`
    - `LMS-Frontend/src/components/admin/tests/EditTestModal.tsx`

### 2. **Smart Proctoring Initialization** ✅
- **PreTestInstructions Page**: Conditional rendering based on proctoring status
  - **Proctored Tests**:
    - System check (camera, microphone, browser, face detection)
    - Proctoring model pre-loading
    - Face detection validation
    - Privacy and rules information displayed
    - Camera/mic permissions required
  - **Non-Proctored Tests**:
    - Skip system check
    - Skip model loading
    - No camera/mic requirement
    - Only agreement checkbox required
    - Faster test start
  - File modified: `LMS-Frontend/src/pages/dashboard/student/PreTestInstructions.tsx`

- **TakeTestPage**: Conditional proctoring widget display
  - Only shows ProctoringManager if test is proctored
  - Skips camera stream requirements for non-proctored tests
  - File modified: `LMS-Frontend/src/pages/dashboard/student/TakeTestPage.tsx`

### 3. **Maximum Violations Enforcement** ✅
- **Limit**: 3 violations maximum per test attempt
- **Behavior**: Auto-submit test when limit reached
- **Features**:
  - Real-time violation counting with 7 violation types
  - Warning message displayed 2 seconds before auto-submit
  - Current answer saved before auto-submission
  - Redirect to dashboard with notification
  - Prevents further test access after violation limit
  - Files modified:
    - `LMS-Frontend/src/components/proctoring/ProctoringManager.tsx`
    - `LMS-Frontend/src/pages/dashboard/student/TakeTestPage.tsx`

### 4. **Enhanced Proctoring UI** ✅
- **Test Information Display**:
  - Test ID and Attempt ID shown in proctoring widget
  - Test title displayed (if provided)
  - Better context for monitoring
- **Location**: Bottom section of proctoring camera widget
- File modified: `LMS-Frontend/src/components/proctoring/ProctoringManager.tsx`

---

## 🐛 Bug Fixes

### 1. **Camera Preview Blinking Issue** ✅
- **Issue**: White layer appeared intermittently over camera preview
- **Root Cause**: CSS animation conflicts and modal timing issues
- **Fix**: Improved video element lifecycle management
  - Proper video.srcObject assignment
  - Better autoplay handling
  - Removed conflicting animations
- File modified: `LMS-Frontend/src/components/proctoring/ProctoringManager.tsx`

### 2. **Mobile Phone Detection Enhancement** 📱
- **Issue**: COCO-SSD detection not recording violations reliably
- **Fix**: Enhanced logging and error handling
  - Added detailed object detection logs (10% sampling)
  - Better confidence score reporting
  - Improved violation persistence logic
  - Error logging for debugging
- File modified: `LMS-Frontend/src/components/proctoring/ProctoringManager.tsx`

### 3. **Test Resume Endpoint** ✅
- **Issue**: `/api/tests/{testId}/attempts/me/latest` was commented out
- **Fix**: Uncommented endpoint in AttemptController
- File modified: `LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/controller/AttemptController.java`

### 4. **Face Detection False Positives** ✅
- **Issue**: "Looking away" detection too sensitive
- **Fix**: Adjusted sensitivity thresholds
  - Head turn threshold: 0.35 → 0.45
  - Gaze offset threshold: 0.6 → 0.85
  - Tilt angle threshold: 20° → 25°
- File modified: `LMS-Frontend/src/components/proctoring/ProctoringManager.tsx`

---

## 🛡️ Anti-Cheating Enhancements

### 1. **Face Completeness Validation** ✅
- **Purpose**: Prevent hand-covering cheating
- **Implementation**:
  - Validates presence of critical facial landmarks
  - Required: Both eyes, nose, mouth
  - Triggers violation if any feature missing
  - Detects partial face coverage
- **Logging**: Console warnings for incomplete faces

### 2. **Face Aspect Ratio Check** ✅
- **Purpose**: Detect abnormal face shapes (indicating coverage/occlusion)
- **Valid Range**: 0.5 - 1.3
- **Behavior**: Triggers "FACE NOT VISIBLE" violation if out of range
- **Use Case**: Detects when user covers part of face with hands

### 3. **Minimum Face Size Validation** ✅
- **Purpose**: Prevent tiny/distant partial faces from being accepted
- **Minimum Size**: 80px (both width and height)
- **Behavior**: Triggers violation if face too small
- **Use Case**: Prevents users from moving far away or showing only small portion

### 4. **Enhanced Multiple Face Detection** 👥
- **Configuration**: maxFaces: 4 in MediaPipe model
- **Features**:
  - Detailed logging of all detected faces
  - Face count displayed in violation badge
  - Bounding box information logged
  - Clear console alerts: "🚨 MULTIPLE PEOPLE DETECTED: X faces"

### 5. **Security Features (All Tests)** 🔒
These apply to BOTH proctored and non-proctored tests:
- ✅ **Fullscreen Enforcement**: Warning modal when user exits fullscreen
- ✅ **Tab Switching Detection**: Warning when user switches tabs/windows
- ✅ **Copy/Paste Prevention**: Disabled throughout test
- ✅ **Right-Click Prevention**: Context menu disabled
- ✅ **Developer Tools Prevention**: F12 and Ctrl+Shift+I blocked

---

## 🔧 Technical Improvements

### 1. **Model Loading Optimization** ✅
- Removed artificial 2-second delay
- Proper async/await handling
- Singleton pattern for model caching
- Better error messages
- Files modified:
  - `LMS-Frontend/src/utils/tfInit.ts`
  - `LMS-Frontend/src/utils/ProctoringModelLoader.ts`

### 2. **Switched to MediaPipe Runtime** ✅
- **From**: TensorFlow.js runtime
- **To**: MediaPipe runtime (matching working index.html)
- **Reason**: Better reliability and performance
- **Configuration**:
  ```typescript
  runtime: "mediapipe",
  maxFaces: 4,
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh"
  ```
- File modified: `LMS-Frontend/src/utils/ProctoringModelLoader.ts`

### 3. **Package Cleanup** 🧹
- **Removed unused dependencies**:
  - `@mediapipe/camera_utils` (not imported anywhere)
  - `@tensorflow/tfjs-converter` (not used)
- **Benefit**: Smaller bundle size, faster installation
- File modified: `LMS-Frontend/package.json`

---

## 📊 Proctoring Violation Types

The system now tracks **7 violation types**:

1. **FACE_VISIBILITY**: Face not visible/incomplete/covered
2. **MULTIPLE_PEOPLE**: More than one person detected
3. **AUDIO_DETECTED**: Speech/noise detected
4. **HEAD_TURNED**: Head turned away (yaw angle > 0.45)
5. **HEAD_TILT**: Head tilted (roll angle > 25°)
6. **GAZE_AWAY**: Eyes looking away from screen (offset > 0.85)
7. **MOBILE_DETECTED**: Mobile phone visible in frame

**Display Priority** (top violation shown first):
1. Face not visible
2. Multiple faces
3. Audio/noise
4. Head turned/looking away
5. Head tilt
6. Gaze away
7. Mobile detected

---

## 📁 Files Modified Summary

### Backend (Java/Spring Boot)
```
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/model/TestEntity.java
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/dto/TestDtos.java
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/dto/AttemptDtos.java
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/service/TestService.java
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/service/AttemptService.java
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/controller/TestController.java
✏️ LMS-Backend/src/main/java/in/bkitsolutions/lmsbackend/controller/AttemptController.java
```

### Frontend (React/TypeScript)
```
✏️ LMS-Frontend/package.json
✏️ LMS-Frontend/src/types/index.ts
✏️ LMS-Frontend/src/utils/tfInit.ts
✏️ LMS-Frontend/src/utils/ProctoringModelLoader.ts
✏️ LMS-Frontend/src/components/proctoring/ProctoringManager.tsx
✏️ LMS-Frontend/src/components/admin/tests/CreateTestForm.tsx
✏️ LMS-Frontend/src/components/admin/tests/EditTestModal.tsx
✏️ LMS-Frontend/src/pages/dashboard/student/PreTestInstructions.tsx
✏️ LMS-Frontend/src/pages/dashboard/student/TakeTestPage.tsx

🆕 LMS-Frontend/src/utils/testFaceDetection.ts (diagnostic tool)
🆕 LMS-Frontend/src/pages/dashboard/admin/ProctoringTestPage.tsx (testing page)
🆕 LMS-Frontend/src/main.tsx (exposed test function)
```

### Documentation
```
🆕 PLANNING.md
🆕 CHANGES.md (this file)
```

---

## ⚠️ Required Database Migration

Run this SQL on your database:
```sql
ALTER TABLE tests ADD COLUMN proctored BOOLEAN DEFAULT false;
```

---

## 🧪 Testing Checklist

### For Proctored Tests (proctored = true):
- [ ] Camera permission requested
- [ ] System check runs (camera, mic, browser, face)
- [ ] Proctoring model loads
- [ ] Face detection works in real-time
- [ ] Multiple face detection triggers violation
- [ ] Hand covering face triggers "FACE NOT VISIBLE"
- [ ] Mobile phone detection works
- [ ] Audio detection works
- [ ] Max 3 violations enforced (auto-submit)
- [ ] Test ID and title shown in widget
- [ ] Fullscreen enforced
- [ ] Tab switching detected

### For Non-Proctored Tests (proctored = false):
- [ ] No camera permission required
- [ ] No system check
- [ ] No model loading
- [ ] Direct test start after agreement
- [ ] No proctoring widget displayed
- [ ] Fullscreen still enforced ✅
- [ ] Tab switching still detected ✅
- [ ] Copy/paste still blocked ✅
- [ ] Right-click still blocked ✅

### Admin Features:
- [ ] Toggle proctoring ON in create test form
- [ ] Toggle proctoring OFF (default)
- [ ] Edit existing test proctoring status
- [ ] Proctoring status visible in test list
- [ ] View proctoring violations in results

---

## 🚀 Next Steps / Known Issues

### High Priority:
1. **Database Migration**: Add `proctored` column to tests table
2. **Mobile Detection Tuning**: Adjust confidence threshold if needed
3. **Violation Reporting**: Add backend API for tab-switch violations (currently only frontend warnings)

### Medium Priority:
4. **Screen Recording**: Capture full screen during proctored tests
5. **Live Proctoring Dashboard**: Real-time monitoring of all active attempts
6. **Automated Cheating Score**: ML-based probability calculation

### Low Priority:
7. **Test Statistics**: Admin dashboard with violation analytics
8. **Email Notifications**: Alerts for high-violation attempts

---

## 💡 Key Architectural Decisions

1. **Proctoring is Optional**: Tests are non-proctored by default, giving faculty flexibility
2. **Client-Side Processing**: All AI processing happens in the browser (privacy-focused)
3. **No Video Recording**: Only violation counts stored, not video footage
4. **Progressive Enhancement**: Security features (fullscreen, tab switch) work for all tests
5. **MediaPipe over TFjs**: Better reliability for face detection
6. **Singleton Pattern**: Model loaded once and cached across components

---

## 📈 Performance Metrics

- **Model Load Time**: ~2-3 seconds on first load (cached afterward)
- **Detection Frequency**: Every 500ms (2 FPS)
- **Mobile Detection**: Every 500ms
- **Audio Analysis**: Real-time continuous
- **Bundle Size Reduction**: ~2MB (removed unused packages)

---

## 🔗 Related Documentation

- API documentation: [APIs.md](./APIs.md)
- Backend API: [LMS-Backend/API.md](./LMS-Backend/API.md)

---

**Summary**: Successfully implemented a flexible proctoring system that allows faculty to choose between proctored and non-proctored exams. Proctored tests feature advanced ML-based monitoring with 7 violation types, face completeness validation, and automatic enforcement of a 3-violation limit. Non-proctored tests skip camera requirements but maintain essential security features like fullscreen enforcement and tab-switching detection.
