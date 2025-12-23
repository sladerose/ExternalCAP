const cds = require('@sap/cds');
const axios = require('axios');

module.exports = cds.service.impl(async function () {
    const { FileActivityLog } = this.entities;
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbG95emFnc2Fub3psdmpuc3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODAxNzUsImV4cCI6MjA4MDg1NjE3NX0.ksPkm69lpjRCPADhVI4vsAxQbvzNxrRSAYcdnx_duNg';

    this.on('READ', FileActivityLog, async (req) => {
        try {
            const SUPABASE_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/astron_file_activity_log';
            const response = await axios.get(SUPABASE_URL, {
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` },
                params: { select: '*' }
            });
            return response.data.map(log => ({
                ID: log.log_id,
                event_description: log.event_description,
                event_status: log.event_status,
                event_time: log.event_time ? new Date(log.event_time).toISOString() : null,
                event_type: log.event_type,
                file_name: log.file_name,
                file_path: log.file_path,
                file_type: log.file_type,
                created_at: log.created_at ? new Date(log.created_at).toISOString() : null,
                station_id_station_id: log.station_id_station_id,
                tenant_id_tenant_id: log.tenant_id_tenant_id
            }));
        } catch (error) {
            req.error(500, 'Unable to fetch logs');
        }
    });

    this.on('READ', 'SitesDown', async (req) => {
        try {
            const SUPABASE_RPC_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/rpc/get_sites_down_last_6_hours_with_downtime';
            const response = await axios.post(SUPABASE_RPC_URL, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            if (!response.data || !Array.isArray(response.data)) return [];

            return response.data.map(site => {
                let matchHours = 0;
                if (site.last_file_activity_time) {
                    const lastActive = new Date(site.last_file_activity_time);
                    const now = new Date();
                    const diffMs = now - lastActive;
                    matchHours = diffMs / (1000 * 60 * 60);
                }
                return {
                    site_id: site.site_id,
                    station_name: site.station_name || 'Unknown',
                    last_file_activity_time: site.last_file_activity_time ? new Date(site.last_file_activity_time).toISOString() : null,
                    downtime_duration: site.downtime_duration || 'N/A',
                    downtime_hours: parseFloat((matchHours || 0).toFixed(2)),
                    criticality: 1
                };
            });
        } catch (error) {
            console.error('SitesDown Error:', error.message);
            req.error(500, 'Unable to fetch sites down');
        }
    });

    this.on('READ', 'SiteFilePulse', async (req) => {
        try {
            const SUPABASE_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/view_site_file_pulse';
            const response = await axios.get(SUPABASE_URL, {
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
            });
            return response.data.map(item => ({
                station_id: item.station_id,
                station_name: item.station_name,
                province: item.province,
                last_pos: item.last_pos ? new Date(item.last_pos).toISOString() : null,
                last_bors: item.last_bors ? new Date(item.last_bors).toISOString() : null,
                last_delivs: item.last_delivs ? new Date(item.last_delivs).toISOString() : null,
                last_site_sta: item.last_site_sta ? new Date(item.last_site_sta).toISOString() : null
            }));
        } catch (error) {
            req.error(500, 'Unable to fetch SiteFilePulse');
        }
    });

    this.on('READ', 'SiteReliability', async (req) => {
        try {
            const SUPABASE_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/view_site_reliability_report';
            const response = await axios.get(SUPABASE_URL, {
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
            });
            return response.data;
        } catch (error) {
            req.error(500, 'Unable to fetch SiteReliability');
        }
    });

    this.on('READ', 'RegionalHealth', async (req) => {
        try {
            const SUPABASE_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/view_regional_health';
            const response = await axios.get(SUPABASE_URL, {
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
            });
            return response.data;
        } catch (error) {
            req.error(500, 'Unable to fetch RegionalHealth');
        }
    });

    this.on('READ', 'DuplicateFileAudit', async (req) => {
        try {
            const SUPABASE_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/view_duplicate_file_audit';
            const response = await axios.get(SUPABASE_URL, {
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
            });
            return response.data.map(item => ({
                file_name: item.file_name,
                station_id_station_id: item.station_id_station_id,
                processing_count: item.processing_count,
                first_seen: item.first_seen ? new Date(item.first_seen).toISOString() : null,
                last_seen: item.last_seen ? new Date(item.last_seen).toISOString() : null
            }));
        } catch (error) {
            req.error(500, 'Unable to fetch DuplicateFileAudit');
        }
    });

    this.on('GetSequenceGaps', async (req) => {
        try {
            const { station_id, file_type } = req.data;
            const SUPABASE_RPC_URL = 'https://jlloyzagsanozlvjnsuy.supabase.co/rest/v1/rpc/get_site_sequence_gaps';
            const response = await axios.post(SUPABASE_RPC_URL, {
                param_station_id: station_id,
                param_file_type: file_type
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            return response.data;
        } catch (error) {
            req.error(500, 'Unable to fetch GetSequenceGaps');
        }
    });
});
