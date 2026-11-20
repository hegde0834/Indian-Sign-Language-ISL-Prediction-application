render: function () {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      // Studio Ambient Glow
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2 - 30, 80, w / 2, h / 2, w * 0.7);
      bgGrad.addColorStop(0, '#0e1c3b');
      bgGrad.addColorStop(0.55, '#070f20');
      bgGrad.addColorStop(1, '#02050c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Studio Floor Rings
      ctx.save();
      ctx.translate(w / 2, h * 0.9);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, 360, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 260, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // PROJECTION CONSTANTS (Calibrated so avatar fills ~80% of canvas height comfortably)
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

      // Draw Broad Armor Torso
      ctx.save();
      const torsoGrad = ctx.createLinearGradient(torsoTop.px, torsoTop.py, torsoBot.px, torsoBot.py);
      torsoGrad.addColorStop(0, '#1e293b');
      torsoGrad.addColorStop(0.5, '#0f172a');
      torsoGrad.addColorStop(1, '#020617');

      ctx.fillStyle = torsoGrad;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 4;

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

      // Chest Glowing Core Reactor
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(torsoTop.px, torsoTop.py + 70 * torsoTop.fov, 22 * torsoTop.fov, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 2. Head & Neck
      const headPitch = this.currentPose.head.pitch || 0;
      const headRoll = this.currentPose.head.roll || 0;
      const neckP = project(0, 0.42 + breathe, 0.02);
      const headP = project(0 + headRoll * 0.12, 0.68 + breathe - headPitch * 0.12, 0.05 + headPitch * 0.18);

      // Sturdy Neck
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 36 * neckP.fov;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(neckP.px, neckP.py);
      ctx.lineTo(headP.px, headP.py);
      ctx.stroke();

      // Large Detailed Head Sphere (Diameter ~115px)
      const headRadius = 60 * headP.fov;
      const headGrad = ctx.createRadialGradient(
        headP.px - 10 * headP.fov, headP.py - 16 * headP.fov, 6,
        headP.px, headP.py, headRadius
      );
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.35, '#e2e8f0');
      headGrad.addColorStop(0.8, '#cbd5e1');
      headGrad.addColorStop(1, '#64748b');

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(headP.px, headP.py, headRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cyber Hair Cap
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(headP.px, headP.py - 12 * headP.fov, headRadius * 0.95, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();

      // Glowing Eyes / Visor
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      const eyeY = headP.py - 4 * headP.fov;
      ctx.fillRect(headP.px - 28 * headP.fov, eyeY, 56 * headP.fov, 11 * headP.fov);
      ctx.shadowBlur = 0;

      // Expressive Eyebrows
      const brows = this.currentPose.head.brows;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (brows === 'raised') {
        ctx.arc(headP.px - 16 * headP.fov, eyeY - 14 * headP.fov, 14 * headP.fov, Math.PI * 1.15, Math.PI * 1.85);
        ctx.arc(headP.px + 16 * headP.fov, eyeY - 14 * headP.fov, 14 * headP.fov, Math.PI * 1.15, Math.PI * 1.85);
      } else if (brows === 'furrowed') {
        ctx.moveTo(headP.px - 28 * headP.fov, eyeY - 14 * headP.fov);
        ctx.lineTo(headP.px - 8 * headP.fov, eyeY - 6 * headP.fov);
        ctx.moveTo(headP.px + 8 * headP.fov, eyeY - 6 * headP.fov);
        ctx.lineTo(headP.px + 28 * headP.fov, eyeY - 14 * headP.fov);
      } else {
        ctx.moveTo(headP.px - 28 * headP.fov, eyeY - 12 * headP.fov);
        ctx.lineTo(headP.px - 6 * headP.fov, eyeY - 12 * headP.fov);
        ctx.moveTo(headP.px + 6 * headP.fov, eyeY - 12 * headP.fov);
        ctx.lineTo(headP.px + 28 * headP.fov, eyeY - 12 * headP.fov);
      }
      ctx.stroke();

      // Mouth Line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headP.px, headP.py + 22 * headP.fov, 16 * headP.fov, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      // 3. Draw Arms & Hands (Right = Cyan Dominant, Left = Purple Base)
      this.drawLargeArm(ctx, project, true, this.currentPose.rArm, this.currentPose.rHand, breathe);
      this.drawLargeArm(ctx, project, false, this.currentPose.lArm, this.currentPose.lHand, breathe);
    },

    // -------------------------------------------------------------------------
    // LARGE ARTICULATED ARMS AND 21-JOINT HANDS
    // -------------------------------------------------------------------------
    drawLargeArm: function (ctx, project, isRight, armState, handShape, breathe) {
      const side = isRight ? 1 : -1;
      const mainColor = isRight ? '#00f0ff' : '#c084fc';
      const glowColor = isRight ? 'rgba(0, 240, 255, 0.45)' : 'rgba(192, 132, 252, 0.45)';

      // Shoulder Socket
      const shoulderX = side * 0.40;
      const shoulderY = 0.24 + breathe;
      const shoulderZ = 0.0;
      const pShoulder = project(shoulderX, shoulderY, shoulderZ);

      // Arm Lengths (Substantial reach)
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

      // Draw Upper Arm (Thick Anatomical Cylinder)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 38 * pShoulder.fov;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pShoulder.px, pShoulder.py);
      ctx.lineTo(pElbow.px, pElbow.py);
      ctx.stroke();

      // Upper Arm Neon Armor Trim
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Forearm
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 30 * pElbow.fov;
      ctx.beginPath();
      ctx.moveTo(pElbow.px, pElbow.py);
      ctx.lineTo(pWrist.px, pWrist.py);
      ctx.stroke();

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glowing Shoulder & Elbow Joint Nodes
      ctx.fillStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(pShoulder.px, pShoulder.py, 12 * pShoulder.fov, 0, Math.PI * 2);
      ctx.arc(pElbow.px, pElbow.py, 10 * pElbow.fov, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw PROMINENT 21-Joint Articulated Hand
      this.drawLargeHand(ctx, project, wrX, wrY, wrZ, side, handShape, mainColor, glowColor);
    },

    drawLargeHand: function (ctx, project, wx, wy, wz, side, shape, mainColor, glowColor) {
      const pWrist = project(wx, wy, wz);
      const fov = pWrist.fov;

      ctx.save();

      // 1. Draw Large Palm Base (Shield / Disc)
      ctx.fillStyle = glowColor;
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(pWrist.px, pWrist.py, 22 * fov, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Articulate 5 Separate Fingers (Thumb, Index, Middle, Ring, Pinky)
      const fingerAngles = [-0.65, -0.28, 0.0, 0.28, 0.58];
      const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
      const baseLengths = [32, 54, 60, 52, 42]; // Large finger lengths in pixels!

      fingerNames.forEach((fname, idx) => {
        let isExtended = true;
        let angleOffset = fingerAngles[idx] * side;
        let totalLen = baseLengths[idx] * fov * 1.8; // High visibility!

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
          angleOffset *= 0.35; // tightly pressed together
        }

        if (!isExtended) {
          totalLen = 14 * fov; // Curled knuckle
        }

        // Draw Multi-Joint Finger (Knuckle MCP -> Mid PIP -> Tip DIP)
        const seg1 = totalLen * 0.45;
        const seg2 = totalLen * 0.55;

        // Joint 1 (Knuckle)
        const j1X = pWrist.px + Math.sin(angleOffset) * seg1;
        const j1Y = pWrist.py - Math.cos(angleOffset) * seg1;

        // Joint 2 (Tip)
        const tipX = j1X + Math.sin(angleOffset) * seg2;
        const tipY = j1Y - Math.cos(angleOffset) * seg2;

        // Draw Bone Segment 1
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = isExtended ? 6 : 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pWrist.px, pWrist.py);
        ctx.lineTo(j1X, j1Y);
        ctx.stroke();

        // Draw Bone Segment 2
        ctx.beginPath();
        ctx.moveTo(j1X, j1Y);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Knuckle Joint Node
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(j1X, j1Y, 4 * fov, 0, Math.PI * 2);
        ctx.fill();

        // Luminescent Fingertip
        ctx.fillStyle = isExtended ? '#ffffff' : mainColor;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(tipX, tipY, isExtended ? 5.5 * fov : 3.5 * fov, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
