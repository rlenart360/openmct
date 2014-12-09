/*global define*/

define(
    [],
    function () {
        "use strict";

        /**
         * Handles drag interactions on frames in layouts. This will
         * provides new positions/dimensions for frames based on
         * relative pixel positions provided; these will take into account
         * the grid size (in a snap-to sense) and will enforce some minimums
         * on both position and dimensions.
         *
         * The provided position and dimensions factors will determine
         * whether this is a move or a resize, and what type of resize it
         * will be. For instance, a position factor of [1, 1]
         * will move a frame along with the mouse as the drag
         * proceeds, while a dimension factor of [0, 0] will leave
         * dimensions unchanged. Combining these in different
         * ways results in different handles; a position factor of
         * [1, 0] and a dimensions factor of [-1, 0] will implement
         * a left-edge resize, as the horizontal position will move
         * with the mouse while the horizontal dimensions shrink in
         * kind (and vertical properties remain unmodified.)
         *
         * @param {object} rawPosition the initial position/dimensions
         *                 of the frame being interacted with
         * @param {number[]} posFactor the position factor
         * @param {number[]} dimFactor the dimensions factor
         * @param {number[]} the size of each grid element, in pixels
         */
        function LayoutDrag(rawPosition, posFactor, dimFactor, gridSize) {
            // Convert a delta from pixel coordinates to grid coordinates,
            // rounding to whole-number grid coordinates.
            function toGridDelta(pixelDelta) {
                return pixelDelta.map(function (v, i) {
                    return Math.round(v / gridSize[i]);
                });
            }

            // Utility function to perform element-by-element multiplication
            function multiply(array, factors) {
                return array.map(function (v, i) {
                    return v * factors[i];
                });
            }

            // Utility function to perform element-by-element addition
            function add(array, other) {
                return array.map(function (v, i) {
                    return v + other[i];
                });
            }

            // Utility function to perform element-by-element max-choosing
            function max(array, other) {
                return array.map(function (v, i) {
                    return Math.max(v, other[i]);
                });
            }

            function getAdjustedPosition(pixelDelta) {
                var gridDelta = toGridDelta(pixelDelta);
                return {
                    position: max(add(
                        rawPosition.position,
                        multiply(gridDelta, posFactor)
                    ), [0, 0]),
                    dimensions: max(add(
                        rawPosition.dimensions,
                        multiply(gridDelta, dimFactor)
                    ), [1, 1])
                };

            }

            return {
                /**
                 * Get a new position object in grid coordinates, with
                 * position and dimensions both offset appropriately
                 * according to the factors supplied in the constructor.
                 * @param {number[]} pixelDelta the offset from the
                 *        original position, in pixels
                 */
                getAdjustedPosition: getAdjustedPosition
            };
        }

        return LayoutDrag;

    }
);