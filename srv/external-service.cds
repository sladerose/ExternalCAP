using { cuid } from '@sap/cds/common';

service ExternalService {

    entity FileActivityLog {
        key ID : UUID; // log_id
        event_description : String;
        event_status : String;
        event_time : String;
        event_type : String;
        file_name : String;
        file_path : String;
        file_type : String;
        created_at : String;
        station_id_station_id : UUID;
        tenant_id_tenant_id : UUID;
    }

    @ReadOnly
    entity SitesDown {
        key site_id : String;
        station_name : String;
        last_file_activity_time : String;
        downtime_duration : String;
        downtime_hours : Decimal(9,2); // Numeric for charts
        virtual criticality : Integer;
    }

    @ReadOnly
    entity SiteFilePulse {
        key station_id : String;
        station_name : String;
        province : String;
        last_pos : String;
        last_bors : String;
        last_delivs : String;
        last_site_sta : String;
    }

    @ReadOnly
    entity SiteReliability {
        key station_name : String;
        incidents_last_7_days : Integer;
        reliability_status : String;
    }

    @ReadOnly
    entity RegionalHealth {
        key province : String;
        key zone : String;
        total_sites : Integer;
        sites_down : Integer;
        uptime_percentage : Decimal(5,2);
    }

    @ReadOnly
    entity DuplicateFileAudit {
        key file_name : String;
        key station_id_station_id : String;
        processing_count : Integer;
        first_seen : String;
        last_seen : String;
    }

    function GetSequenceGaps(station_id: String, file_type: String) returns array of {
        gap_after_seq : Decimal(18,0);
        missing_count : Decimal(18,0);
    };
}
