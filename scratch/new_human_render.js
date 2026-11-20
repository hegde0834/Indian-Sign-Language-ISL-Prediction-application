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