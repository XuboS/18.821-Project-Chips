var tableSize = 7
var frequency = 100;

/**
 * Dynamically creates the table structure in DOM.
 *
 * @param {tableSize} table created will be size X size
 */
function createTable(tableSize) {
    for (var i = 0; i < tableSize; i++) {
        var row = $("<tr class='row'>").appendTo("#grid");
        for (var j = 0; j < tableSize; j++) {
            // Label the cells with increasing numbers.
            row.append("<td class='cell' num='"+(i*tableSize+j)+"'></td>\n");
        }
        row.append("</tr>\n");
    }
}

$(function () {
    createTable(tableSize);
    var g = grid(tableSize);

    // Update each entry in the table based on the status of the corresponding cell in the grid model
    var rebuildTable = function() {
        var printed = g.printGrid();
        for (var r = 0; r < tableSize; r++) {
            for (var c = 0; c < tableSize; c++) {
                var num = r*tableSize+c;
                var numChips = printed[r][c];
                $(".cell[num='"+num+"']").empty();
                $(".cell[num='"+num+"']").removeClass('more');
                $(".cell[num='"+num+"']").removeClass('one');
                $(".cell[num='"+num+"']").removeClass('two');
                $(".cell[num='"+num+"']").removeClass('three');
                if (numChips > 0) {
                    // Write the number of chips in the cell
                    $(".cell[num='"+num+"']").html(numChips);
                    if (numChips >= 4) {
                        $(".cell[num='"+num+"']").addClass('more');
                    } else if (numChips == 3) {
                        $(".cell[num='"+num+"']").addClass('three');    
                    } else if (numChips == 2) {
                        $(".cell[num='"+num+"']").addClass('two');    
                    } else if (numChips == 1) {
                        $(".cell[num='"+num+"']").addClass('one');    
                    }
                }
            }
        }
    }

    // Subscribe to the changes in the underlying grid model
    g.subscribe(function(){
        rebuildTable();
    });
    
    var automation;
    // When the start button is clicked, the grid is updated every (frequency/1000) seconds
    $('#start').click(function() {
        console.log(frequency);
        automation = window.setInterval(g.updateGrid, frequency);
    });

    // When the stop button is clicked, the grid stops updating.
    $('#stop').click(function() {
        clearInterval(automation);
    });

    $('#next').click(function() {
        g.updateGrid();
    })

    $('#previous').click(function() {
        g.stepBackGrid();
    })

    $('#frequency').change(function() {
        frequency = $( "#frequency" ).val();
        return false;
    })

    // When a preset button is clicked, the underlying grid switches to the specific preset configuration.
    $('.preset').click(function() {
        g.chooseGrid($(this).attr('id'));
    });

    // When an entry is clicked, the corresponding cell in the underlying model gets updated (i.e., values increased by 1).
    $('.cell').click(function() {
        var num = $(this).attr('num');
        // console.log(num);
        g.updateCell((num-num%tableSize)/tableSize, num%tableSize, 1);
    });
    rebuildTable();
});

