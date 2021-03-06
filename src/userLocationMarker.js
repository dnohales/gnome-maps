/* -*- Mode: JS2; indent-tabs-mode: nil; js2-basic-offset: 4 -*- */
/* vim: set et ts=4 sw=4: */
/*
 * Copyright (c) 2014 Damián Nohales
 *
 * GNOME Maps is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * GNOME Maps is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with GNOME Maps; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Damián Nohales <damiannohales@gmail.com>
 */

const Clutter = imports.gi.Clutter;
const Champlain = imports.gi.Champlain;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const MapMarker = imports.mapMarker;
const UserLocationBubble = imports.userLocationBubble;
const Utils = imports.utils;
const Path = imports.path;
const _ = imports.gettext.gettext;

const AccuracyCircleMarker = new Lang.Class({
    Name: 'AccuracyCircleMarker',
    Extends: Champlain.Point,

    _init: function(params) {
        this.parent();

        this._place = params.place;

        this.set_color(new Clutter.Color({ red: 0,
                                           blue: 255,
                                           green: 0,
                                           alpha: 50 }));
        this.set_location(this._place.location.latitude,
                          this._place.location.longitude);
        this.set_reactive(false);
    },

    refreshGeometry: function(view) {
        let zoom = view.get_zoom_level();
        let source = view.get_map_source();
        let metersPerPixel = source.get_meters_per_pixel(zoom,
                                                         this.get_latitude(),
                                                         this.get_longitude());
        let size = this._place.location.accuracy * 2 / metersPerPixel;
        let viewWidth = view.get_width();
        let viewHeight = view.get_height();

        if ((viewWidth > 0 && viewHeight > 0) &&
            (size > viewWidth && size > viewHeight))
            this.hide();
        else {
            this.set_size(size);
            this.show();
        }
    }
});

const UserLocationMarker = new Lang.Class({
    Name: 'UserLocation',
    Extends: MapMarker.MapMarker,

    _init: function(params) {
        this.parent(params);

        let iconActor = Utils.CreateActorFromImageFile(Path.ICONS_DIR + "/user-location.png");
        if (!iconActor)
            return;

        this.add_actor(iconActor);

        if (this._place.location.accuracy !== 0) {
            this._accuracyMarker = new AccuracyCircleMarker({ place: this._place });
            this._accuracyMarker.refreshGeometry(this._view);
            this._zoomLevelId = this._view.connect("notify::zoom-level",
                                                   this._accuracyMarker.refreshGeometry.bind(this._accuracyMarker));
        } else {
            this._accuracyMarker = null;
        }

        this._translateMarkerPosition();
    },

    _getMarkerPositionTranslationData: function() {
        return [
            -Math.floor(this.get_width() / 2),
            -Math.floor(this.get_height() / 2),
            0
        ];
    },

    _getBubblePositionTranslationData: function() {
        return [
            Math.floor(this.get_width() / 2),
            3
        ];
    },

    _createBubble: function() {
        return new UserLocationBubble.UserLocationBubble({
            place: this._place,
            mapView: this._mapView
        });
    },

    addToLayer: function(layer) {
        this.parent(layer);

        if (this._accuracyMarker != null) {
            layer.add_marker(this._accuracyMarker);
        }
    }
});
