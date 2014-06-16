var MapEditor = (function(){
    function MapEditor(w, h, x, y, layers){
        layers = layers || ['Background', 'Ground', 'Foreground'];

        var _this               = this,
            i;
        this.$selected          = null;
        this.limit              = x * y;
        this.width              = w;
        this.height             = h;
        this.limitX             = x;
        this.limitY             = y;
        this.panelIndex         = 0;
        this.mousedown          = false;
        this.deleteMousedown    = false;

        $('#map').css({
            height: h * y,
            width: w * x
        });

        $('#wrap-map').scrollTop(h * y);

        for(i = 0; i < layers.length; i++){
            $('#map').append('<div data-layer="'+layers[i]+'"></div>');
            $('#select-layers').append('<option value="'+layers[i]+'">'+layers[i]+'</option>');
        }

        for(i = 0; i < this.limit; i++){
            $('#map > div').each(function(){
                $(this).append('<div class="tile" style="width:'+_this.width+'px; height:'+_this.height+'px; position: absolute; top:'+(~~(i/_this.limitX) * _this.height)+'px; left:'+(i%_this.limitX * _this.width)+'px;"></div>')
            });
        }

        $('#ckb-grid').on('change', function(){
            if($(this).is(':checked')){
                $('#map .grid').addClass('grid-show');
            }else{
                $('#map .grid').removeClass('grid-show');
            }
        }).trigger('change');


        $('#select-layers').on('change', function(){
            if($(this).is(':checked')){
                $('#map .grid').addClass('grid-show');
            }else{
                $('#map .grid').removeClass('grid-show');
            }
        }).trigger('change');

        $('#panel').on('click', '.body', function(){
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
            _this.$selected = $(this);
        });

        $('#panel-top li a').on('click', function(){
            $('#panel-top li a').parent().removeClass('active');
            $(this).parent().addClass('active');

            $('#panel > [id^=panel]').hide();
            $($(this).attr('href')).show();

            if($(this).attr('href') == '#panel-collision')
                $('body').addClass('panel-collision');
            else
                $('body').removeClass('panel-collision');

            $('.selected').removeClass('selected');
            _this.$selected = null;

            return false;
        });

        $('#map').on('mouseover', '.tile', function() {
            $(this).attr('data-bg', $(this).css('background'));

            if (_this.$selected) {
                $(this).css({background: _this.$selected.css('background'), opacity: .8});
            }
        });

        $('#map').on('mouseout', '.tile', function() {
            $(this).css({background: $(this).attr('data-bg') || '', opacity: 1});
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

        $('#panel .collide').css({width: w, height: h}).on('click', function(e) {

        });

        $('#panel-top li a:eq(0)').trigger('click');
    }

    MapEditor.prototype.add = function(tileFile) {
        var img = new Image();
        var limitX = 0, limitY = 0, limit = 0, _this = this;
        img.onload = function() {
            limitX = this.width / _this.width;
            limitY = this.height / _this.height;
            limit += limitX * limitY;

            draw();
        }
        img.src = tileFile;

        function draw() {
            for(var i = _this.panelIndex; i < limit; i++){
                $('#panel-tile').append('<div class="body" style="background: url('+tileFile+') no-repeat -'+(i%limitX * _this.width)+'px -'+(~~(i/limitX) * _this.height)+'px; width:'+_this.width+'px; height:'+_this.height+'px; float: left; margin: 1px;"></div>')
            }
            _this.panelIndex = i;
        }
    }

    MapEditor.prototype.export = function() {
        var $map = $('#map').clone();
        $map.find('.tile').each(function() {
                var data = $(this).attr('data-has-bg');
                if (!data || data == 'false') {
                    $(this).remove();
                }
            })
            .removeAttr('class')
            .removeAttr('data-bg')
            .removeAttr('data-has-bg');

        $map.find('.collide').each(function() {
                 $('> *', this).remove();
            })
            .removeAttr('class')
            .removeAttr('data-body-initialized');

        $('#modal-export textarea').val($map.html());

        $('#modal-export').modal();

        return $map.html();
    }

    return MapEditor;
})();
