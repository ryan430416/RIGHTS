import * as THREE from 'three'

/** Extruded gothic pointed arch ring with thickness. */
export function createGothicArchGeometry(
  outerW = 2.4,
  outerH = 3.6,
  innerW = 1.55,
  innerH = 2.85,
  depth = 0.55,
): THREE.ExtrudeGeometry {
  const outer = new THREE.Shape()
  outer.moveTo(-outerW / 2, 0)
  outer.lineTo(outerW / 2, 0)
  outer.lineTo(outerW / 2, outerH * 0.52)
  outer.quadraticCurveTo(outerW / 2, outerH * 0.78, 0, outerH)
  outer.quadraticCurveTo(-outerW / 2, outerH * 0.78, -outerW / 2, outerH * 0.52)
  outer.lineTo(-outerW / 2, 0)

  const hole = new THREE.Path()
  hole.moveTo(-innerW / 2, 0.12)
  hole.lineTo(innerW / 2, 0.12)
  hole.lineTo(innerW / 2, innerH * 0.5)
  hole.quadraticCurveTo(innerW / 2, innerH * 0.74, 0, innerH)
  hole.quadraticCurveTo(-innerW / 2, innerH * 0.74, -innerW / 2, innerH * 0.5)
  hole.lineTo(-innerW / 2, 0.12)
  outer.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(outer, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
    curveSegments: 18,
  })
  geo.translate(0, 0, -depth / 2)
  geo.computeVertexNormals()
  return geo
}

export function createBrokenPillarGeometry(height = 2.2, radius = 0.22): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radius * 0.85, radius, height, 7, 1)
}
