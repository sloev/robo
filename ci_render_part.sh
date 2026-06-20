#!/usr/bin/env bash
#
# Render a single chassis part and validate it before it can ship.
#
# Usage: ci_render_part.sh <name> <scad-file>
#   e.g. ci_render_part.sh base lego_robot_base.scad
#
# This script is the single choke point that turns OpenSCAD's "looks fine but
# isn't" failures into hard CI failures:
#   * The PNG screenshot needs an X server, so ONLY that step is wrapped in
#     xvfb-run. STL export is headless and is run directly, so OpenSCAD's exit
#     code propagates instead of being masked by the wrapper.
#   * The exported STL must be non-empty and a closed, manifold solid
#     ("Simple: yes"), otherwise the job fails loudly.
set -euo pipefail

name="${1:?usage: ci_render_part.sh <name> <scad-file>}"
scad="${2:?usage: ci_render_part.sh <name> <scad-file>}"

stl="vehicle_${name}.stl"
png="screenshots/vehicle_${name}_render.png"

echo "==> Rendering screenshot for ${name}"
xvfb-run -a make -B "${png}"
test -s "${png}" || { echo "::error::${png} was not produced"; exit 1; }

echo "==> Rendering STL for ${name}"
log="$(mktemp)"
# pipefail (set above) ensures a make/openscad failure is not hidden by `tee`.
make -B "${stl}" 2>&1 | tee "${log}"

# --- Hard validation gates ---
if [ ! -s "${stl}" ]; then
  echo "::error::${stl} is missing or empty after render"
  exit 1
fi
if ! grep -qE "Simple:[[:space:]]+yes" "${log}"; then
  echo "::error::${stl} is not a simple/manifold solid (OpenSCAD did not report 'Simple: yes')"
  exit 1
fi
if grep -qE "ERROR:" "${log}"; then
  echo "::error::OpenSCAD reported an ERROR while exporting ${stl}"
  exit 1
fi
if grep -qE "WARNING:" "${log}"; then
  echo "::warning::OpenSCAD emitted warnings while exporting ${stl} (see log above)"
fi

vol="$(grep -oE "Volumes:[[:space:]]+[0-9]+" "${log}" | grep -oE "[0-9]+" || echo "?")"
echo "OK: ${stl} validated (manifold, ${vol} volume(s))."
