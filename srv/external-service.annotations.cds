using ExternalService from './external-service';

annotate ExternalService.FileActivityLog with @(
    UI: {
        HeaderInfo: {
            TypeName: 'Log Entry',
            TypeNamePlural: 'Log Entries',
            Title: { Value: file_name },
            Description: { Value: event_description }
        },
        LineItem: [
            { Value: event_time, Label: 'Time' },
            { Value: event_status, Label: 'Status', Criticality: #Information }, 
            { Value: event_type, Label: 'Event Type' },
            { Value: file_name, Label: 'File Name' },
            { Value: file_type, Label: 'File Type' },
            { Value: event_description, Label: 'Description' }
        ],
        SelectionFields: [ event_status, event_type, file_name, file_type ],
        
        // Add a facet for the object page to show details
        Facets: [
            {
                $Type: 'UI.ReferenceFacet',
                Label: 'Event Details',
                Target: '@UI.FieldGroup#Details'
            }
        ],
        FieldGroup#Details: {
            Data: [
                { Value: ID, Label: 'Log ID' },
                { Value: created_at, Label: 'Created At' },
                { Value: station_id_station_id, Label: 'Station ID' },
                { Value: tenant_id_tenant_id, Label: 'Tenant ID' }
            ]
        }
    }
);

annotate ExternalService.SitesDown with @(
    UI: {
        HeaderInfo: {
            TypeName: 'Site Down',
            TypeNamePlural: 'Sites Down',
            Title: { Value: station_name },
            Description: { Value: downtime_duration },
            TypeImageUrl: 'sap-icon://alert'
        },
        LineItem: [
            { Value: station_name, Label: 'Station Name', Criticality: criticality },
            { Value: downtime_duration, Label: 'Downtime Duration', Criticality: criticality },
            { Value: last_file_activity_time, Label: 'Last Activity' }
        ],
        SelectionFields: [ station_name ],
        
        // Define the Chart
        Chart: {
             Title: 'Downtime by Station',
             ChartType: #Bar,
             Dimensions: [ station_name ],
             Measures: [ downtime_hours ],
             MeasureAttributes: [
                 { Measure: downtime_hours, Role: #Axis1 }
             ],
             DimensionAttributes: [
                 { Dimension: station_name, Role: #Category }
             ]
        },

        SelectionPresentationVariant: {
            Text: 'Default',
            PresentationVariant: {
                SortOrder: [ { Property: downtime_duration, Descending: true } ],
                Visualizations: [ '@UI.LineItem' ]
            },
            SelectionVariant: {
                SelectOptions: []
            }
        },

        // Default Presentation (Chart + Table)
        // SelectionPresentationVariant: {
        //     Text: 'Default',
        //     PresentationVariant: {
        //         SortOrder: [ { Property: downtime_hours, Descending: true } ],
        //         Visualizations: [ '@UI.Chart', '@UI.LineItem' ]
        //     },
        //     SelectionVariant: {
        //         SelectOptions: []
        //     }
        // },

        PresentationVariant: {
            SortOrder: [
                { Property: downtime_duration, Descending: true }
            ]
        }
    }
);

