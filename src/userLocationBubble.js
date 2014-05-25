const Lang = imports.lang;

const MapBubble = imports.mapBubble;
const MapMarker = imports.mapMarker;
const Utils = imports.utils;

const UserLocationBubble = new Lang.Class({
    Name: "UserLocationBubble",
    Extends: MapBubble.MapBubble,

    _init: function(params) {
        this.parent(params);

        let ui = Utils.getUIObject('user-location-bubble', [
            'box',
            'label-accuracy',
            'label-coordinates'
        ]);

        ui.labelAccuracy.label = ui.labelAccuracy.label.format(MapMarker.getAccuracyDescription(this._place.location.accuracy));
        ui.labelCoordinates.label = this.getPlace().location.latitude
                                  + ', '
                                  + this.getPlace().location.longitude;

        this.add(ui.box);
    }
});