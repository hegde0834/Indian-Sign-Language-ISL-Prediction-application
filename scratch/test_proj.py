def calc_avatar(w=960, h=560, scale_mul=1.35, cy_offset=120, dist=1.75):
    scale = min(w, h) * scale_mul
    cx = w / 2
    cy = h / 2 + cy_offset

    def project(x, y, z):
        fov = 1.0 / (dist + z)
        return {
            'px': cx + x * scale * fov,
            'py': cy - y * scale * fov,
            'fov': fov
        }

    headP = project(0, 0.68, 0.05)
    headRadius = 55 * headP['fov']
    top_of_head = headP['py'] - headRadius

    chin = project(0, 0.45, 0.05)
    torsoBot = project(0, -0.42, 0)
    chest = project(0, 0.15, 0)

    print(f"scale_mul={scale_mul}, cy_offset={cy_offset}, dist={dist}:")
    print(f"  Head center: y={headP['py']:.1f}, Top of head: {top_of_head:.1f}")
    print(f"  Chin: y={chin['py']:.1f}")
    print(f"  Chest center: y={chest['py']:.1f}")
    print(f"  Torso bottom: y={torsoBot['py']:.1f}")
    print(f"  Head diameter: {headRadius * 2:.1f}px")

for scale_mul in [1.25, 1.30, 1.35]:
    for cy_offset in [110, 120, 130]:
        calc_avatar(960, 560, scale_mul, cy_offset, 1.8)
        print('-'*40)
