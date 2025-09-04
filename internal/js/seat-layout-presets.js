/**
 * Seat Layout Presets
 * This file contains predefined seat layout configurations for different cinema room types
 */

const SeatLayoutPresets = {
    /**
     * Small cinema layout - single section
     * - 8 rows x 12 columns
     * - VIP seats in the middle
     * - Premium seats in front center
     */
    small: {
        rows: 8,
        columns: 12,
        sections: 1,
        pattern: function(layout) {
            const rows = layout.length;
            const columns = layout[0].length;
            
            // VIP seats (middle rows)
            const vipStartRow = 2;
            const vipEndRow = 6;
            
            // Premium seats (front center)
            const premiumStartCol = 3;
            const premiumEndCol = 9;
            
            // Apply seat types
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (i >= vipStartRow && i < vipEndRow && j >= 1 && j < columns - 1) {
                        layout[i][j].type = 'vip';
                    }
                    
                    if (i < 2 && j >= premiumStartCol && j < premiumEndCol) {
                        layout[i][j].type = 'premium';
                    }
                    
                    // Add sweet-box seats in the back
                    if (i === rows - 1 && (j === 0 || j === columns - 1)) {
                        layout[i][j].type = 'sweet-box';
                    }
                }
            }
            
            return layout;
        }
    },
    
    /**
     * Medium cinema layout - two sections with aisle
     * - 12 rows x 16 columns
     * - Center aisle
     * - VIP seats in the middle rows
     * - Premium seats in front center
     */
    medium: {
        rows: 12,
        columns: 16,
        sections: 2,
        pattern: function(layout) {
            const rows = layout.length;
            const columns = layout[0].length;
            
            // VIP seats (middle rows)
            const vipStartRow = 3;
            const vipEndRow = 9;
            
            // Premium seats (front center)
            const premiumStartCol = 4;
            const premiumEndCol = 12;
            
            // Center aisle
            const aisleCol = Math.floor(columns / 2) - 1;
            
            // Apply seat types
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    // Create center aisle
                    if (j === aisleCol || j === aisleCol + 1) {
                        layout[i][j].type = 'empty';
                        continue;
                    }
                    
                    // VIP seats
                    if (i >= vipStartRow && i < vipEndRow && 
                        (j < aisleCol - 1 || j > aisleCol + 2)) {
                        layout[i][j].type = 'vip';
                    }
                    
                    // Premium seats
                    if (i < 3 && ((j >= premiumStartCol && j < aisleCol) || 
                                   (j > aisleCol + 1 && j < premiumEndCol))) {
                        layout[i][j].type = 'premium';
                    }
                    
                    // Sweet-box seats
                    if ((i === rows - 1 || i === rows - 2) && 
                        (j === 0 || j === columns - 1)) {
                        layout[i][j].type = 'sweet-box';
                    }
                }
            }
            
            return layout;
        }
    },
    
    /**
     * Large cinema layout - three sections with aisles
     * - 15 rows x 20 columns
     * - Two aisles creating three sections
     * - VIP seats in middle rows
     * - Premium seats in front center
     * - Sweet-box seats in strategic locations
     */
    large: {
        rows: 15,
        columns: 20,
        sections: 3,
        pattern: function(layout) {
            const rows = layout.length;
            const columns = layout[0].length;
            
            // VIP seats (middle rows)
            const vipStartRow = 4;
            const vipEndRow = 11;
            
            // Premium seats (front center)
            const premiumStartRow = 0;
            const premiumEndRow = 3;
            
            // Aisles
            const aisle1Col = Math.floor(columns / 3) - 1;
            const aisle2Col = Math.floor(columns * 2 / 3);
            
            // Apply seat types
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    // Create aisles
                    if (j === aisle1Col || j === aisle1Col + 1 || 
                        j === aisle2Col || j === aisle2Col + 1) {
                        layout[i][j].type = 'empty';
                        continue;
                    }
                    
                    // VIP seats (middle rows, all sections)
                    if (i >= vipStartRow && i < vipEndRow) {
                        layout[i][j].type = 'vip';
                    }
                    
                    // Premium seats (front rows, center section)
                    if (i >= premiumStartRow && i < premiumEndRow && 
                        j > aisle1Col + 1 && j < aisle2Col) {
                        layout[i][j].type = 'premium';
                    }
                    
                    // Sweet-box seats (strategic corners)
                    if (((i === 0 || i === rows - 1) && (j === 0 || j === columns - 1)) ||
                        ((i === Math.floor(rows / 2)) && (j === 0 || j === columns - 1))) {
                        layout[i][j].type = 'sweet-box';
                    }
                }
            }
            
            return layout;
        }
    }
};

export default SeatLayoutPresets;
