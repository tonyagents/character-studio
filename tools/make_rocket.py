"""Build a stylized Nova rocket and export it as public/models/rocket.glb.

Run:  blender --background --python tools/make_rocket.py -- public/models/rocket.glb

Blender is Z-up; glTF export converts to Y-up. Geometry is built with the
launch-pad base at z=0 and the engine flame hanging below, so the pipeline's
auto-normalization grounds the rocket on its flame tip like a launch pad.
"""
import sys

import bpy

NOVA_PURPLE = (0.49, 0.0, 1.0, 1.0)
WHITE = (0.92, 0.92, 0.95, 1.0)
DARK = (0.12, 0.12, 0.16, 1.0)
FLAME = (1.0, 0.45, 0.05, 1.0)
WINDOW = (0.55, 0.85, 1.0, 1.0)


def make_mat(name, color, metallic=0.0, rough=0.5, emission=None, strength=4.0):
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

m_body = make_mat("body", WHITE, metallic=0.3, rough=0.35)
m_purple = make_mat("purple", NOVA_PURPLE, metallic=0.2, rough=0.4)
m_dark = make_mat("dark", DARK, metallic=0.6, rough=0.5)
m_flame = make_mat("flame", FLAME, emission=FLAME, strength=1.8)
m_window = make_mat("window", WINDOW, emission=WINDOW, strength=2.0)

# Engine nozzle: base ring sitting on the pad
bpy.ops.mesh.primitive_cone_add(radius1=0.30, radius2=0.20, depth=0.25, location=(0, 0, 0.125), vertices=32)
assign(m_dark)

# Flame: cone pointing down below the nozzle
bpy.ops.mesh.primitive_cone_add(radius1=0.17, radius2=0.0, depth=0.5, location=(0, 0, -0.22), rotation=(3.14159, 0, 0), vertices=24)
assign(m_flame)

# Body
bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=1.5, location=(0, 0, 1.0), vertices=32)
assign(m_body)

# Purple band at the top of the body
bpy.ops.mesh.primitive_cylinder_add(radius=0.325, depth=0.18, location=(0, 0, 1.62), vertices=32)
assign(m_purple)

# Nose cone
bpy.ops.mesh.primitive_cone_add(radius1=0.32, radius2=0.0, depth=0.6, location=(0, 0, 2.05), vertices=32)
assign(m_purple)

# Window on the front (-Y in Blender maps to +Z in glTF, facing the camera)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.13, location=(0, -0.28, 1.25), segments=24, ring_count=16)
assign(m_window)

# Three fins, placed to keep the front window clear
import math

for angle_deg in (90, 210, 330):
    a = math.radians(angle_deg)
    x, y = math.cos(a) * 0.40, math.sin(a) * 0.40
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 0.42))
    fin = bpy.context.active_object
    fin.scale = (0.05, 0.30, 0.42)
    fin.rotation_euler = (0, 0, a + math.pi / 2)
    assign(m_purple)

out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB")
print(f"exported {out}")
