import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_addresses';
  info: {
    description: '';
    displayName: 'Address';
  };
  attributes: {
    country: Schema.Attribute.String;
    locality: Schema.Attribute.String;
    postal_code: Schema.Attribute.String;
    region: Schema.Attribute.String;
    street: Schema.Attribute.String;
  };
}

export interface SharedClosedDay extends Struct.ComponentSchema {
  collectionName: 'components_shared_closed_days';
  info: {
    description: '';
    displayName: 'Closed Day';
  };
  attributes: {
    day: Schema.Attribute.Integer;
    month: Schema.Attribute.Integer;
  };
}

export interface SharedGeoCoordinates extends Struct.ComponentSchema {
  collectionName: 'components_shared_geo_coordinates';
  info: {
    description: '';
    displayName: 'Geo Coordinates';
  };
  attributes: {
    lat: Schema.Attribute.Decimal & Schema.Attribute.Required;
    lon: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

export interface SharedMonth extends Struct.ComponentSchema {
  collectionName: 'components_shared_months';
  info: {
    description: '';
    displayName: 'Month';
  };
  attributes: {
    end_month: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      >;
    start_month: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      >;
  };
}

export interface SharedTimeRange extends Struct.ComponentSchema {
  collectionName: 'components_shared_time_ranges';
  info: {
    description: '';
    displayName: 'Time Range';
  };
  attributes: {
    from: Schema.Attribute.Integer;
    to: Schema.Attribute.Integer;
  };
}

export interface SharedWeeklyOpeningHours extends Struct.ComponentSchema {
  collectionName: 'components_shared_weekly_opening_hours';
  info: {
    description: '';
    displayName: 'Weekly Opening Hours';
  };
  attributes: {
    fr: Schema.Attribute.Component<'shared.time-range', false>;
    mo: Schema.Attribute.Component<'shared.time-range', false>;
    sa: Schema.Attribute.Component<'shared.time-range', false>;
    su: Schema.Attribute.Component<'shared.time-range', false>;
    th: Schema.Attribute.Component<'shared.time-range', false>;
    tu: Schema.Attribute.Component<'shared.time-range', false>;
    we: Schema.Attribute.Component<'shared.time-range', false>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.address': SharedAddress;
      'shared.closed-day': SharedClosedDay;
      'shared.geo-coordinates': SharedGeoCoordinates;
      'shared.month': SharedMonth;
      'shared.time-range': SharedTimeRange;
      'shared.weekly-opening-hours': SharedWeeklyOpeningHours;
    }
  }
}
