Vue.filter('toURL', function(string) {
    var w;
    var map = {
        a: /[\xE0-\xE6]/g,
        e: /[\xE8-\xEB]/g,
        i: /[\xEC-\xEF]/g,
        o: /[\xF2-\xF6]/g,
        u: /[\xF9-\xFC]/g,
        c: /\xE7/g,
        n: /\xF1/g
    };

    for (w in map) {
        string = string.replace(map[w], w);
    }

    return string.replace(/ /g, '-').toLowerCase();
});

Vue.directive('draw-tiles', function(value) {

});

var MapEditor = (function() {
    function MapEditor(w, h, x, y, layers) {
        var _this, layer, i, len;

        _this   = this;
        layer   = 'Default';
        len     = x * y;

        var vmConfig = {
            el: '#map-editor',
            data: {
                panels: {
                    selected: 'tiles',
                    tiles: {
                        selectedLayer: '',
                    },
                    collisions: {},
                    entities: {}
                },
                tiles: {
                    width: w,
                    height: h,
                    limitX: x,
                    limitY: y,
                    src: '',
                    data: []
                },
                stage: {
                    grid: {
                        visible: true,
                        tiles: []
                    },
                    collisions: {
                        visible: true,
                        tiles: []
                    },
                    layers: [],
                    mousedown: false,
                    mode: 'draw'
                }
            },
            methods: {
                selectPanel: function(e) {
                    this.panels.selected = e.target.dataset.panel;
                }
            }
        };

        for (i = 0; i < len; i++) {
            vmConfig.data.stage.grid.tiles.push({
                x: (i % vmConfig.data.tiles.limitX) * vmConfig.data.tiles.width,
                y: ~~(i / vmConfig.data.tiles.limitX) * vmConfig.data.tiles.height,
                width: vmConfig.data.tiles.width,
                height: vmConfig.data.tiles.height,
            });

            vmConfig.data.stage.collisions.tiles.push({
                x: (i % vmConfig.data.tiles.limitX) * vmConfig.data.tiles.width,
                y: ~~(i / vmConfig.data.tiles.limitX) * vmConfig.data.tiles.height,
                width: vmConfig.data.tiles.width,
                height: vmConfig.data.tiles.height,
                value: false
            });
        }

        this.$listLayers = $('#list-layers').sortable({
            axis: 'y',
            distance: 5,
            start: function(e, ui) {
                ui.item.data('start', ui.item.index());
            },
            update: function(e, ui) {
                var start = ui.item.data('start'),
                    end = ui.item.index();

                _this.vm.stage.layers.splice(end, 0, _this.vm.stage.layers.splice(start, 1)[0]);
            }
        });

        this.vm = new Vue(vmConfig);

        this.addLayer(layer);
        this.addLayer('Test 1');
        this.addLayer('Test 2');
        this.addLayer('Test 3');


        //$('#wrap-map').scrollTop(h * y);

        /*

        $('#panel .panel-content').on('click', '.tile', function(){
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
            _this.$selected = $(this);
        });

        $('#map').on('mouseover', '.tile', function() {
            $(this).attr('data-bg', $(this).css('background'));

            if (_this.$selected) {
                $(this).css({background: _this.$selected.css('background')});
            }
        });

        $('#map').on('mouseout', '.tile', function() {
            $(this).css({background: $(this).attr('data-bg') || ''});
        });

        $('#map').on('mousemove', '.tile', function() {
            if(_this.$selected){
                if(_this.mousedown){
                    $(this).css({background: _this.$selected.css('background')});
                    $(this).attr('data-bg', _this.$selected.css('background'));
                    $(this).attr('data-has-bg', 'true');
                }
            }

            if(_this.deleteMousedown){
                $(this).css({background: ''});
                $(this).attr('data-bg', '');
                $(this).attr('data-has-bg', 'false');
            }
        });

        $('#map').on('mousedown', '.tile', function(e) {
            e.preventDefault();

            if (_this.$selected) {
                if (e.which == 2) {
                    $(this).css({background: ''});
                    $(this).attr('data-bg', '');
                    $(this).attr('data-has-bg', 'false');
                } else {
                    $(this).css({background: _this.$selected.css('background')});
                    $(this).attr('data-bg', _this.$selected.css('background'));
                    $(this).attr('data-has-bg', 'true');
                }
            }
        });

        $('#map').on('.collide', 'mousedown',  function(e) {
            e.preventDefault();

            if (e.which == 2) {
                $(this).remove();
            }
        });

        $(document).on('mousedown', function(e) {
            if ($(e.target).is('.tile')) {
                e.preventDefault();

                if (e.which == 1) {
                    _this.mousedown = true;
                } else if (e.which == 2) {
                    _this.deleteMousedown = true;
                }
            }
        }).on('mouseup', function(e){
            e.preventDefault();
            if (e.which == 1){
                _this.mousedown = false;
            } else if (e.which == 2) {
                _this.deleteMousedown = false;
            }
        });
        */
    }

    MapEditor.prototype.addLayer = function(layerTitle) {
        var len = this.vm.tiles.limitX * this.vm.tiles.limitY;
        var i;

        var layer = {
            title: layerTitle,
            visible: true,
            tiles: []
        };

        for (i = 0; i < len; i++) {
            layer.tiles.push({
                x: (i % this.vm.tiles.limitX) * this.vm.tiles.width,
                y: ~~(i / this.vm.tiles.limitX) * this.vm.tiles.height,
                width: this.vm.tiles.width,
                height: this.vm.tiles.height,
                value: false
            });
        }

        this.vm.stage.layers.push(layer);

        if (!this.vm.panels.tiles.selectedLayer) {
            this.vm.panels.tiles.selectedLayer = layerTitle;
        }

        this.$listLayers.sortable('refresh');
    }

    MapEditor.prototype.addTile = function(tileFile) {
        var _this = this,
            _img = new Image(),
            limitX = 0,
            limitY = 0,
            limit = 0;

        _img.onload = function() {
            _this.vm.tiles.src = tileFile;

            var limitX  = ~~(this.width / _this.vm.tiles.width);
            var limitY  = ~~(this.height / _this.vm.tiles.height);
            var len     = limitX * limitY;
            var i;

            for (i = 0; i < len; i++) {
                _this.vm.tiles.data.push({
                    x: (i % limitX) * _this.vm.tiles.width,
                    y: ~~(i / limitX) * _this.vm.tiles.height
                });
            }
        }

        _img.src = tileFile;
    }

    MapEditor.prototype.export = function() {

    }

    return MapEditor;
})();
