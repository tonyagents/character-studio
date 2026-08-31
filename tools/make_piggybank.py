"""Build a stylized MoonPay-purple piggy bank with a gold coin in the slot.

Run:  blender --background --python tools/make_piggybank.py -- public/models/piggybank.glb

Blender is Z-up (glTF export converts to Y-up). Feet at z=0; the front of the
pig faces -Y, which maps to +Z (toward the camera) in the pipeline.
"""
import math
import sys

import bpy

PURPLE = (0.49, 0.0, 1.0, 1.0)
LIGHT = (0.72, 0.45, 1.0, 1.0)
DARK = (0.10, 0.08, 0.16, 1.0)
GOLD = (1.0, 0.72, 0.1, 1.0)


def make_mat(name, color, metallic=0.0, rough=0.5, emission=None, strength=1.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = strength
    return mat


def assign(mat):
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    return obj


bpy.ops.wm.read_factory_settings(use_empty=True)

m_body = make_mat("body", PURPLE, rough=0.35)
m_light = make_mat("light", LIGHT, rough=0.4)
m_dark = make_mat("dark", DARK, rough=0.5)
m_gold = make_mat("gold", GOLD, metallic=0.8, rough=0.25, emission=GOLD, strength=0.8)

# Body: squashed sphere, belly clearing the ground on short legs
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(0, 0, 0.62), segments=32, ring_count=24)
body = assign(m_body)
body.scale = (1.0, 0.82, 0.78)

# Snout
bpy.ops.mesh.primitive_cylinder_add(radius=0.17, depth=0.18, location=(0, -0.46, 0.60), rotation=(math.pi / 2, 0, 0), vertices=24)
assign(m_light)
for x in (-0.06, 0.06):  # nostrils
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.03, location=(x, -0.555, 0.60), rotation=(math.pi / 2, 0, 0), vertices=12)
    assign(m_dark)

# Eyes
for x in (-0.17, 0.17):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05, location=(x, -0.36, 0.80), segments=16, ring_count=12)
    assign(m_dark)

# Ears: small cones tilted outward
for x in (-0.22, 0.22):
    bpy.ops.mesh.primitive_cone_add(radius1=0.09, radius2=0.0, depth=0.18, location=(x, -0.05, 0.97), rotation=(0.25, math.copysign(0.3, x), 0), vertices=16)
    assign(m_light)

# Legs
for x in (-0.24, 0.24):
    for y in (-0.22, 0.22):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=0.28, location=(x, y, 0.14), vertices=16)
        assign(m_light)

# Curly tail: small torus at the back
bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.025, location=(0, 0.44, 0.68), rotation=(0, math.pi / 2, 0))
assign(m_light)

# Coin slot on top + gold coin half-inserted
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.005))
slot = assign(m_dark)
slot.scale = (0.03, 0.14, 0.02)
bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.03, location=(0, 0, 1.10), rotation=(0, math.pi / 2, 0), vertices=28)
assign(m_gold)

out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB")
print(f"exported {out}")
